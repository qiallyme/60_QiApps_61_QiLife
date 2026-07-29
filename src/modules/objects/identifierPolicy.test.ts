import { describe, expect, it } from "vitest";
import { identifierUniquenessKey, maskIdentifier, toIdentifierCreateInput } from "./identifierPolicy";

describe("object identifier policy", () => {
  it("normalizes uniqueness within object provider and identifier type", () => {
    expect(identifierUniquenessKey({
      objectId: "obj-1", provider: " Cloudflare ", identifierType: " Account ID ", identifierValue: " ABC-123 ",
    })).toBe("obj-1|cloudflare|account_id|abc-123");
  });

  it("allows the same external value under unrelated providers", () => {
    const first = identifierUniquenessKey({ objectId: "obj-1", provider: "Cloudflare", identifierType: "account_id", identifierValue: "1234" });
    const second = identifierUniquenessKey({ objectId: "obj-1", provider: "Supabase", identifierType: "account_id", identifierValue: "1234" });
    expect(first).not.toBe(second);
  });

  it("masks sensitive values by default", () => {
    expect(maskIdentifier("fake-account-123456")).toBe("••••3456");
    expect(maskIdentifier("123")).toBe("••••");
  });

  it("persists provider identifiers as child records", () => {
    const input = toIdentifierCreateInput({
      objectId: "internal-object-id", provider: "Cloudflare", identifierType: "account_id",
      identifierValue: "fake-123456", displayValue: "Cloudflare account",
      isPrimary: true, isSensitive: true, verifiedAt: "2026-07-29", sourceRecordId: null,
    });
    expect(input.entity_key).toBe("object_identifier");
    expect(input.data.object_id).toBe("internal-object-id");
    expect(input.data.identifier_value).toBe("fake-123456");
  });
});
