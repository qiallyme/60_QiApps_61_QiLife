import { describe, expect, it } from "vitest";
import type { QiRecord } from "../../../features/qilife/types";
import {
  createJournalRepository,
  mapRecordToJournalEntry,
} from "./journalRepository";
import type { JournalRecordStore } from "../types";

function record(overrides: Partial<QiRecord> = {}): QiRecord {
  return {
    id: "journal-1",
    entity_key: "journal_entry",
    title: "Entry",
    status: null,
    priority: null,
    due_date: null,
    data: {},
    source: "qilife-local",
    created_at: "2026-07-24T00:00:00.000Z",
    updated_at: "2026-07-24T00:00:00.000Z",
    archived_at: null,
    ...overrides,
  };
}

function memoryStore(initial: QiRecord[] = []) {
  let records = structuredClone(initial);
  const store: JournalRecordStore = {
    async listRecords(entityKey) {
      return records.filter((item) => item.entity_key === entityKey);
    },
    async createRecord(input) {
      const created = record({
        id: `journal-${records.length + 1}`,
        entity_key: input.entity_key,
        title: input.title,
        status: input.status,
        priority: input.priority,
        due_date: input.due_date,
        data: input.data ?? {},
      });
      records.push(created);
      return structuredClone(created);
    },
    async updateRecord(id, patch) {
      const index = records.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("Record not found.");
      records[index] = {
        ...records[index],
        ...patch,
        data: patch.data ?? records[index].data,
      };
      return structuredClone(records[index]);
    },
  };
  return { store, records: () => structuredClone(records) };
}

const draft = {
  title: "Today",
  entryDate: "2026-07-24",
  bodyMarkdown: "# Current",
  tags: ["life"],
  pinned: true,
  peopleIds: ["person-1"],
};

describe("Journal record mapping", () => {
  it("maps shared fields without using due_date", () => {
    const entry = mapRecordToJournalEntry(record({
      due_date: null,
      data: {
        entry_date: "2026-07-24",
        body_markdown: "# Current",
        raw_capture: "# Original",
        tags: ["life"],
        pinned: true,
        people_ids: ["person-1"],
      },
    }));

    expect(entry).toMatchObject({
      entryDate: "2026-07-24",
      bodyMarkdown: "# Current",
      rawCapture: "# Original",
      tags: ["life"],
      pinned: true,
      peopleIds: ["person-1"],
    });
  });

  it("reads legacy body without fabricating raw capture", () => {
    const entry = mapRecordToJournalEntry(record({
      data: { entry_date: "2026-07-23", body: "legacy", tags: [] },
    }));

    expect(entry.bodyMarkdown).toBe("legacy");
    expect(entry.rawCapture).toBeUndefined();
  });

  it("rejects a non-journal record", () => {
    expect(() => mapRecordToJournalEntry(record({ entity_key: "task" }))).toThrow(
      "Record is not a Journal entry.",
    );
  });
});

describe("Journal repository", () => {
  it("creates a shared record with immutable raw capture and no due date", async () => {
    const memory = memoryStore();
    const repository = createJournalRepository(memory.store);

    await repository.create(draft);

    expect(memory.records()[0]).toMatchObject({
      entity_key: "journal_entry",
      title: "Today",
      due_date: null,
      data: {
        entry_date: "2026-07-24",
        body_markdown: "# Current",
        raw_capture: "# Current",
        tags: ["life"],
        pinned: true,
      },
    });
  });

  it("edits body and metadata without changing raw capture or unrelated data", async () => {
    const memory = memoryStore([record({
      data: {
        entry_date: "2026-07-23",
        body_markdown: "# Original",
        raw_capture: "# Original",
        tags: [],
        pinned: false,
        thread: "thread-1",
      },
    })]);
    const repository = createJournalRepository(memory.store);

    await repository.update("journal-1", draft);

    expect(memory.records()[0].data).toEqual({
      entry_date: "2026-07-24",
      body_markdown: "# Current",
      raw_capture: "# Original",
      tags: ["life"],
      pinned: true,
      people_ids: ["person-1"],
      thread: "thread-1",
    });
  });

  it("does not add raw capture when a legacy record has none", async () => {
    const memory = memoryStore([record({
      data: { entry_date: "2026-07-23", body: "legacy", tags: [] },
    })]);
    const repository = createJournalRepository(memory.store);

    await repository.update("journal-1", draft);

    expect(memory.records()[0].data).not.toHaveProperty("raw_capture");
  });

  it("returns null for an unavailable entry", async () => {
    const repository = createJournalRepository(memoryStore().store);
    await expect(repository.get("missing")).resolves.toBeNull();
  });
});
