from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db.models import Thread
from app.db.session import get_session

router = APIRouter()


class ThreadCreateRequest(BaseModel):
    title: str
    description: str = ""
    bucket_code: str
    priority: str = "normal"
    next_action: str | None = None
    due_date: datetime | None = None


class ThreadUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    next_action: str | None = None
    due_date: datetime | None = None


@router.get("")
def list_threads(session: Session = Depends(get_session)) -> list[Thread]:
    return session.exec(select(Thread).order_by(Thread.updated_at.desc())).all()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_thread(payload: ThreadCreateRequest, session: Session = Depends(get_session)) -> Thread:
    thread = Thread(**payload.model_dump())
    session.add(thread)
    session.commit()
    session.refresh(thread)
    return thread


@router.get("/{thread_id}")
def get_thread(thread_id: str, session: Session = Depends(get_session)) -> Thread:
    thread = session.get(Thread, thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread


@router.patch("/{thread_id}")
def update_thread(thread_id: str, payload: ThreadUpdateRequest, session: Session = Depends(get_session)) -> Thread:
    thread = session.get(Thread, thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(thread, field, value)
    if payload.status == "closed" and thread.closed_at is None:
        thread.closed_at = datetime.utcnow()

    session.add(thread)
    session.commit()
    session.refresh(thread)
    return thread
