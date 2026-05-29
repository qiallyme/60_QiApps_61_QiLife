from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.db.session import create_db_and_tables

app = FastAPI(title="QiLife API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get("/")
def root() -> dict[str, str]:
    return {"name": "QiLife API", "status": "ok"}


app.include_router(api_router)
