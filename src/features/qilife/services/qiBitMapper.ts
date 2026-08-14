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

  // Extract or generate QiDecimal identity e.g. "61.10.100"
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
    journal_entry: "journal",
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
    idea: "idea",
    memory: "memory",
    problem: "problem",
    source: "source",
    workflow: "workflow",
  };

  const mappedType: QiBitType = typeMap[record.entity_key.toLowerCase()] ?? "capture";

  return {
    id: record.id,
    qiDecimal,
    type: mappedType,
    title: record.title,
    body,
    metadata,
    provenance,
    memoryState: record.archived_at ? "archived" : "transient",
    createdAt: record.created_at ?? new Date().toISOString(),
    updatedAt: record.updated_at ?? new Date().toISOString(),
    archivedAt: record.archived_at ?? undefined,
  };
}

/**
 * Maps a Universal QiBit back to a legacy compatible QiRecord for backward compatibility
 */
export function qiBitToQiRecord(bit: QiBit): QiRecord {
  const entityKeyMap: Record<QiBitType, string> = {
    task: "task",
    project: "project",
    person: "person",
    journal: "journal_entry",
    capture: "qibit",
    expense: "expense",
    document: "document",
    event: "event",
    decision: "decision",
    conversation: "thread",
    note: "note",
    thought: "thought",
    output: "output",
    notebook: "notebook",
    podcast: "podcast",
    idea: "qibit",
    memory: "qibit",
    problem: "qibit",
    source: "document",
    workflow: "task",
  };

  return {
    id: bit.id,
    entity_key: entityKeyMap[bit.type] ?? "qibit",
    title: bit.title,
    status: (bit.metadata.status as string) ?? "open",
    created_at: bit.createdAt,
    updated_at: bit.updatedAt,
    archived_at: bit.archivedAt ?? null,
    source: bit.provenance.creator === "agent" ? "agent" : "user",
    data: {
      ...bit.metadata,
      qiDecimal: bit.qiDecimal,
      body: bit.body,
      provenance: bit.provenance,
    },
  };
}
