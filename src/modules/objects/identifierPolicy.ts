import type { IdentifierDraft, QiCreateRecordWithData } from "./types";

function normalizedPart(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[\s-]+/g, "_");
}

function normalizedValue(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function identifierUniquenessKey(input: {
  objectId: string;
  provider: string;
  identifierType: string;
  identifierValue: string;
}) {
  return [
    input.objectId,
    normalizedPart(input.provider),
    normalizedPart(input.identifierType),
    normalizedValue(input.identifierValue),
  ].join("|");
}

export function maskIdentifier(value: string) {
  const normalized = value.trim();
  return normalized.length >= 4 ? `••••${normalized.slice(-4)}` : "••••";
}

export function toIdentifierCreateInput(draft: IdentifierDraft): QiCreateRecordWithData {
  if (!draft.objectId) throw new Error("Identifier requires an object ID.");
  if (!draft.provider.trim() || !draft.identifierType.trim() || !draft.identifierValue.trim()) {
    throw new Error("Provider, identifier type, and identifier value are required.");
  }
  return {
    entity_key: "object_identifier",
    title: draft.displayValue.trim() || `${draft.provider} ${draft.identifierType}`,
    status: "active",
    data: {
      object_id: draft.objectId,
      provider: draft.provider.trim(),
      identifier_type: normalizedPart(draft.identifierType),
      identifier_value: draft.identifierValue.trim(),
      display_value: draft.displayValue.trim(),
      is_primary: draft.isPrimary,
      is_sensitive: draft.isSensitive,
      verified_at: draft.verifiedAt,
      source_record_id: draft.sourceRecordId,
    },
  };
}
