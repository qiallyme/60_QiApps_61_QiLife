from __future__ import annotations

from sqlmodel import Session, select

from app.db.models import Action, ActionStep, Bucket, DailySummary, KnowledgeItem, Link, Obligation, Person, Qibit, Thread, Transaction
from app.db.seed_data import BUCKETS, build_seed_records
from app.db.session import create_db_and_tables, engine


def _upsert_bucket(session: Session, bucket: Bucket) -> None:
    existing = session.get(Bucket, bucket.code)
    if existing is None:
        session.add(bucket)


def seed_database() -> None:
    create_db_and_tables()

    with Session(engine) as session:
        for bucket in BUCKETS:
            _upsert_bucket(session, bucket)
        session.commit()

        if session.exec(select(Qibit)).first() is not None:
            return

        records = build_seed_records()
        for batch_key in (
            "people",
            "threads",
            "qibits",
            "actions",
            "steps",
            "obligations",
            "transactions",
            "knowledge",
            "links",
            "summaries",
        ):
            for row in records[batch_key]:
                session.add(row)
            session.commit()


if __name__ == "__main__":
    seed_database()
