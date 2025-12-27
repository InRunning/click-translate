import os
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import requests
import yaml
from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse


BASE_DIR = Path(__file__).resolve().parent
CONFIG_PATH = BASE_DIR / "local.yaml"


def _resolve_env(value: Optional[str]) -> Optional[str]:
    """
    支持类似 ${ENV_NAME} 的占位符，从环境变量中读取真实值。
    """
    if not isinstance(value, str):
        return value
    value = value.strip()
    if value.startswith("${") and value.endswith("}"):
        env_name = value[2:-1]
        return os.getenv(env_name)
    return value


def load_relay_config() -> Dict[str, Any]:
    """
    从 backend/local.yaml 中加载 Relay 配置，并做一次简单的校验。
    """
    if not CONFIG_PATH.exists():
        raise RuntimeError(f"配置文件不存在: {CONFIG_PATH}")

    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        raw = yaml.safe_load(f) or {}

    relay = raw.get("Relay") or {}

    url = _resolve_env(relay.get("Url"))
    if not url:
        raise RuntimeError("Relay.Url 未配置")

    # ApiKey 优先从占位符或直接字符串解析，其次退回环境变量 RELAY_API_KEY
    api_key = _resolve_env(relay.get("ApiKey")) or os.getenv("RELAY_API_KEY")
    if not api_key:
        raise RuntimeError("未找到 Relay.ApiKey 或环境变量 RELAY_API_KEY")

    config: Dict[str, Any] = {
        "url": url,
        "api_key": api_key,
        "model": relay.get("Model", "DeepSeek-V3"),
        "temperature": relay.get("Temperature", 0),
        "default_stream": bool(relay.get("Stream", False)),
        "cache": bool(relay.get("Cache", True)),
    }
    return config


RELAY_CONFIG = load_relay_config()

app = FastAPI(title="Click Translate Relay", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    # 为方便本地调试，这里放开所有 Origin，如需收紧可以改为:
    # ["http://localhost:5173", "chrome-extension://*"]
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_upstream_body(body: Dict[str, Any]) -> Tuple[Dict[str, Any], bool]:
    """
    将客户端传入的 body 与本地 Relay 配置合并，得到转发给上游的大模型请求体。

    返回值：
      - upstream_body: 实际发给上游的 JSON
      - stream: 是否按流式转发（影响 requests 的 stream 参数与下游响应形态）
    """
    cfg = RELAY_CONFIG
    upstream_body: Dict[str, Any] = dict(body or {})

    # 模型：客户端未指定时使用本地默认 Model
    if not upstream_body.get("model"):
        upstream_body["model"] = cfg.get("model")

    # 温度：客户端未指定时使用本地默认 Temperature
    if "temperature" not in upstream_body and cfg.get("temperature") is not None:
        upstream_body["temperature"] = cfg["temperature"]

    # 流式：客户端可覆盖默认配置
    stream = upstream_body.get("stream", cfg.get("default_stream", False))
    upstream_body["stream"] = bool(stream)

    # 确保不会透传任何 api_key 字段
    upstream_body.pop("api_key", None)
    upstream_body.pop("apiKey", None)

    return upstream_body, bool(stream)


def _forward_to_upstream(body: Dict[str, Any]) -> Response:
    """
    统一的大模型转发函数：
    - 根据 Relay 配置拼装请求头
    - 支持普通 JSON 返回和流式转发（SSE/Chunk）
    """
    cfg = RELAY_CONFIG
    upstream_body, stream = _build_upstream_body(body)

    headers = {
        "Content-Type": "application/json",
        # ModelArts MaaS / OpenAI 风格接口普遍使用 Bearer 鉴权
        "Authorization": f"Bearer {cfg['api_key']}",
    }

    try:
        upstream = requests.post(
            cfg["url"],
            json=upstream_body,
            headers=headers,
            timeout=60,
            stream=stream,
        )
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"转发到上游模型失败: {exc}",
        ) from exc

    # 非 2xx 先尝试直接返回上游错误文本
    if upstream.status_code >= 400 and not stream:
        text = upstream.text
        upstream.close()
        raise HTTPException(status_code=upstream.status_code, detail=text)

    # 流式场景：直接把上游的字节流转发给客户端（不修改内容）
    if stream:
        if upstream.status_code >= 400:
            text = upstream.text
            upstream.close()
            raise HTTPException(status_code=upstream.status_code, detail=text)

        def iter_stream():
            try:
                for chunk in upstream.iter_content(chunk_size=1024):
                    if chunk:
                        yield chunk
            finally:
                upstream.close()

        return StreamingResponse(
            iter_stream(),
            status_code=upstream.status_code,
            media_type=upstream.headers.get(
                "content-type", "application/octet-stream"
            ),
        )

    # 非流式：原样透传上游响应（JSON / 其他 Content-Type）
    content_type = upstream.headers.get("content-type", "application/json")
    content = upstream.content
    status_code = upstream.status_code
    upstream.close()

    return Response(content=content, status_code=status_code, media_type=content_type)


@app.get("/healthz")
@app.get("/api/v1/healthz")
def healthz() -> Dict[str, str]:
    """
    健康检查接口，方便本地和线上探活。
    """
    return {"status": "ok"}


@app.post("/api/v1/relay/chat/completions")
def relay_chat_completions(body: Dict[str, Any] = Body(...)) -> Response:
    """
    兼容 OpenAI Chat Completions 风格的反向代理：
    - 请求体直接沿用客户端传入的字段（model/messages/temperature/stream 等）
    - Model / Temperature / Stream 的默认值由 backend/local.yaml 中 Relay 段决定
    - 不透传任何 api_key / apiKey 字段
    """
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="请求体必须为 JSON 对象")
    return _forward_to_upstream(body)


@app.post("/api/v1/relay/prompt")
def relay_simple_prompt(payload: Dict[str, Any] = Body(...)) -> Response:
    """
    简化版接口：仅传入一个 prompt（以及可选的 system 提示），
    服务端自动拼装 Chat Completions 的 messages。

    请求示例：
    {
      "prompt": "请帮我把这句话翻译成英文：你好世界",
      "system": "You are a translation assistant.",
      "model": "DeepSeek-V3",
      "stream": true
    }
    """
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="请求体必须为 JSON 对象")

    prompt = payload.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        raise HTTPException(status_code=400, detail="prompt 字段必填且需为非空字符串")

    system_prompt = payload.get("system") or payload.get("system_prompt")

    messages = []
    if isinstance(system_prompt, str) and system_prompt.strip():
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    body: Dict[str, Any] = {
        "messages": messages,
    }

    # 允许前端通过 payload 覆盖部分参数
    for field in ("model", "temperature", "stream", "max_tokens", "top_p"):
        if field in payload:
            body[field] = payload[field]

    return _forward_to_upstream(body)


if __name__ == "__main__":
    # 本地直接运行：python backend/main.py
    import uvicorn

    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
