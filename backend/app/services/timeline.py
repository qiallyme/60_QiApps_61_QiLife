from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, time
from typing import Any

from sqlmodel import Session, select

from app.db.models import Action, DailySummary, Event, Qibit, Transaction


@dataclass
class TimelineRow:
    id: str
    record_type: str
    title: str
    timestamp: datetime
    bucket_code: str
    payload: dict[str, Any]


def _coerce_date(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    return datetime.combine(value, time.min)


def build_timeline(session: Session) -> list[TimelineRow]:
    rows: list[TimelineRow] = []

    for qibit in session.exec(select(Qibit)).all():
        timestamp = qibit.happened_at or qibit.captured_at or qibit.created_at
        rows.append(
            TimelineRow(
                id=qibit.id,
                record_type="qibits",
                title=qibit.title,
                timestamp=timestamp,
                bucket_code=qibit.bucket_code,
                payload={"status": qibit.status, "thread_id": qibit.thread_id},
            )
        )

    for action in session.exec(select(Action)).all():
        timestamp = action.completed_at or action.scheduled_for or action.created_at
        rows.append(
            TimelineRow(
                id=action.id,
                record_type="actions",
                title=action.title,
                timestamp=timestamp,
                bucket_code=action.bucket_code,
                payload={"status": action.status, "thread_id": action.thread_id},
            )
        )

    for transaction in session.exec(select(Transaction)).all():
        rows.append(
            TimelineRow(
                id=transaction.id,
                record_type="transactions",
                title=f"{transaction.from_label} -> {transaction.to_label}",
                timestamp=_coerce_date(transaction.date),
                bucket_code=transaction.bucket_code,
                payload={"amount_cents": transaction.amount_cents, "status": transaction.status},
            )
        )

    for event in session.exec(select(Event)).all():
        rows.append(
            TimelineRow(
                id=event.id,
                record_type="events",
                title=event.title,
                timestamp=event.start_time,
                bucket_code=event.bucket_code,
                payload={"status": event.status, "thread_id": event.thread_id},
            )
        )

    for summary in session.exec(select(DailySummary)).all():
        rows.append(
            TimelineRow(
                id=summary.id,
                record_type="daily_summaries",
                title=f"Daily Summary {summary.date.isoformat()}",
                timestamp=_coerce_date(summary.date),
                bucket_code="20",
                payload={"reviewed": summary.reviewed},
            )
        )

    return sorted(rows, key=lambda row: row.timestamp, reverse=True)
