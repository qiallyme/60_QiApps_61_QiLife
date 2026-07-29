import type { QiCreateRecordWithData, SecretReferenceDraft } from "./types";

const FORBIDDEN_KEYS = new Set([
  "secret",
  "password",
  "api_token",
  "token",
  "private_key",
  "recovery_code",
  "recovery_codes",
  "mfa_seed",
]);

export function assertSafeSecretReference(value: Record<string, unknown>) {
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key.toLocaleLowerCase())) {
      throw new Error(`Secret references cannot contain plaintext ${key}.`);
    }
  }
}

export function toSecretReferenceCreateInput(draft: SecretReferenceDraft): QiCreateRecordWithData {
  const data = {
    object_id: draft.objectId,
    secret_type: draft.secretType.trim(),
    vault_provider: draft.vaultProvider.trim(),
    vault_item_reference: draft.vaultItemReference.trim(),
    last_verified_at: draft.lastVerifiedAt,
  };
  assertSafeSecretReference(data);
  if (!data.object_id || !data.secret_type || !data.vault_provider || !data.vault_item_reference) {
    throw new Error("Secret references require object, type, vault provider, and item reference.");
  }
  return {
    entity_key: "secret_reference",
    title: `${data.vault_provider} ${data.secret_type} reference`,
    status: "active",
    data,
  };
}
