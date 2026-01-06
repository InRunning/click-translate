import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class GuestLoginRequest(BaseModel):
    device_id: str | None = Field(default=None, max_length=128)
    ext_version: str | None = Field(default=None, max_length=32)


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _jwt_encode_hs256(payload: dict[str, Any], *, secret: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{header_b64}.{payload_b64}.{_base64url_encode(signature)}"


def _get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if secret:
        return secret
    return "dev-secret-change-me"


def _generate_guest_user_id(device_id: str | None, *, secret: str) -> int:
    if device_id:
        digest = hashlib.sha256(f"{secret}:{device_id}".encode("utf-8")).digest()
        value = int.from_bytes(digest[:8], "big") & ((1 << 63) - 1)
        return value or 1
    return secrets.randbits(63) or 1


@router.post("/guest-login")
def guest_login(req: GuestLoginRequest) -> dict[str, Any]:
    jwt_secret = _get_jwt_secret()
    user_id = _generate_guest_user_id(req.device_id, secret=jwt_secret)

    now = int(time.time())
    expires_in = int(os.getenv("GUEST_ACCESS_TTL_SECONDS", "86400"))
    payload = {
        "sub": str(user_id),
        "typ": "access",
        "login_type": "guest",
        "iat": now,
        "exp": now + expires_in,
        "device_id": req.device_id,
        "ext_version": req.ext_version,
    }

    access_token = _jwt_encode_hs256(payload, secret=jwt_secret)
    return {
        "code": 0,
        "message": "ok",
        "data": {
            "user_id": user_id,
            "login_type": "guest",
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": expires_in,
        },
    }
