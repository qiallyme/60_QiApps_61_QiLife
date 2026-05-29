from __future__ import annotations

from functools import lru_cache
import os
from pathlib import Path

from pydantic import BaseModel, Field


class Settings(BaseModel):
    app_name: str = "QiLife API"
    data_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "data")
    database_filename: str = "qilife.sqlite"

    @property
    def db_path(self) -> Path:
        override = os.getenv("QILIFE_DB_PATH")
        if override:
            return Path(override).resolve()
        return (self.data_root / "db" / self.database_filename).resolve()

    @property
    def database_url(self) -> str:
        override = os.getenv("DATABASE_URL")
        if override:
            return override
        return f"sqlite:///{self.db_path.as_posix()}"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
