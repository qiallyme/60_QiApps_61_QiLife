import { createRecord, listRecords, updateRecord } from "../../../features/qilife/services/qilifeStore";
import type { QiRecord } from "../../../features/qilife/types";
import { readRelationIds } from "../../../features/qilife/relations/relationshipFields";
import type { Project, ProjectDraft } from "../types";

const text = (value: unknown) => typeof value === "string" ? value : "";
const strings = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export function mapRecordToProject(record: QiRecord): Project {
  if (record.entity_key !== "project") throw new Error("Record is not a Project.");
  return {
    id: record.id, name: record.title, status: record.status ?? "active",
    priority: record.priority ?? "medium", dueDate: record.due_date ?? null,
    ownerId: readRelationIds(record.data, "person", "owner")[0] ?? null,
    area: text(record.data.area), tags: strings(record.data.tags), brief: text(record.data.brief),
    createdAt: record.created_at, updatedAt: record.updated_at,
  };
}

export const projectRepository = {
  async list() { return (await listRecords("project")).map(mapRecordToProject); },
  async get(id: string) {
    const item = (await listRecords("project")).find((record) => record.id === id);
    return item ? mapRecordToProject(item) : null;
  },
  async create(draft: ProjectDraft) {
    return mapRecordToProject(await createRecord({
      entity_key: "project", title: draft.name, status: draft.status, priority: draft.priority,
      due_date: draft.dueDate, data: { owner_id: draft.ownerId, area: draft.area, tags: draft.tags, brief: draft.brief },
    }));
  },
  async update(id: string, draft: ProjectDraft) {
    const existing = (await listRecords("project")).find((record) => record.id === id);
    if (!existing) throw new Error("Project is unavailable.");
    return mapRecordToProject(await updateRecord(id, {
      title: draft.name, status: draft.status, priority: draft.priority, due_date: draft.dueDate,
      data: { ...existing.data, owner_id: draft.ownerId, area: draft.area, tags: draft.tags, brief: draft.brief },
    }));
  },
};
