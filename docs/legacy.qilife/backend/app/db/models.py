from __future__ import annotations

from datetime import date, datetime
from typing import Any

from sqlalchemy import Column, JSON, String, Text
from sqlmodel import Field, SQLModel

from app.core.ulid import generate_ulid


def utcnow() -> datetime:
    return datetime.utcnow()


class TimestampedModel(SQLModel):
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class Bucket(SQLModel, table=True):
    __tablename__ = "buckets"
    code: str = Field(primary_key=True, max_length=4)
    name: str
    slug: str
    folder_path: str
    sort_order: int
    description: str
    is_system: bool = False
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class Qibit(TimestampedModel, table=True):
    __tablename__ = "qibits"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    title: str
    raw_capture: str = Field(sa_column=Column(Text, nullable=False))
    summary: str = ""
    meaning: str = ""
    qibit_type: str = "other"
    bucket_code: str = Field(foreign_key="buckets.code")
    thread_id: str | None = Field(default=None, foreign_key="threads.id")
    status: str = "new"
    priority: str = "normal"
    importance: str = "normal"
    emotional_load: str = "normal"
    action_required: bool = False
    suggested_action: str | None = None
    future_slot: str = "this_week"
    happened_at: datetime | None = None
    captured_at: datetime = Field(default_factory=utcnow)
    resolved_at: datetime | None = None
    retrieval_summary: str | None = None
    reflection: str | None = None
    tags_json: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    metadata_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    archived_at: datetime | None = None
    deleted_at: datetime | None = None


class Thread(TimestampedModel, table=True):
    __tablename__ = "threads"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    title: str
    description: str = ""
    bucket_code: str = Field(foreign_key="buckets.code")
    status: str = "open"
    priority: str = "normal"
    next_action: str | None = None
    due_date: datetime | None = None
    started_at: datetime = Field(default_factory=utcnow)
    closed_at: datetime | None = None
    tags_json: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    metadata_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    archived_at: datetime | None = None
    deleted_at: datetime | None = None


class Action(TimestampedModel, table=True):
    __tablename__ = "actions"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    title: str
    description: str = ""
    source_qibit_id: str | None = Field(default=None, foreign_key="qibits.id")
    bucket_code: str = Field(foreign_key="buckets.code")
    thread_id: str | None = Field(default=None, foreign_key="threads.id")
    status: str = "open"
    priority: str = "normal"
    energy: str = "normal"
    context: str = ""
    due_date: datetime | None = None
    scheduled_for: datetime | None = None
    completed_at: datetime | None = None
    resolution_note: str | None = None
    tags_json: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    metadata_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    archived_at: datetime | None = None
    deleted_at: datetime | None = None


class ActionStep(TimestampedModel, table=True):
    __tablename__ = "action_steps"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    action_id: str = Field(foreign_key="actions.id")
    title: str
    description: str | None = None
    status: str = "open"
    sort_order: int = 1
    completed_at: datetime | None = None


class Person(TimestampedModel, table=True):
    __tablename__ = "people"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    display_name: str
    legal_name: str
    type: str = "person"
    relationship: str = ""
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    notes: str | None = None
    tags_json: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    metadata_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    archived_at: datetime | None = None
    deleted_at: datetime | None = None


class Transaction(TimestampedModel, table=True):
    __tablename__ = "transactions"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    date: date
    amount_cents: int
    currency: str = "USD"
    direction: str = "out"
    from_label: str
    to_label: str
    category: str = ""
    bucket_code: str = Field(foreign_key="buckets.code")
    thread_id: str | None = Field(default=None, foreign_key="threads.id")
    status: str = "pending"
    notes: str | None = None
    evidence_document_id: str | None = Field(default=None, foreign_key="documents.id")
    source_qibit_id: str | None = Field(default=None, foreign_key="qibits.id")
    archived_at: datetime | None = None
    deleted_at: datetime | None = None


class Obligation(TimestampedModel, table=True):
    __tablename__ = "obligations"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    owed_by_label: str
    owed_to_label: str
    obligation_type: str
    amount_cents: int | None = None
    currency: str | None = None
    reason: str
    status: str = "open"
    due_date: datetime | None = None
    related_transaction_id: str | None = Field(default=None, foreign_key="transactions.id")
    source_qibit_id: str | None = Field(default=None, foreign_key="qibits.id")
    resolved_at: datetime | None = None
    archived_at: datetime | None = None
    deleted_at: datetime | None = None


class KnowledgeItem(TimestampedModel, table=True):
    __tablename__ = "knowledge_items"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    title: str
    body_markdown: str = Field(sa_column=Column(Text, nullable=False))
    bucket_code: str = Field(foreign_key="buckets.code")
    module_key: str | None = None
    knowledge_type: str = "reference"
    source_type: str = "manual"
    source_path: str | None = None
    confidence: str = "confirmed"
    visibility: str = "private"
    tags_json: list[str] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    metadata_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    last_synced_at: datetime | None = None
    sync_hash: str | None = None
    archived_at: datetime | None = None
    deleted_at: datetime | None = None


class Document(TimestampedModel, table=True):
    __tablename__ = "documents"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    title: str
    file_path: str
    source: str
    document_type: str
    bucket_code: str = Field(foreign_key="buckets.code")
    thread_id: str | None = Field(default=None, foreign_key="threads.id")
    file_hash: str = ""
    mime_type: str = ""
    size_bytes: int = 0
    notes: str | None = None
    archived_at: datetime | None = None
    deleted_at: datetime | None = None


class Event(TimestampedModel, table=True):
    __tablename__ = "events"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    title: str
    description: str | None = None
    start_time: datetime
    end_time: datetime
    location: str | None = None
    bucket_code: str = Field(foreign_key="buckets.code")
    thread_id: str | None = Field(default=None, foreign_key="threads.id")
    status: str = "scheduled"
    source_qibit_id: str | None = Field(default=None, foreign_key="qibits.id")
    archived_at: datetime | None = None
    deleted_at: datetime | None = None


class Link(SQLModel, table=True):
    __tablename__ = "links"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    source_type: str
    source_id: str
    target_type: str
    target_id: str
    relationship: str
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class ActivityLog(SQLModel, table=True):
    __tablename__ = "activity_log"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    occurred_at: datetime = Field(default_factory=utcnow)
    actor: str = "system"
    action: str
    entity_type: str
    entity_id: str
    summary: str
    before_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    after_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    source: str = "app"
    created_at: datetime = Field(default_factory=utcnow)


class AIOutput(SQLModel, table=True):
    __tablename__ = "ai_outputs"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    source_type: str
    source_id: str
    ai_task: str
    prompt_snapshot: str = Field(sa_column=Column(Text, nullable=False))
    output_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    confidence: float = 0.0
    accepted: bool = False
    created_records_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class DailySummary(SQLModel, table=True):
    __tablename__ = "daily_summaries"
    id: str = Field(default_factory=generate_ulid, sa_column=Column(String(26), primary_key=True))
    date: date
    summary_markdown: str = Field(sa_column=Column(Text, nullable=False))
    ai_summary_json: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    reviewed: bool = False
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
