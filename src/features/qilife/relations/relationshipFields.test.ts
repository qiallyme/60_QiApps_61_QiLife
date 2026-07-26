import { describe, expect, it } from "vitest";
import { readRelationIds, relationStorageKey } from "./relationshipFields";

describe("relationshipFields", () => {
  it("reads canonical and legacy relationship values without discarding unresolved IDs", () => {
    expect(readRelationIds({ project_id: "p-1" }, "project", "project")).toEqual(["p-1"]);
    expect(readRelationIds({ project: "Legacy project" }, "project", "project")).toEqual(["Legacy project"]);
    expect(readRelationIds({ people_ids: ["p-1", "p-2"] }, "person", "person")).toEqual(["p-1", "p-2"]);
    expect(relationStorageKey("person", "owner")).toBe("owner_id");
  });
});
