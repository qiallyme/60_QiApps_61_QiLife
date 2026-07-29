import { describe, expect, it } from "vitest";
import { readRelationIds, relationStorageKey } from "./relationshipFields";

describe("relationshipFields", () => {
  it("reads canonical and legacy relationship values without discarding unresolved IDs", () => {
    expect(readRelationIds({ project_id: "p-1" }, "project", "project")).toEqual(["p-1"]);
    expect(readRelationIds({ project: "Legacy project" }, "project", "project")).toEqual(["Legacy project"]);
    expect(readRelationIds({ people_ids: ["p-1", "p-2"] }, "person", "person")).toEqual(["p-1", "p-2"]);
    expect(relationStorageKey("person", "owner")).toBe("owner_id");
  });

  it("reads singular and plural canonical object IDs", () => {
    expect(readRelationIds({ object_id: "object-1" }, "object", "object")).toEqual(["object-1"]);
    expect(readRelationIds({ object_ids: ["object-1", "object-2"] }, "object", "object")).toEqual(["object-1", "object-2"]);
    expect(relationStorageKey("object", "object")).toBe("object_ids");
  });
});
