import { describe, expect, it } from "vitest";
import { mapRecordToProject } from "./projectRepository";

describe("projectRepository", () => {
  it("maps project identity and legacy owner relationship", () => {
    expect(mapRecordToProject({
      id: "p", entity_key: "project", title: "Launch", status: "active", priority: "high",
      due_date: "2026-08-01", data: { owner: "person-1", area: "work", tags: ["qilife"], brief: "Ship it" },
    })).toMatchObject({ id: "p", name: "Launch", ownerId: "person-1", area: "work", brief: "Ship it" });
  });
});
