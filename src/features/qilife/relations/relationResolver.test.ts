import { describe, expect, it } from "vitest";
import type { QiRecord } from "../types";
import { createRelationResolver } from "./relationResolver";

const records: QiRecord[] = [
  { id: "project-1", entity_key: "project", title: "QiLife", data: { people_ids: ["person-1"] } },
  { id: "person-1", entity_key: "person", title: "Chris", data: {} },
  { id: "action-1", entity_key: "task", title: "Ship", data: { project_id: "project-1", people_ids: ["person-1"] } },
  { id: "journal-1", entity_key: "journal_entry", title: "Notes", data: { project: "project-1" } },
  { id: "other", entity_key: "task", title: "Other", data: { project_id: "project-10" } },
  { id: "object-1", entity_key: "object", title: "Cloudflare", data: { object_type: "software_account", schema_version: 1 } },
  { id: "object-2", entity_key: "object", title: "Supabase", data: { object_type: "software_account", schema_version: 1 } },
  { id: "linked-object-action", entity_key: "task", title: "Review hosting", data: { object_ids: ["object-1"] } },
];

describe("relationResolver", () => {
  it("queries canonical and legacy relationships without partial matches", async () => {
    const resolver = createRelationResolver(async () => records);
    expect((await resolver.getActionsForProject("project-1")).map((r) => r.id)).toEqual(["action-1"]);
    expect((await resolver.getJournalForProject("project-1")).map((r) => r.id)).toEqual(["journal-1"]);
    expect((await resolver.getRecordsForPerson("person-1")).map((r) => r.id)).toEqual(["project-1", "action-1"]);
    expect((await resolver.getPeopleForProject("project-1")).map((r) => r.id)).toEqual(["person-1"]);
  });

  it("resolves stable object IDs to human-readable object records", async () => {
    const resolver = createRelationResolver(async () => records);
    expect(await resolver.getObjectsForRecord("linked-object-action")).toEqual([
      expect.objectContaining({ id: "object-1", title: "Cloudflare" }),
    ]);
    expect((await resolver.getRecordsForObject("object-1")).map((record) => record.id))
      .toEqual(["linked-object-action"]);
  });
});
