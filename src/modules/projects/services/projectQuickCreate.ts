import { createRecord, listRecords, updateRecord } from "../../../features/qilife/services/qilifeStore";
import type { QiCreateRecordInput, QiRecord, QiUpdateRecordInput } from "../../../features/qilife/types";

interface ProjectQuickCreateStore {
  listRecords(entityKey: string): Promise<QiRecord[]>;
  createRecord(input: QiCreateRecordInput): Promise<QiRecord>;
  updateRecord(id: string, patch: QiUpdateRecordInput): Promise<QiRecord>;
}

export function createProjectQuickCreate(store: ProjectQuickCreateStore) {
  async function record(entityKey: string, id: string) {
    return (await store.listRecords(entityKey)).find((item) => item.id === id) ?? null;
  }
  return {
    async linkPeople(projectId: string, peopleIds: string[]) {
      const project = await record("project", projectId);
      if (!project) throw new Error("Project is unavailable.");
      return store.updateRecord(projectId, { data: { ...project.data, people_ids: peopleIds } });
    },
    async linkDocument(documentId: string, projectId: string) {
      const document = await record("document", documentId);
      if (!document) throw new Error("Document is unavailable.");
      return store.updateRecord(documentId, { data: { ...document.data, project_id: projectId } });
    },
    async createEvent(projectId: string, input: { title: string; happenedAt: string; notes: string }) {
      return store.createRecord({
        entity_key: "event",
        title: input.title,
        data: { happened_at: input.happenedAt, notes: input.notes, project_id: projectId },
      });
    },
    async createDocument(projectId: string, input: { title: string; notes: string }) {
      return store.createRecord({
        entity_key: "document",
        title: input.title,
        data: { notes: input.notes, project_id: projectId },
      });
    },
  };
}

export const projectQuickCreate = createProjectQuickCreate({ listRecords, createRecord, updateRecord });
