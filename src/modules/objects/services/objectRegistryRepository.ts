import {
  archiveRecord,
  createRecord,
  listAllRecords,
  updateRecord,
} from "../../../features/qilife/services/qilifeStore";
import type { QiCreateRecordInput, QiRecord, QiUpdateRecordInput } from "../../../features/qilife/types";
import { identifierUniquenessKey, toIdentifierCreateInput } from "../identifierPolicy";
import { toObjectCreateInput, validateObjectRecord } from "../objectSchema";
import { toSecretReferenceCreateInput } from "../secretPolicy";
import type { IdentifierDraft, ObjectDraft, ObjectQiRecord, SecretReferenceDraft } from "../types";

interface RegistryStore {
  listAllRecords(options?: { includeArchived?: boolean }): Promise<QiRecord[]>;
  createRecord(input: QiCreateRecordInput): Promise<QiRecord>;
  updateRecord(id: string, patch: QiUpdateRecordInput): Promise<QiRecord>;
  archiveRecord(id: string): Promise<void>;
}

export interface ObjectRelationshipDraft {
  fromObjectId: string;
  relationshipType: string;
  toObjectId: string;
  validFrom: string | null;
  validTo: string | null;
  sourceRecordId: string | null;
}

export interface ObjectHistoryDraft {
  objectId: string;
  title: string;
  recordType: string;
  occurredAt: string;
  sourceType: string;
  sourceReference: string;
  rawCapture: string;
  structuredData: Record<string, unknown>;
}

function objectPatch(draft: ObjectDraft): QiUpdateRecordInput {
  const input = toObjectCreateInput(draft);
  return { title: input.title, status: input.status, data: input.data };
}

function childOf(record: QiRecord, entityKey: string, objectId: string) {
  return record.entity_key === entityKey && record.data.object_id === objectId;
}

export function createObjectRegistryRepository(store: RegistryStore) {
  async function all(includeArchived = false) {
    return store.listAllRecords({ includeArchived });
  }

  return {
    async listObjects(includeArchived = false) {
      return (await all(includeArchived))
        .filter((record) => record.entity_key === "object") as ObjectQiRecord[];
    },

    async listSelectableObjects() {
      return (await this.listObjects(false)).filter((record) => !record.archived_at);
    },

    async getObject(id: string) {
      const record = (await all(true)).find((item) => item.entity_key === "object" && item.id === id);
      if (!record) return null;
      validateObjectRecord(record);
      return record;
    },

    async createObject(draft: ObjectDraft) {
      const created = await store.createRecord(toObjectCreateInput(draft));
      validateObjectRecord(created);
      return created;
    },

    async updateObject(id: string, draft: ObjectDraft) {
      const updated = await store.updateRecord(id, objectPatch(draft));
      validateObjectRecord(updated);
      return updated;
    },

    archiveObject(id: string) {
      return store.archiveRecord(id);
    },

    async listIdentifiers(objectId: string) {
      return (await all(true)).filter((record) => childOf(record, "object_identifier", objectId));
    },

    async addIdentifier(draft: IdentifierDraft) {
      const key = identifierUniquenessKey(draft);
      const duplicate = (await this.listIdentifiers(draft.objectId)).some((record) => (
        identifierUniquenessKey({
          objectId: String(record.data.object_id ?? ""),
          provider: String(record.data.provider ?? ""),
          identifierType: String(record.data.identifier_type ?? ""),
          identifierValue: String(record.data.identifier_value ?? ""),
        }) === key
      ));
      if (duplicate) throw new Error("This normalized identifier already exists for this object and provider.");
      return store.createRecord(toIdentifierCreateInput(draft));
    },

    async addRelationship(draft: ObjectRelationshipDraft) {
      if (!draft.fromObjectId || !draft.toObjectId || draft.fromObjectId === draft.toObjectId) {
        throw new Error("Object relationships require two different stable object IDs.");
      }
      return store.createRecord({
        entity_key: "object_relationship",
        title: draft.relationshipType,
        status: "active",
        data: {
          from_object_id: draft.fromObjectId,
          relationship_type: draft.relationshipType,
          to_object_id: draft.toObjectId,
          valid_from: draft.validFrom,
          valid_to: draft.validTo,
          source_record_id: draft.sourceRecordId,
        },
      });
    },

    async listRelationships(objectId: string) {
      return (await all(true)).filter((record) => record.entity_key === "object_relationship"
        && (record.data.from_object_id === objectId || record.data.to_object_id === objectId));
    },

    async addRecord(draft: ObjectHistoryDraft) {
      if (!draft.objectId || !draft.recordType || !draft.rawCapture) {
        throw new Error("Object history requires object, record type, and raw capture.");
      }
      return store.createRecord({
        entity_key: "object_record",
        title: draft.title,
        status: draft.recordType === "support_request" ? "open" : "recorded",
        data: {
          object_id: draft.objectId,
          record_type: draft.recordType,
          occurred_at: draft.occurredAt,
          source_type: draft.sourceType,
          source_reference: draft.sourceReference,
          raw_capture: draft.rawCapture,
          structured_data: draft.structuredData,
        },
      });
    },

    async listRecords(objectId: string) {
      return (await all(true)).filter((record) => childOf(record, "object_record", objectId));
    },

    addSecretReference(draft: SecretReferenceDraft) {
      return store.createRecord(toSecretReferenceCreateInput(draft));
    },

    async listSecretReferences(objectId: string) {
      return (await all(true)).filter((record) => childOf(record, "secret_reference", objectId));
    },
  };
}

export const objectRegistryRepository = createObjectRegistryRepository({
  listAllRecords,
  createRecord,
  updateRecord,
  archiveRecord,
});

export type ObjectRegistryRepository = ReturnType<typeof createObjectRegistryRepository>;
