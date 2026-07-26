import { createRecord, listRecords, updateRecord } from "../../../features/qilife/services/qilifeStore";
import type { QiCreateRecordInput, QiRecord, QiUpdateRecordInput } from "../../../features/qilife/types";
import { readRelationIds } from "../../../features/qilife/relations/relationshipFields";
import type { Action, ActionDraft } from "../types";

interface ActionStore {
  listRecords(entityKey: string): Promise<QiRecord[]>;
  createRecord(input: QiCreateRecordInput): Promise<QiRecord>;
  updateRecord(id: string, input: QiUpdateRecordInput): Promise<QiRecord>;
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function mapRecordToAction(record: QiRecord): Action {
  if (record.entity_key !== "task") throw new Error("Record is not an Action.");
  return {
    id: record.id,
    title: record.title,
    status: record.status ?? "inbox",
    priority: record.priority ?? "medium",
    dueDate: record.due_date ?? null,
    projectId: readRelationIds(record.data, "project", "project")[0] ?? null,
    peopleIds: readRelationIds(record.data, "person", "person"),
    threadId: readRelationIds(record.data, "thread", "thread")[0] ?? null,
    context: text(record.data.context),
    notes: text(record.data.notes),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function input(draft: ActionDraft, existingData: Record<string, unknown> = {}): QiCreateRecordInput {
  return {
    entity_key: "task",
    title: draft.title,
    status: draft.status,
    priority: draft.priority,
    due_date: draft.dueDate,
    data: {
      ...existingData,
      project_id: draft.projectId,
      people_ids: draft.peopleIds,
      thread_id: draft.threadId,
      context: draft.context,
      notes: draft.notes,
    },
  };
}

export function createActionRepository(store: ActionStore) {
  return {
    async list() { return (await store.listRecords("task")).map(mapRecordToAction); },
    async get(id: string) {
      const record = (await store.listRecords("task")).find((item) => item.id === id);
      return record ? mapRecordToAction(record) : null;
    },
    async create(draft: ActionDraft) { return mapRecordToAction(await store.createRecord(input(draft))); },
    async update(id: string, draft: ActionDraft) {
      const existing = (await store.listRecords("task")).find((item) => item.id === id);
      if (!existing) throw new Error("Action is unavailable.");
      const next = input(draft, existing.data);
      const { entity_key: _entityKey, ...patch } = next;
      return mapRecordToAction(await store.updateRecord(id, patch));
    },
  };
}

export const actionRepository = createActionRepository({ listRecords, createRecord, updateRecord });
