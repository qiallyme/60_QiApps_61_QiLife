from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

from sqlmodel import Session, select

from app.api.serializers import build_qibit_timeline_payload, load_bucket_map, serialize_action
from app.db.models import Action, Qibit


@dataclass
class TimelineRow:
    id: str
    record_type: str
    title: str
    timestamp: datetime
    bucket_code: str
    payload: dict[str, Any]

def build_timeline(session: Session) -> list[TimelineRow]:
    rows: list[TimelineRow] = []
    qibits = session.exec(select(Qibit).order_by(Qibit.captured_at.desc())).all()
    actions = session.exec(select(Action)).all()
    bucket_names = load_bucket_map(session)

    actions_by_qibit: dict[str, list[dict[str, Any]]] = {}
    for action in actions:
        if not action.source_qibit_id:
            continue
        serialized = serialize_action(action, bucket_names)
        actions_by_qibit.setdefault(action.source_qibit_id, []).append(serialized)

    for qibit in qibits:
        timestamp = qibit.happened_at or qibit.captured_at or qibit.created_at
        linked_actions = actions_by_qibit.get(qibit.id, [])
        rows.append(
            TimelineRow(
                id=qibit.id,
                record_type="qibit",
                title=qibit.title,
                timestamp=timestamp,
                bucket_code=qibit.bucket_code,
                payload=build_qibit_timeline_payload(qibit, linked_actions, bucket_names),
            )
        )

    return sorted(rows, key=lambda row: row.timestamp, reverse=True)
