import { listAllRecords } from "../services/qilifeStore";
import type { QiRecord } from "../types";
import { readRelationIds } from "./relationshipFields";

type LoadRecords = () => Promise<QiRecord[]>;

function linkedTo(record: QiRecord, entity: "project" | "person" | "thread", id: string): boolean {
  const field = entity === "person" ? "person" : entity;
  return readRelationIds(record.data, entity, field).includes(id)
    || (entity === "person" && readRelationIds(record.data, entity, "owner").includes(id));
}

export function createRelationResolver(loadRecords: LoadRecords) {
  async function activeRecords() {
    return (await loadRecords()).filter((record) => !record.archived_at);
  }

  return {
    async getRelatedRecords(recordId: string) {
      const records = await activeRecords();
      const target = records.find((record) => record.id === recordId);
      if (!target) return [];
      return records.filter((record) => {
        if (record.id === recordId) return false;
        if (target.entity_key === "project" && linkedTo(record, "project", recordId)) return true;
        if (target.entity_key === "person" && linkedTo(record, "person", recordId)) return true;
        if (target.entity_key === "thread" && linkedTo(record, "thread", recordId)) return true;
        return linkedTo(target, "project", record.id)
          || linkedTo(target, "person", record.id)
          || linkedTo(target, "thread", record.id);
      });
    },

    async getActionsForProject(projectId: string) {
      return (await activeRecords()).filter((record) => record.entity_key === "task" && linkedTo(record, "project", projectId));
    },

    async getPeopleForProject(projectId: string) {
      const records = await activeRecords();
      const project = records.find((record) => record.id === projectId && record.entity_key === "project");
      const actionPersonIds = records
        .filter((record) => record.entity_key === "task" && linkedTo(record, "project", projectId))
        .flatMap((record) => readRelationIds(record.data, "person", "person"));
      const ids = new Set([
        ...(project ? readRelationIds(project.data, "person", "person") : []),
        ...(project ? readRelationIds(project.data, "person", "owner") : []),
        ...actionPersonIds,
      ]);
      return records.filter((record) => record.entity_key === "person" && ids.has(record.id));
    },

    async getJournalForProject(projectId: string) {
      return (await activeRecords()).filter((record) => record.entity_key === "journal_entry" && linkedTo(record, "project", projectId));
    },

    async getRecordsForPerson(personId: string) {
      return (await activeRecords()).filter((record) => record.entity_key !== "person" && linkedTo(record, "person", personId));
    },
  };
}

export const relationResolver = createRelationResolver(listAllRecords);

export type RelationResolver = ReturnType<typeof createRelationResolver>;
