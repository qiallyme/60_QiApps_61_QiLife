from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.db.models import Bucket
from app.db.session import get_session

router = APIRouter()


@router.get("")
def list_buckets(session: Session = Depends(get_session)) -> list[Bucket]:
    return session.exec(select(Bucket).order_by(Bucket.sort_order)).all()
