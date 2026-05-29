from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session

from app.db.session import get_session
from app.services.timeline import build_timeline

router = APIRouter()


class TimelineResponseRow(BaseModel):
    id: str
    record_type: str
    title: str
    timestamp: str
    bucket_code: str
    payload: dict


@router.get("")
def list_timeline(session: Session = Depends(get_session)) -> list[TimelineResponseRow]:
    rows = build_timeline(session)
    return [
        TimelineResponseRow(
            id=row.id,
            record_type=row.record_type,
            title=row.title,
            timestamp=row.timestamp.isoformat(),
            bucket_code=row.bucket_code,
            payload=row.payload,
        )
        for row in rows
    ]
