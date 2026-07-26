import { beforeEach, describe, expect, it, vi } from "vitest";
import { QiLifePeopleRepository } from "./peopleRepository";

const store = vi.hoisted(() => ({
  listRecords: vi.fn(),
  listAllRecords: vi.fn(),
  createRecord: vi.fn(),
  updateRecord: vi.fn(),
  archiveRecord: vi.fn(),
}));

vi.mock("../../../features/qilife/services/qilifeStore", () => store);

describe("QiLifePeopleRepository related records", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns shared QiRecords linked through people_ids", async () => {
    store.listAllRecords.mockResolvedValue([
      {
        id: "journal-1",
        entity_key: "journal_entry",
        title: "Coffee with Alex",
        data: {
          people_ids: ["person-1"],
          body_markdown: "Caught up over coffee.",
          entry_date: "2026-07-25",
        },
      },
      {
        id: "journal-2",
        entity_key: "journal_entry",
        title: "Unrelated",
        data: { people_ids: ["person-2"] },
      },
    ]);

    const records = await new QiLifePeopleRepository().listRelatedRecords("person-1");

    expect(records).toEqual([
      expect.objectContaining({
        id: "journal-1",
        entityType: "journal",
        targetRoute: "/journal/journal-1",
      }),
    ]);
  });
});
