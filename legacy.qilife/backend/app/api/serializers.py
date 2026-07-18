from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlmodel import Session, select

from app.db.models import Action, Bucket, Qibit


BUCKET_NAME_TO_CODE = {
    "inbox": "00",
    "general": "00",
    "operations": "10",
    "workbench": "10",
    "moms care": "30",
    "life": "30",
    "people": "40",
    "projects": "50",
    "business": "50",
    "finance": "60",
    "legal": "70",
    "tech": "80",
    "reference": "110",
    "archive": "900",
}

BUCKET_CODE_TO_FALLBACK_SPACE = {
    "00": "Inbox",
    "10": "Workbench",
    "20": "Timeline",
    "30": "Life",
    "40": "People",
    "50": "Business",
    "60": "Finance",
    "70": "Legal",
    "80": "Tech",
    "90": "Assets",
    "100": "Data",
    "110": "Reference",
    "900": "Archive",
    "990": "System",
}


def _to_iso(value: datetime | None) -> str | None:
    return value.isoformat() if value is not None else None


def _normalize_priority(value: str | None) -> str:
    raw = (value or "").lower()
    if raw in {"high", "critical"}:
        return "high"
    if raw in {"medium", "normal"}:
        return "medium"
    return "low"


def _normalize_type(value: str | None) -> str:
    raw = (value or "").lower()
    if raw in {"care", "finance", "legal", "tech", "task", "note"}:
        return raw
    if raw in {"transactions", "transaction"}:
        return "finance"
    if raw in {"actions", "action"}:
        return "task"
    if raw in {"events", "event"}:
        return "legal"
    return "note"


def load_bucket_map(session: Session) -> dict[str, str]:
    rows = session.exec(select(Bucket)).all()
    return {bucket.code: bucket.name for bucket in rows}


def resolve_bucket_code(space: str | None, qibit_type: str | None = None) -> str:
    if space:
        mapped = BUCKET_NAME_TO_CODE.get(space.strip().lower())
        if mapped:
            return mapped

    normalized_type = _normalize_type(qibit_type)
    if normalized_type == "finance":
        return "60"
    if normalized_type == "legal":
        return "70"
    if normalized_type == "tech":
        return "80"
    if normalized_type == "care":
        return "30"
    if normalized_type == "task":
        return "10"
    return "00"


def resolve_space_name(bucket_code: str, metadata: dict[str, Any], bucket_names: dict[str, str]) -> str:
    explicit = metadata.get("space")
    if isinstance(explicit, str) and explicit.strip():
        return explicit.strip()
    return bucket_names.get(bucket_code, BUCKET_CODE_TO_FALLBACK_SPACE.get(bucket_code, "General"))


def extract_agent_draft(metadata: dict[str, Any], qibit: Qibit) -> dict[str, Any]:
    raw = metadata.get("agent_draft")
    if isinstance(raw, dict):
        return raw

    return {
        "suggestedType": _normalize_type(qibit.qibit_type),
        "suggestedTitle": qibit.title,
        "suggestedSummary": qibit.summary or qibit.raw_capture,
        "suggestedTags": qibit.tags_json,
        "suggestedPriority": _normalize_priority(qibit.priority),
        "suggestedSpace": metadata.get("space", ""),
        "detectedSignals": [],
        "confidence": "medium",
        "insight": metadata.get("insight", ""),
        "actions": [],
        "extractedActions": [],
    }


def serialize_action(action: Action, bucket_names: dict[str, str], qibit_title: str | None = None) -> dict[str, Any]:
    metadata = action.metadata_json or {}
    due_hint = metadata.get("due_hint")
    if not isinstance(due_hint, str):
        due_hint = _to_iso(action.due_date) or _to_iso(action.scheduled_for)

    source_text = metadata.get("source_text")
    if not isinstance(source_text, str):
        source_text = action.description or None

    return {
        "id": action.id,
        "qibitId": action.source_qibit_id,
        "createdAt": _to_iso(action.created_at),
        "title": action.title,
        "status": "done" if action.status in {"done", "completed"} else "open",
        "priority": _normalize_priority(action.priority),
        "dueHint": due_hint,
        "sourceText": source_text,
        "qibitTitle": qibit_title,
        "description": action.description,
        "bucket_code": action.bucket_code,
        "thread_id": action.thread_id,
        "scheduled_for": _to_iso(action.scheduled_for),
        "due_date": _to_iso(action.due_date),
        "completed_at": _to_iso(action.completed_at),
        "resolution_note": action.resolution_note,
        "tags_json": action.tags_json,
        "source_qibit_id": action.source_qibit_id,
        "space": resolve_space_name(action.bucket_code, metadata, bucket_names),
        "type": _normalize_type(metadata.get("type", "task")),
        "insight": metadata.get("insight"),
    }


def serialize_qibit(
    qibit: Qibit,
    bucket_names: dict[str, str],
    linked_actions: list[dict[str, Any]] | None = None,
    linked_people: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    metadata = qibit.metadata_json or {}
    actions = linked_actions or []
    people = linked_people or []
    agent_draft = extract_agent_draft(metadata, qibit)

    return {
        "id": qibit.id,
        "createdAt": _to_iso(qibit.captured_at or qibit.created_at),
        "updatedAt": _to_iso(qibit.updated_at),
        "type": _normalize_type(qibit.qibit_type),
        "title": qibit.title,
        "summary": qibit.summary,
        "rawText": qibit.raw_capture,
        "tags": qibit.tags_json,
        "priority": _normalize_priority(qibit.priority),
        "status": qibit.status,
        "space": resolve_space_name(qibit.bucket_code, metadata, bucket_names),
        "agentDraft": agent_draft,
        "insight": metadata.get("insight") or agent_draft.get("insight") or "",
        "source": metadata.get("source", "backend"),
        "bucket_code": qibit.bucket_code,
        "thread_id": qibit.thread_id,
        "action_required": qibit.action_required,
        "suggested_action": qibit.suggested_action,
        "future_slot": qibit.future_slot,
        "peopleIds": metadata.get("people_ids", []),
        "linkedPeople": people,
        "linkedActions": actions,
    }


def build_qibit_timeline_payload(
    qibit: Qibit,
    linked_actions: list[dict[str, Any]],
    bucket_names: dict[str, str],
    linked_people: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    serialized_qibit = serialize_qibit(qibit, bucket_names, linked_actions, linked_people)
    return {
        "qibitId": serialized_qibit["id"],
        "rawText": serialized_qibit["rawText"],
        "summary": serialized_qibit["summary"],
        "type": serialized_qibit["type"],
        "priority": serialized_qibit["priority"],
        "tags": serialized_qibit["tags"],
        "space": serialized_qibit["space"],
        "createdAt": serialized_qibit["createdAt"],
        "updatedAt": serialized_qibit["updatedAt"],
        "thread_id": serialized_qibit["thread_id"],
        "future_slot": serialized_qibit["future_slot"],
        "peopleIds": serialized_qibit["peopleIds"],
        "linkedPeople": serialized_qibit["linkedPeople"],
        "linkedActionIds": [action["id"] for action in linked_actions],
        "linkedActions": [
            {
                "id": action["id"],
                "title": action["title"],
                "status": action["status"],
                "priority": action["priority"],
                "dueHint": action.get("dueHint"),
            }
            for action in linked_actions
        ],
        "insight": serialized_qibit["insight"],
        "source": serialized_qibit["source"],
        "agentDraft": serialized_qibit["agentDraft"],
    }
