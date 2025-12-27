#!/bin/bash
# 使用 gunicorn + uvicorn 启动 FastAPI 应用脚本

# 设置工作目录
cd "$(dirname "$0")"

# 设置默认端口
export PORT=${PORT:-8080}

# 使用 uv 运行 gunicorn
# -k uvicorn.workers.UvicornWorker: 使用 uvicorn worker 处理异步请求
# -w 2: 启动 2 个 worker 进程（可根据服务器配置调整）
# -b 0.0.0.0:8080: 绑定所有网络接口的 8080 端口
# --timeout 120: 设置超时时间为 120 秒
# --access-logfile -: 访问日志输出到标准输出
# --error-logfile -: 错误日志输出到标准错误
# --log-level info: 日志级别为 info
uv run gunicorn \
    -k uvicorn.workers.UvicornWorker \
    -w 2 \
    -b 0.0.0.0:${PORT} \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    main:app