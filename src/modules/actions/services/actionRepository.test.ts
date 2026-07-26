import { describe, expect, it } from "vitest";
import type { QiRecord } from "../../../features/qilife/types";
import { createActionRepository, mapRecordToAction } from "./actionRepository";

describe("actionRepository", () => {
  it("maps legacy relationships and writes canonical IDs without losing unknown data", async () => {
    const original: QiRecord = {
      id: "a-1", entity_key: "task", title: "Ship", status: "next",
      data: { project: "p-1", person: "person-1", vendor_field: 42 },
    };
    expect(mapRecordToAction(original).projectId).toBe("p-1");

    let patch: Record<string, unknown> | undefined;
    const repo = createActionRepository({
      listRecords: async () => [original],
      createRecord: async (input) => ({ id: "new", ...input, data: input.data ?? {} }),
      updateRecord: async (_id, input) => {
        patch = input.data;
        return { ...original, ...input, data: input.data ?? {} };
      },
    });
    await repo.update("a-1", {
      title: "Ship", status: "next", priority: "high", dueDate: null,
      projectId: "p-2", peopleIds: ["person-1"], threadId: null, context: "computer", notes: "",
    });
    expect(patch).toMatchObject({ project_id: "p-2", people_ids: ["person-1"], vendor_field: 42 });
  });
});
