import type { QiBit, QiBitType, QiRecord } from "../types";

/**
 * Normalizes a legacy or active QiRecord into a Universal QiBit (ADR 0005)
 */
export function qiRecordToQiBit(record: QiRecord): QiBit {
  const metadata = { ...record.data };
  
  // Extract body or raw capture if present in metadata
  const body =
    typeof metadata.body === "string"
      ? metadata.body
      : typeof metadata.body_markdown === "string"
      ? metadata.body_markdown
      : typeof metadata.notes === "string"
      ? metadata.notes
      : typeof metadata.brief === "string"
      ? metadata.brief
      : typeof metadata.raw_capture === "string"
      ? metadata.raw_capture
      : undefined;

  // Extract or generate QiDecimal identity e.g. "10.20.100"
  const qiDecimal =
    typeof metadata.qiDecimal === "string"
      ? metadata.qiDecimal
      : typeof metadata.qi_decimal === "string"
      ? metadata.qi_decimal
      : undefined;

  // Extract provenance
  const provenance =
    typeof metadata.provenance === "object" && metadata.provenance !== null
      ? (metadata.provenance as QiBit["provenance"])
      : {
          creator: (record.source === "agent" ? "agent" : "user") as "user" | "agent" | "ingest",
          sourceSystem: record.source ?? "qilife",
          createdAt: record.created_at ?? new Date().toISOString(),
          updatedAt: record.updated_at ?? new Date().toISOString(),
        };

  // Map entity_key to QiBitType
  const typeMap: Record<string, QiBitType> = {
    task: "task",
    project: "project",
    person: "person",
    journal: "journal",
    qibit: "capture",
    expense: "expense",
    document: "document",
    event: "event",
    decision: "decision",
    thread: "conversation",
    note: "note",
    thought: "thought",
    output: "output",
    notebook: "notebook",
    podcast: "podcast",
  };

  const type: QiBitType = typeMap[record.entity_key] ?? "note";

  return {
    id: record.id,
    owner_id: record.owner_id,
    qiDecimal,
    type,
    title: record.title,
    body,
    metadata,
    provenance,
    memoryState: (metadata.memoryState as QiBit["memoryState"]) ?? "transient",
    source: record.source,
    createdAt: record.created_at ?? new Date().toISOString(),
    updatedAt: record.updated_at ?? new Date().toISOString(),
    archivedAt: record.archived_at,
  };
}

/**
 * Converts a QiBit back to a QiRecord format for legacy store compatibility
 */
export function qiBitToQiRecord(bit: QiBit): QiRecord {
  const entityKeyMap: Record<string, string> = {
    capture: "qibit",
    task: "task",
    project: "project",
    person: "person",
    journal: "journal",
    expense: "expense",
    document: "document",
    event: "event",
    decision: "decision",
    conversation: "thread",
  };

  const entity_key = entityKeyMap[bit.type] ?? "qibit";

  const data: Record<string, unknown> = {
    ...bit.metadata,
    qiDecimal: bit.qiDecimal,
    provenance: bit.provenance,
    memoryState: bit.memoryState,
    body: bit.body,
  };

  return {
    id: bit.id,
    owner_id: bit.owner_id,
    entity_key,
    title: bit.title,
    status: (bit.metadata.status as string) ?? null,
    priority: (bit.metadata.priority as string) ?? null,
    due_date: (bit.metadata.due_date as string) ?? null,
    data,
    source: bit.source ?? "qilife",
    created_at: bit.createdAt,
    updated_at: bit.updatedAt,
    archived_at: bit.archivedAt,
  };
}
