from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path
from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from models.user import Base


def _try_load_mysql_url_from_local_yaml() -> str | None:
    try:
        import yaml
    except Exception:
        return None

    backend_dir = Path(__file__).resolve().parents[1]
    config_path = backend_dir / "local.yaml"
    if not config_path.exists():
        return None

    try:
        raw = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    except Exception:
        return None

    if not isinstance(raw, dict):
        return None

    mysql = raw.get("Mysql")
    if not isinstance(mysql, dict):
        return None

    host = mysql.get("Path")
    port = mysql.get("Port")
    dbname = mysql.get("Dbname")
    username = mysql.get("Username")
    password = mysql.get("Password")

    if not all([host, port, dbname, username]) or password is None:
        return None

    return (
        f"mysql+pymysql://{quote_plus(str(username))}:{quote_plus(str(password))}"
        f"@{host}:{port}/{dbname}?charset=utf8mb4"
    )


def _get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    use_local_yaml_mysql = os.getenv("DB_USE_LOCAL_YAML_MYSQL", "0").lower() in {"1", "true", "yes", "y"}
    if use_local_yaml_mysql:
        yaml_mysql_url = _try_load_mysql_url_from_local_yaml()
        if yaml_mysql_url:
            return yaml_mysql_url

    # 默认用 sqlite，方便本地直接跑通 ORM 插入/检索
    # 也可以改用 MySQL：
    # export DATABASE_URL="mysql+pymysql://user:pass@127.0.0.1:3306/click-translate?charset=utf8mb4"
    return "sqlite:///./click_translate.db"


DATABASE_URL = _get_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    auto_create = os.getenv("DB_AUTO_CREATE", "1").lower() in {"1", "true", "yes", "y"}
    if not auto_create:
        return
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
