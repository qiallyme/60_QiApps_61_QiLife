from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.api.serializers import build_qibit_timeline_payload, load_bucket_map, serialize_action, serialize_qibit
from app.db.models import AIOutput, Action, Link, Person, Qibit
from app.db.session import get_session

router = APIRouter()


def build_people_lookup(session: Session, qibit_ids: list[str]) -> dict[str, list[dict[str, str]]]:
    if not qibit_ids:
        return {}

    links = session.exec(
        select(Link).where(Link.source_type == "qibits", Link.source_id.in_(qibit_ids), Link.target_type == "people")
    ).all()
    if not links:
        return {}

    person_ids = list({link.target_id for link in links})
    people = session.exec(select(Person).where(Person.id.in_(person_ids))).all()
    people_by_id = {person.id: person for person in people}

    by_qibit: dict[str, list[dict[str, str]]] = {}
    for link in links:
        person = people_by_id.get(link.target_id)
        if person is None:
            continue
        by_qibit.setdefault(link.source_id, []).append(
            {
                "id": person.id,
                "display_name": person.display_name,
                "relationship": person.relationship,
                "type": person.type,
            }
        )
    return by_qibit


class QibitCaptureRequest(BaseModel):
    raw_capture: str = Field(min_length=1, max_length=1000)
    captured_at: datetime | None = None
    happened_at: datetime | None = None
    source: str | None = None


class QibitTriageRequest(BaseModel):
    bucket_code: str
    thread_id: str | None = None
    action_required: bool = False
    suggested_action: str | None = None
    create_action_title: str | None = None
    priority: str | None = None
    future_slot: str | None = None


@router.post("/capture", status_code=status.HTTP_201_CREATED)
def capture_qibit(payload: QibitCaptureRequest, session: Session = Depends(get_session)) -> dict:
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
        metadata_json={"source": payload.source or "capture", "space": "Inbox"},
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
    bucket_names = load_bucket_map(session)
    return serialize_qibit(qibit, bucket_names, [])


@router.get("")
def list_qibits(session: Session = Depends(get_session)) -> list[dict]:
    qibits = session.exec(select(Qibit).order_by(Qibit.captured_at.desc())).all()
    bucket_names = load_bucket_map(session)
    actions = session.exec(select(Action)).all()
    people_by_qibit = build_people_lookup(session, [qibit.id for qibit in qibits])
    actions_by_qibit: dict[str, list[dict]] = {}

    for action in actions:
        if not action.source_qibit_id:
            continue
        actions_by_qibit.setdefault(action.source_qibit_id, []).append(serialize_action(action, bucket_names))

    return [serialize_qibit(qibit, bucket_names, actions_by_qibit.get(qibit.id, []), people_by_qibit.get(qibit.id, [])) for qibit in qibits]


@router.get("/{qibit_id}")
def get_qibit(qibit_id: str, session: Session = Depends(get_session)) -> dict:
    qibit = session.get(Qibit, qibit_id)
    if qibit is None:
        raise HTTPException(status_code=404, detail="QiBit not found")
    bucket_names = load_bucket_map(session)
    actions = session.exec(select(Action).where(Action.source_qibit_id == qibit_id)).all()
    serialized_actions = [serialize_action(action, bucket_names, qibit.title) for action in actions]
    people_by_qibit = build_people_lookup(session, [qibit.id])
    linked_people = people_by_qibit.get(qibit.id, [])
    payload = serialize_qibit(qibit, bucket_names, serialized_actions, linked_people)
    payload["timeline"] = {
        "id": qibit.id,
        "record_type": "qibit",
        "title": qibit.title,
        "timestamp": (qibit.happened_at or qibit.captured_at or qibit.created_at).isoformat(),
        "bucket_code": qibit.bucket_code,
        "payload": build_qibit_timeline_payload(qibit, serialized_actions, bucket_names, linked_people),
    }
    return payload


@router.post("/{qibit_id}/triage")
def triage_qibit(qibit_id: str, payload: QibitTriageRequest, session: Session = Depends(get_session)) -> dict:
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
    bucket_names = load_bucket_map(session)
    actions = session.exec(select(Action).where(Action.source_qibit_id == qibit_id)).all()
    serialized_actions = [serialize_action(action, bucket_names, qibit.title) for action in actions]
    people_by_qibit = build_people_lookup(session, [qibit.id])
    return serialize_qibit(qibit, bucket_names, serialized_actions, people_by_qibit.get(qibit.id, []))
