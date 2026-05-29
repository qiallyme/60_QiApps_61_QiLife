from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.models import Thread
from app.db.session import get_session

router = APIRouter()


@router.get("")
def list_threads(session: Session = Depends(get_session)) -> list[Thread]:
    return session.exec(select(Thread).order_by(Thread.updated_at.desc())).all()


@router.get("/{thread_id}")
def get_thread(thread_id: str, session: Session = Depends(get_session)) -> Thread:
    thread = session.get(Thread, thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread
