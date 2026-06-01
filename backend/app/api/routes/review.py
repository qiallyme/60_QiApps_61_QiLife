from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.api.serializers import build_qibit_timeline_payload, load_bucket_map, resolve_bucket_code, serialize_action, serialize_qibit
from app.db.models import AIOutput, Action, Link, Qibit
from app.db.session import get_session

router = APIRouter()


class ReviewActionInput(BaseModel):
    id: str | None = None
    title: str
    status: str = "open"
    priority: str = "low"
    dueHint: str | None = None
    sourceText: str | None = None


class AgentDraftInput(BaseModel):
    suggestedType: str
    suggestedTitle: str
    suggestedSummary: str
    suggestedTags: list[str] = Field(default_factory=list)
    suggestedPriority: str
    suggestedSpace: str
    detectedSignals: list[str] = Field(default_factory=list)
    confidence: str = "medium"
    insight: str = ""
    actions: list[dict[str, Any]] = Field(default_factory=list)
    extractedActions: list[dict[str, Any]] = Field(default_factory=list)


class ReviewQiBitInput(BaseModel):
    id: str | None = None
    createdAt: datetime | None = None
    updatedAt: datetime | None = None
    type: str
    title: str
    summary: str = ""
    rawText: str
    tags: list[str] = Field(default_factory=list)
    priority: str = "low"
    status: str = "saved"
    space: str = "General"
    insight: str = ""
    source: str = "capture"


class ReviewSaveRequest(BaseModel):
    qibit: ReviewQiBitInput
    agentDraft: AgentDraftInput
    acceptedActions: list[ReviewActionInput] = Field(default_factory=list)
    timeline: dict[str, Any] = Field(default_factory=dict)


@router.post("/save", status_code=status.HTTP_201_CREATED)
def save_review(payload: ReviewSaveRequest, session: Session = Depends(get_session)) -> dict[str, Any]:
    bucket_code = resolve_bucket_code(payload.qibit.space, payload.qibit.type)
    qibit = Qibit(
        id=payload.qibit.id,
        title=payload.qibit.title,
        raw_capture=payload.qibit.rawText,
        summary=payload.qibit.summary,
        meaning=payload.qibit.insight,
        qibit_type=payload.qibit.type,
        bucket_code=bucket_code,
        status=payload.qibit.status,
        priority=payload.qibit.priority,
        importance=payload.qibit.priority,
        action_required=len(payload.acceptedActions) > 0,
        suggested_action=payload.acceptedActions[0].title if payload.acceptedActions else None,
        captured_at=payload.qibit.createdAt or datetime.utcnow(),
        tags_json=payload.qibit.tags,
        metadata_json={
            "space": payload.qibit.space,
            "insight": payload.qibit.insight,
            "source": payload.qibit.source,
            "agent_draft": payload.agentDraft.model_dump(),
            "timeline_payload_input": payload.timeline,
            "frontend_updated_at": payload.qibit.updatedAt.isoformat() if payload.qibit.updatedAt else None,
        },
    )
    session.add(qibit)
    session.flush()

    saved_actions: list[Action] = []
    for action_input in payload.acceptedActions:
        action = Action(
            title=action_input.title,
            description=action_input.sourceText or payload.qibit.summary or payload.qibit.rawText,
            source_qibit_id=qibit.id,
            bucket_code=bucket_code,
            status="completed" if action_input.status == "done" else "open",
            priority=action_input.priority,
            completed_at=datetime.utcnow() if action_input.status == "done" else None,
            metadata_json={
                "due_hint": action_input.dueHint,
                "source_text": action_input.sourceText or payload.qibit.rawText,
                "type": "task",
                "space": payload.qibit.space,
                "insight": payload.qibit.insight,
            },
        )
        session.add(action)
        session.flush()
        saved_actions.append(action)

        session.add(
            Link(
                source_type="qibits",
                source_id=qibit.id,
                target_type="actions",
                target_id=action.id,
                relationship="created_from",
            )
        )

    session.add(
        AIOutput(
            source_type="qibits",
            source_id=qibit.id,
            ai_task="review_save",
            prompt_snapshot=payload.qibit.rawText,
            output_json=payload.agentDraft.model_dump(),
            confidence=1.0 if payload.agentDraft.confidence == "high" else 0.7 if payload.agentDraft.confidence == "medium" else 0.4,
            accepted=True,
            created_records_json={
                "qibit_id": qibit.id,
                "action_ids": [action.id for action in saved_actions],
            },
        )
    )

    session.commit()
    session.refresh(qibit)
    for action in saved_actions:
        session.refresh(action)

    bucket_names = load_bucket_map(session)
    serialized_actions = [serialize_action(action, bucket_names, qibit.title) for action in saved_actions]
    serialized_qibit = serialize_qibit(qibit, bucket_names, serialized_actions)
    timeline_item = {
        "id": qibit.id,
        "record_type": "qibit",
        "title": qibit.title,
        "timestamp": (qibit.captured_at or qibit.created_at).isoformat(),
        "bucket_code": payload.qibit.space,
        "payload": build_qibit_timeline_payload(qibit, serialized_actions, bucket_names),
    }

    return {
        "qibit": serialized_qibit,
        "actions": serialized_actions,
        "timelineItem": timeline_item,
    }
