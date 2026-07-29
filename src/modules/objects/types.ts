import type { QiCreateRecordInput, QiRecord } from "../../features/qilife/types";

export type QiCreateRecordWithData = QiCreateRecordInput & {
  data: Record<string, unknown>;
};

export type ObjectSensitivity = "public" | "private" | "sensitive" | "restricted";

export interface ObjectDraft {
  title: string;
  status: string;
  objectType: ObjectType;
  description: string;
  sensitivity: ObjectSensitivity;
  primaryIdentifierId: string | null;
  lastVerifiedAt: string | null;
  archivedAt?: string | null;
}

export interface IdentifierDraft {
  objectId: string;
  provider: string;
  identifierType: string;
  identifierValue: string;
  displayValue: string;
  isPrimary: boolean;
  isSensitive: boolean;
  verifiedAt: string | null;
  sourceRecordId: string | null;
}

export interface SecretReferenceDraft {
  objectId: string;
  secretType: string;
  vaultProvider: string;
  vaultItemReference: string;
  lastVerifiedAt: string | null;
}

export type ObjectType =
  | "software_account"
  | "organization"
  | "device"
  | "vehicle"
  | "property"
  | "policy"
  | "legal_case"
  | "membership"
  | "financial_account_reference"
  | "government_account"
  | "other";

export type ObjectQiRecord = QiRecord & {
  entity_key: "object";
  data: QiRecord["data"] & {
    object_type: ObjectType;
    schema_version: number;
  };
};
