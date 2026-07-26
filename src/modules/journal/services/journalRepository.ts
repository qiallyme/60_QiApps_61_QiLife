import {
  createRecord,
  listRecords,
  updateRecord,
} from "../../../features/qilife/services/qilifeStore";
import type { QiRecord } from "../../../features/qilife/types";
import type {
  JournalEntry,
  JournalRecordStore,
  JournalRepository,
} from "../types";

const JOURNAL_ENTITY_KEY = "journal_entry";

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function mapRecordToJournalEntry(record: QiRecord): JournalEntry {
  if (record.entity_key !== JOURNAL_ENTITY_KEY) {
    throw new Error("Record is not a Journal entry.");
  }

  const hasRawCapture = Object.prototype.hasOwnProperty.call(record.data, "raw_capture");

  return {
    id: record.id,
    title: record.title,
    entryDate: typeof record.data.entry_date === "string" ? record.data.entry_date : "",
    bodyMarkdown:
      typeof record.data.body_markdown === "string"
        ? record.data.body_markdown
        : typeof record.data.body === "string"
          ? record.data.body
          : "",
    ...(hasRawCapture
      ? {
          rawCapture:
            typeof record.data.raw_capture === "string"
              ? record.data.raw_capture
              : null,
        }
      : {}),
    tags: strings(record.data.tags),
    pinned: record.data.pinned === true,
    peopleIds: strings(record.data.people_ids),
    ...(Object.prototype.hasOwnProperty.call(record.data, "project_id")
      || typeof record.data.project === "string"
      ? {
          projectId: typeof record.data.project_id === "string"
            ? record.data.project_id
            : typeof record.data.project === "string" ? record.data.project : null,
        }
      : {}),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function createJournalRepository(store: JournalRecordStore): JournalRepository {
  async function journalRecords() {
    return store.listRecords(JOURNAL_ENTITY_KEY);
  }

  return {
    async list() {
      return (await journalRecords()).map(mapRecordToJournalEntry);
    },

    async get(id) {
      const record = (await journalRecords()).find((item) => item.id === id);
      return record ? mapRecordToJournalEntry(record) : null;
    },

    async create(draft) {
      return mapRecordToJournalEntry(
        await store.createRecord({
          entity_key: JOURNAL_ENTITY_KEY,
          title: draft.title,
          status: null,
          priority: null,
          due_date: null,
          data: {
            entry_date: draft.entryDate,
            body_markdown: draft.bodyMarkdown,
            raw_capture: draft.bodyMarkdown,
            tags: draft.tags,
            pinned: draft.pinned,
            people_ids: draft.peopleIds ?? [],
            project_id: draft.projectId ?? null,
          },
        }),
      );
    },

    async update(id, draft) {
      const records = await journalRecords();
      const existing = records.find((item) => item.id === id);
      if (!existing) throw new Error("Journal entry is unavailable.");

      return mapRecordToJournalEntry(
        await store.updateRecord(id, {
          title: draft.title,
          status: existing.status ?? null,
          priority: existing.priority ?? null,
          due_date: null,
          data: {
            ...existing.data,
            entry_date: draft.entryDate,
            body_markdown: draft.bodyMarkdown,
            tags: draft.tags,
            pinned: draft.pinned,
            people_ids: draft.peopleIds ?? strings(existing.data.people_ids),
            ...(draft.projectId !== undefined || Object.prototype.hasOwnProperty.call(existing.data, "project_id")
              ? { project_id: draft.projectId ?? null }
              : {}),
          },
        }),
      );
    },
  };
}

export const journalRepository = createJournalRepository({
  listRecords,
  createRecord,
  updateRecord,
});
