import { describe, expect, it } from "vitest";
import { OBJECT_ENTITY_KEYS, OBJECT_TYPES, toObjectCreateInput, validateObjectRecord } from "./objectSchema";

describe("object registry schema", () => {
  it("uses the five canonical QiRecord entity keys", () => {
    expect(OBJECT_ENTITY_KEYS).toEqual(["object", "object_identifier", "object_relationship", "object_record", "secret_reference"]);
  });

  it("supports every initial universal object type", () => {
    expect(OBJECT_TYPES).toEqual(["software_account", "organization", "device", "vehicle", "property", "policy", "legal_case", "membership", "financial_account_reference", "government_account", "other"]);
  });

  it("keeps provider identity out of canonical QiRecord identity", () => {
    const input = toObjectCreateInput({
      title: "Cloudflare", status: "active", objectType: "software_account",
      description: "Hosting account", sensitivity: "private",
      primaryIdentifierId: "identifier-child-id", lastVerifiedAt: "2026-07-29",
    });
    expect(input.entity_key).toBe("object");
    expect(input.data.primary_identifier_id).toBe("identifier-child-id");
    expect(input).not.toHaveProperty("id");
  });

  it("rejects an unsupported object type", () => {
    expect(() => validateObjectRecord({
      entity_key: "object", title: "Unknown", status: "active",
      data: { object_type: "credential", schema_version: 1 },
    })).toThrow("object type");
  });
});
