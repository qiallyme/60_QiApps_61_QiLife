import type { QiRecord } from "../types";
import { readRelationIds } from "../relations/relationshipFields";

export function recordRoute(record: QiRecord): string | null {
  switch (record.entity_key) {
    case "task":
      return `/actions/${record.id}`;
    case "project":
      return `/projects/${record.id}`;
    case "person":
      return `/people/${record.id}`;
    case "journal_entry":
      return `/journal/${record.id}`;
    default: {
      const projectId = readRelationIds(record.data, "project", "project")[0];
      if (projectId) return `/projects/${projectId}`;
      const personId = readRelationIds(record.data, "person", "person")[0] ?? readRelationIds(record.data, "person", "owner")[0];
      if (personId) return `/people/${personId}`;
      return null;
    }
  }
}
