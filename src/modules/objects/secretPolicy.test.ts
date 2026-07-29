import { describe, expect, it } from "vitest";
import { assertSafeSecretReference, toSecretReferenceCreateInput } from "./secretPolicy";

describe("secret reference policy", () => {
  it("requires only a vault reference and never plaintext material", () => {
    const input = toSecretReferenceCreateInput({
      objectId: "object-1", secretType: "password", vaultProvider: "Bitwarden",
      vaultItemReference: "item://fake-reference", lastVerifiedAt: "2026-07-29",
    });
    expect(input.entity_key).toBe("secret_reference");
    expect(input.data).not.toHaveProperty("secret");
    expect(input.data).not.toHaveProperty("password");
  });

  it.each(["password", "api_token", "private_key", "recovery_code", "mfa_seed"])("rejects plaintext %s fields", (key) => {
    expect(() => assertSafeSecretReference({
      object_id: "object-1", secret_type: "password", vault_provider: "Bitwarden",
      vault_item_reference: "item://fake", [key]: "fake-secret",
    })).toThrow("plaintext");
  });
});
