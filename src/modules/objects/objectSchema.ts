import type { QiCreateRecordInput, QiRecord } from "../../features/qilife/types";
import type { ObjectDraft, ObjectQiRecord, ObjectType } from "./types";

export const OBJECT_ENTITY_KEYS = [
  "object",
  "object_identifier",
  "object_relationship",
  "object_record",
  "secret_reference",
] as const;

export const OBJECT_TYPES = [
  "software_account",
  "organization",
  "device",
  "vehicle",
  "property",
  "policy",
  "legal_case",
  "membership",
  "financial_account_reference",
  "government_account",
  "other",
] as const satisfies readonly ObjectType[];

export function toObjectCreateInput(draft: ObjectDraft): QiCreateRecordInput {
  return {
    entity_key: "object",
    title: draft.title.trim(),
    status: draft.status,
    data: {
      object_type: draft.objectType,
      description: draft.description,
      sensitivity: draft.sensitivity,
      schema_version: 1,
      primary_identifier_id: draft.primaryIdentifierId,
      last_verified_at: draft.lastVerifiedAt,
      archived_at: draft.archivedAt ?? null,
    },
  };
}

export function validateObjectRecord(record: Omit<QiRecord, "id"> | QiRecord): asserts record is ObjectQiRecord {
  if (record.entity_key !== "object") throw new Error("Expected an object record.");
  if (!OBJECT_TYPES.includes(record.data.object_type as ObjectType)) throw new Error("Unsupported object type.");
  if (record.data.schema_version !== 1) throw new Error("Unsupported object schema version.");
}
