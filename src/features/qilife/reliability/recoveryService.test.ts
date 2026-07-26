import { describe, expect, it, vi } from "vitest";
import {
  applyRecoveryToLocalRecords,
  createRecoveryExport,
  parseRecoveryExport,
  previewRecoveryRestore,
  restoreRecoveryExport,
  type RecoveryQiRecord,
} from "./recoveryService";

const journal: RecoveryQiRecord = {
  id: "journal-1",
  entity_key: "journal_entry",
  title: "Original entry",
  status: null,
  priority: null,
  due_date: null,
  data: {
    body_markdown: "# Edited\n\nCurrent body",
    raw_capture: "First exact capture\nwith spacing.",
    project_id: "project-1",
    people_ids: ["person-1"],
  },
  source: "qilife-api",
  created_at: "2026-07-20T10:00:00.000Z",
  updated_at: "2026-07-21T10:00:00.000Z",
  archived_at: null,
};

describe("QiLife recovery export", () => {
  it("preserves complete QiRecords and Journal source fields exactly", () => {
    const exported = createRecoveryExport({
      records: [journal],
      exportedAt: "2026-07-26T12:00:00.000Z",
      userId: "user-1",
    });

    expect(exported.schema).toBe("qilife-recovery-export");
    expect(exported.version).toBe(1);
    expect(exported.user_id).toBe("user-1");
    expect(exported.records[0]).toEqual(journal);
    expect(exported.records[0].data.raw_capture).toBe("First exact capture\nwith spacing.");
    expect(parseRecoveryExport(JSON.stringify(exported))).toEqual(exported);
  });

  it("rejects malformed files and duplicate IDs before changing data", () => {
    expect(() => parseRecoveryExport("{}")).toThrow("schema");
    const duplicate = createRecoveryExport({
      records: [journal, { ...journal }],
      exportedAt: "2026-07-26T12:00:00.000Z",
    });
    expect(() => parseRecoveryExport(JSON.stringify(duplicate))).toThrow("Duplicate record ID");
  });
});

describe("QiLife recovery restore", () => {
  it("previews creates, updates, idempotent skips, and newer conflicts by entity", () => {
    const incoming = createRecoveryExport({
      exportedAt: "2026-07-26T12:00:00.000Z",
      records: [
      journal,
      { ...journal, id: "task-1", entity_key: "task", updated_at: "2026-07-22T10:00:00.000Z" },
      { ...journal, id: "person-1", entity_key: "person", updated_at: "2026-07-19T10:00:00.000Z" },
      ],
    }).records;
    const existing = [
      { ...journal },
      { ...journal, id: "task-1", entity_key: "task", updated_at: "2026-07-21T10:00:00.000Z" },
      { ...journal, id: "person-1", entity_key: "person", updated_at: "2026-07-23T10:00:00.000Z" },
    ];

    expect(previewRecoveryRestore(incoming, existing)).toMatchObject({
      total: 3,
      create: 0,
      update: 1,
      skip: 1,
      newerConflict: 1,
      byEntity: { journal_entry: 1, task: 1, person: 1 },
    });
  });

  it("does not mutate until restore is confirmed and delegates an idempotent batch", async () => {
    const restoreRecords = vi.fn().mockResolvedValue({
      created: 1, updated: 0, skipped: 0, failed: 0, failures: [],
    });
    const exported = createRecoveryExport({
      records: [journal],
      exportedAt: "2026-07-26T12:00:00.000Z",
    });

    expect(restoreRecords).not.toHaveBeenCalled();
    await expect(restoreRecoveryExport(exported, restoreRecords)).resolves.toMatchObject({ created: 1 });
    expect(restoreRecords).toHaveBeenCalledWith([journal]);
  });

  it("restores into an empty local workspace without changing IDs or relationships", () => {
    const restored = applyRecoveryToLocalRecords([journal], []);

    expect(restored.result).toEqual({
      created: 1,
      updated: 0,
      skipped: 0,
      failed: 0,
      failures: [],
    });
    expect(restored.records).toEqual([journal]);
    expect(restored.records[0].data).toEqual(journal.data);
  });

  it("is idempotent, skips newer records, and never deletes records omitted from the export", () => {
    const unrelated = { ...journal, id: "unrelated", entity_key: "person" };
    const newer = { ...journal, title: "Newer local value", updated_at: "2026-07-22T10:00:00.000Z" };

    const restored = applyRecoveryToLocalRecords([journal], [newer, unrelated]);

    expect(restored.result).toMatchObject({
      created: 0,
      updated: 0,
      skipped: 1,
      failed: 0,
    });
    expect(restored.records).toContainEqual(newer);
    expect(restored.records).toContainEqual(unrelated);

    const repeated = applyRecoveryToLocalRecords(
      restored.records as RecoveryQiRecord[],
      restored.records,
    );
    expect(repeated.result.skipped).toBe(2);
    expect(repeated.records).toEqual(restored.records);
  });
});
