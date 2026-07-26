import { describe, expect, it } from "vitest";
import type { QiCreateRecordInput, QiRecord } from "../../../features/qilife/types";
import { createProjectQuickCreate } from "./projectQuickCreate";

describe("projectQuickCreate", () => {
  it("links people and documents without replacing unrelated metadata", async () => {
    const records: QiRecord[] = [
      { id: "project", entity_key: "project", title: "Project", data: { vendor: 1 } },
      { id: "document", entity_key: "document", title: "Brief", data: { source_url: "x" } },
    ];
    const service = createProjectQuickCreate({
      listRecords: async (entity) => records.filter((record) => record.entity_key === entity),
      createRecord: async (input) => ({ id: "new", ...input, data: input.data ?? {} }),
      updateRecord: async (id, patch) => {
        const record = records.find((item) => item.id === id)!;
        Object.assign(record, patch);
        return record;
      },
    });

    await service.linkPeople("project", ["person-1", "person-2"]);
    await service.linkDocument("document", "project");
    expect(records[0].data).toEqual({ vendor: 1, people_ids: ["person-1", "person-2"] });
    expect(records[1].data).toEqual({ source_url: "x", project_id: "project" });
  });

  it("creates Events and Documents already linked to the Project", async () => {
    const created: QiCreateRecordInput[] = [];
    const service = createProjectQuickCreate({
      listRecords: async () => [],
      createRecord: async (input) => {
        created.push(input);
        return { id: "new", ...input, data: input.data ?? {} };
      },
      updateRecord: async () => { throw new Error("unused"); },
    });
    await service.createEvent("project", { title: "Meeting", happenedAt: "2026-07-25", notes: "Notes" });
    await service.createDocument("project", { title: "Brief", notes: "Notes" });
    expect(created).toEqual([
      expect.objectContaining({ entity_key: "event", data: expect.objectContaining({ project_id: "project" }) }),
      expect.objectContaining({ entity_key: "document", data: expect.objectContaining({ project_id: "project" }) }),
    ]);
  });
});
