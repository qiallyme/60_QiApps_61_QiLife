from __future__ import annotations

from collections.abc import Generator
import os
import sqlite3

from sqlalchemy import event
from sqlalchemy.dialects.sqlite import dialect as sqlite_dialect
from sqlalchemy.schema import CreateTable
from sqlmodel import Session, SQLModel, create_engine

from app.config import get_settings

settings = get_settings()
settings.db_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(settings.database_url, echo=False, connect_args={"check_same_thread": False})


@event.listens_for(engine, "connect")
def _set_sqlite_pragmas(dbapi_connection, _connection_record) -> None:
    cursor = dbapi_connection.cursor()
    if os.getenv("QILIFE_SQLITE_USE_WAL", "1") == "1":
        cursor.execute("PRAGMA journal_mode=WAL;")
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.execute("PRAGMA synchronous=NORMAL;")
    cursor.close()


def create_db_and_tables() -> None:
    with sqlite3.connect(settings.db_path) as connection:
        if os.getenv("QILIFE_SQLITE_USE_WAL", "1") == "1":
            connection.execute("PRAGMA journal_mode=WAL;")
        connection.execute("PRAGMA foreign_keys=ON;")
        connection.execute("PRAGMA synchronous=NORMAL;")

        compiled = sqlite_dialect()
        for table in SQLModel.metadata.sorted_tables:
            statement = str(CreateTable(table, if_not_exists=True).compile(dialect=compiled))
            connection.execute(statement)
        connection.commit()


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
