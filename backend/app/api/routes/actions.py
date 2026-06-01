from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.serializers import load_bucket_map, serialize_action
from app.db.models import Action, ActionStep
from app.db.session import get_session

router = APIRouter()


class ActionCreateRequest(BaseModel):
    title: str
    description: str = ""
    bucket_code: str
    thread_id: str | None = None
    source_qibit_id: str | None = None
    priority: str = "normal"
    scheduled_for: datetime | None = None


class ActionUpdateRequest(BaseModel):
    status: str | None = None
    priority: str | None = None
    scheduled_for: datetime | None = None
    resolution_note: str | None = None
    dueHint: str | None = None
    sourceText: str | None = None


class ActionStepCreateRequest(BaseModel):
    title: str
    description: str | None = None
    sort_order: int = 1


@router.get("")
def list_actions(session: Session = Depends(get_session)) -> list[dict]:
    actions = session.exec(select(Action).order_by(Action.updated_at.desc())).all()
    bucket_names = load_bucket_map(session)
    qibit_titles = {
        action.source_qibit_id: action.source_qibit_id
        for action in actions
        if action.source_qibit_id is not None
    }
    if qibit_titles:
        from app.db.models import Qibit

        rows = session.exec(select(Qibit).where(Qibit.id.in_(list(qibit_titles.keys())))).all()
        qibit_titles = {row.id: row.title for row in rows}

    return [serialize_action(action, bucket_names, qibit_titles.get(action.source_qibit_id)) for action in actions]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_action(payload: ActionCreateRequest, session: Session = Depends(get_session)) -> dict:
    action = Action(**payload.model_dump())
    session.add(action)
    session.commit()
    session.refresh(action)
    bucket_names = load_bucket_map(session)
    return serialize_action(action, bucket_names)


@router.get("/{action_id}")
def get_action(action_id: str, session: Session = Depends(get_session)) -> dict:
    action = session.get(Action, action_id)
    if action is None:
        raise HTTPException(status_code=404, detail="Action not found")

    qibit_title = None
    if action.source_qibit_id:
        from app.db.models import Qibit

        qibit = session.get(Qibit, action.source_qibit_id)
        qibit_title = qibit.title if qibit else None

    bucket_names = load_bucket_map(session)
    return serialize_action(action, bucket_names, qibit_title)


@router.patch("/{action_id}")
def update_action(action_id: str, payload: ActionUpdateRequest, session: Session = Depends(get_session)) -> dict:
    action = session.get(Action, action_id)
    if action is None:
        raise HTTPException(status_code=404, detail="Action not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        if field in {"dueHint", "sourceText"}:
            continue
        setattr(action, field, value)

    if payload.status == "done":
        action.status = "completed"
        if action.completed_at is None:
            action.completed_at = datetime.utcnow()
    elif payload.status == "open":
        action.status = "open"
        action.completed_at = None

    if payload.dueHint is not None:
        action.metadata_json["due_hint"] = payload.dueHint
    if payload.sourceText is not None:
        action.metadata_json["source_text"] = payload.sourceText

    session.add(action)
    session.commit()
    session.refresh(action)

    qibit_title = None
    if action.source_qibit_id:
        from app.db.models import Qibit

        qibit = session.get(Qibit, action.source_qibit_id)
        qibit_title = qibit.title if qibit else None

    bucket_names = load_bucket_map(session)
    return serialize_action(action, bucket_names, qibit_title)


@router.post("/{action_id}/steps", status_code=status.HTTP_201_CREATED)
def create_action_step(action_id: str, payload: ActionStepCreateRequest, session: Session = Depends(get_session)) -> ActionStep:
    if session.get(Action, action_id) is None:
        raise HTTPException(status_code=404, detail="Action not found")

    step = ActionStep(action_id=action_id, **payload.model_dump())
    session.add(step)
    session.commit()
    session.refresh(step)
    return step
