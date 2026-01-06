import base64
from datetime import datetime, timezone
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.user import ClickUser
from utils.db import get_db


router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


class GuestLoginRequest(BaseModel):
    device_id: str | None = Field(default=None, max_length=128)
    ext_version: str | None = Field(default=None, max_length=32)


class LoginRequest(BaseModel):
    login_type: str = Field(default="guest", max_length=32)

    device_id: str | None = Field(default=None, max_length=128)
    ext_version: str | None = Field(default=None, max_length=32)

    email: str | None = Field(default=None, max_length=255)
    display_name: str | None = Field(default=None, max_length=255)


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


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _issue_guest_token(*, user_id: int, device_id: str | None, ext_version: str | None) -> dict[str, Any]:
    jwt_secret = _get_jwt_secret()

    now = int(time.time())
    expires_in = int(os.getenv("GUEST_ACCESS_TTL_SECONDS", "86400"))
    payload = {
        "sub": str(user_id),
        "typ": "access",
        "login_type": "guest",
        "iat": now,
        "exp": now + expires_in,
        "device_id": device_id,
        "ext_version": ext_version,
    }

    access_token = _jwt_encode_hs256(payload, secret=jwt_secret)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": expires_in,
    }


def _issue_local_token(*, user_id: int) -> dict[str, Any]:
    jwt_secret = _get_jwt_secret()
    now = int(time.time())
    expires_in = int(os.getenv("LOCAL_ACCESS_TTL_SECONDS", "86400"))
    payload = {
        "sub": str(user_id),
        "typ": "access",
        "login_type": "local",
        "iat": now,
        "exp": now + expires_in,
    }
    access_token = _jwt_encode_hs256(payload, secret=jwt_secret)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": expires_in,
    }


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    login_type = (req.login_type or "guest").strip().lower()

    if login_type == "guest":
        user: ClickUser | None = None
        if req.device_id:
            user = db.scalar(
                select(ClickUser)
                .where(
                    ClickUser.login_type == "guest",
                    ClickUser.device_id == req.device_id,
                    ClickUser.deleted_at.is_(None),
                )
                .limit(1)
            )

        is_new = False
        if user is None:
            is_new = True
            jwt_secret = _get_jwt_secret()
            desired_user_id = _generate_guest_user_id(req.device_id, secret=jwt_secret)

            for attempt in range(5):
                candidate_user_id = desired_user_id if attempt == 0 else secrets.randbits(63) or 1
                user = ClickUser(
                    user_id=candidate_user_id,
                    device_id=req.device_id,
                    login_type="guest",
                    last_login_at=_utcnow(),
                )
                db.add(user)
                try:
                    db.commit()
                    db.refresh(user)
                    break
                except IntegrityError:
                    db.rollback()
                    user = None
                    continue

            if user is None:
                raise HTTPException(status_code=500, detail="创建游客用户失败")
        else:
            user.last_login_at = _utcnow()
            db.commit()

        token = _issue_guest_token(user_id=user.user_id, device_id=req.device_id, ext_version=req.ext_version)
        return {
            "code": 0,
            "message": "ok",
            "data": {
                "user_id": user.user_id,
                "login_type": "guest",
                "is_new": is_new,
                **token,
            },
        }

    if login_type == "local":
        if not req.email:
            raise HTTPException(status_code=400, detail="email 不能为空")

        email = req.email.strip().lower()
        user = db.scalar(select(ClickUser).where(ClickUser.email == email, ClickUser.deleted_at.is_(None)).limit(1))

        if user is None:
            is_new = True
            for _ in range(5):
                user = ClickUser(
                    user_id=secrets.randbits(63) or 1,
                    email=email,
                    display_name=req.display_name,
                    login_type="local",
                    last_login_at=_utcnow(),
                )
                db.add(user)
                try:
                    db.commit()
                    db.refresh(user)
                    break
                except IntegrityError:
                    db.rollback()
                    user = None
                    continue

            if user is None:
                raise HTTPException(status_code=500, detail="创建用户失败")
        else:
            if user.login_type != "local":
                raise HTTPException(status_code=409, detail="该邮箱已被其他登录方式占用")
            is_new = False
            user.last_login_at = _utcnow()
            db.commit()

        token = _issue_local_token(user_id=user.user_id)
        return {
            "code": 0,
            "message": "ok",
            "data": {
                "user_id": user.user_id,
                "login_type": "local",
                "is_new": is_new,
                **token,
            },
        }

    raise HTTPException(status_code=400, detail="不支持的 login_type")


@router.post("/guest-login")
def guest_login(req: GuestLoginRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    # 兼容旧接口：内部走统一的 /login
    return login(LoginRequest(login_type="guest", device_id=req.device_id, ext_version=req.ext_version), db)
