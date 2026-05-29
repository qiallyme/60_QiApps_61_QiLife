from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

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


class ActionStepCreateRequest(BaseModel):
    title: str
    description: str | None = None
    sort_order: int = 1


@router.get("")
def list_actions(session: Session = Depends(get_session)) -> list[Action]:
    return session.exec(select(Action).order_by(Action.updated_at.desc())).all()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_action(payload: ActionCreateRequest, session: Session = Depends(get_session)) -> Action:
    action = Action(**payload.model_dump())
    session.add(action)
    session.commit()
    session.refresh(action)
    return action


@router.get("/{action_id}")
def get_action(action_id: str, session: Session = Depends(get_session)) -> Action:
    action = session.get(Action, action_id)
    if action is None:
        raise HTTPException(status_code=404, detail="Action not found")
    return action


@router.patch("/{action_id}")
def update_action(action_id: str, payload: ActionUpdateRequest, session: Session = Depends(get_session)) -> Action:
    action = session.get(Action, action_id)
    if action is None:
        raise HTTPException(status_code=404, detail="Action not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(action, field, value)
    if payload.status == "completed" and action.completed_at is None:
        action.completed_at = datetime.utcnow()

    session.add(action)
    session.commit()
    session.refresh(action)
    return action


@router.post("/{action_id}/steps", status_code=status.HTTP_201_CREATED)
def create_action_step(action_id: str, payload: ActionStepCreateRequest, session: Session = Depends(get_session)) -> ActionStep:
    if session.get(Action, action_id) is None:
        raise HTTPException(status_code=404, detail="Action not found")

    step = ActionStep(action_id=action_id, **payload.model_dump())
    session.add(step)
    session.commit()
    session.refresh(step)
    return step
