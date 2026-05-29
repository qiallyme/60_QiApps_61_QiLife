from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.db.models import AIOutput, Action, Link, Qibit
from app.db.session import get_session

router = APIRouter()


class QibitCaptureRequest(BaseModel):
    raw_capture: str = Field(min_length=1, max_length=1000)
    captured_at: datetime | None = None
    happened_at: datetime | None = None


class QibitTriageRequest(BaseModel):
    bucket_code: str
    thread_id: str | None = None
    action_required: bool = False
    suggested_action: str | None = None
    create_action_title: str | None = None
    priority: str | None = None
    future_slot: str | None = None


@router.post("/capture", status_code=status.HTTP_201_CREATED)
def capture_qibit(payload: QibitCaptureRequest, session: Session = Depends(get_session)) -> Qibit:
    qibit = Qibit(
        title=payload.raw_capture[:80],
        raw_capture=payload.raw_capture,
        summary="",
        meaning="",
        qibit_type="other",
        bucket_code="00",
        captured_at=payload.captured_at or datetime.utcnow(),
        happened_at=payload.happened_at,
        status="new",
    )
    session.add(qibit)
    session.flush()

    ai_output = AIOutput(
        source_type="qibits",
        source_id=qibit.id,
        ai_task="interpret_qibit",
        prompt_snapshot=payload.raw_capture,
        output_json={"status": "placeholder", "bucket_code": "00"},
        confidence=0.0,
    )
    session.add(ai_output)
    session.commit()
    session.refresh(qibit)
    return qibit


@router.get("")
def list_qibits(session: Session = Depends(get_session)) -> list[Qibit]:
    return session.exec(select(Qibit).order_by(Qibit.captured_at.desc())).all()


@router.get("/{qibit_id}")
def get_qibit(qibit_id: str, session: Session = Depends(get_session)) -> Qibit:
    qibit = session.get(Qibit, qibit_id)
    if qibit is None:
        raise HTTPException(status_code=404, detail="QiBit not found")
    return qibit


@router.post("/{qibit_id}/triage")
def triage_qibit(qibit_id: str, payload: QibitTriageRequest, session: Session = Depends(get_session)) -> Qibit:
    qibit = session.get(Qibit, qibit_id)
    if qibit is None:
        raise HTTPException(status_code=404, detail="QiBit not found")

    qibit.bucket_code = payload.bucket_code
    qibit.thread_id = payload.thread_id
    qibit.action_required = payload.action_required
    qibit.suggested_action = payload.suggested_action
    qibit.status = "triaged"

    if payload.priority is not None:
        qibit.priority = payload.priority
    if payload.future_slot is not None:
        qibit.future_slot = payload.future_slot

    if payload.create_action_title:
        action = Action(
            title=payload.create_action_title,
            description=qibit.summary or qibit.raw_capture,
            source_qibit_id=qibit.id,
            bucket_code=payload.bucket_code,
            thread_id=payload.thread_id,
            status="open",
            priority=qibit.priority,
        )
        session.add(action)
        session.flush()
        session.add(
            Link(
                source_type="qibits",
                source_id=qibit.id,
                target_type="actions",
                target_id=action.id,
                relationship="created_from",
            )
        )

    session.add(qibit)
    session.commit()
    session.refresh(qibit)
    return qibit
