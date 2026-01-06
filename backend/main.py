import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controller.userController import router as user_router
from utils.db import init_db


def _get_cors_allow_origins() -> list[str]:
    allow_origins = os.getenv("CORS_ALLOW_ORIGINS")
    if not allow_origins:
        return ["*"]
    return [origin.strip() for origin in allow_origins.split(",") if origin.strip()]


app = FastAPI(title="click-translate-relay", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    init_db()


@app.get("/api/v1/healthz")
def healthz() -> dict:
    return {"status": "ok"}


app.include_router(user_router)
