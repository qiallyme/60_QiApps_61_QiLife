import { describe, expect, it } from "vitest";
import type { QiCreateRecordInput, QiRecord, QiUpdateRecordInput } from "../../../features/qilife/types";
import { createObjectRegistryRepository } from "./objectRegistryRepository";

function inMemoryStore(seed: QiRecord[] = []) {
  let records = [...seed];
  let count = seed.length;
  return {
    async listAllRecords(options: { includeArchived?: boolean } = {}) {
      return records.filter((record) => options.includeArchived || !record.archived_at);
    },
    async createRecord(input: QiCreateRecordInput) {
      const now = "2026-07-29T12:00:00.000Z";
      const record: QiRecord = {
        id: `record-${++count}`,
        ...input,
        data: input.data ?? {},
        created_at: now,
        updated_at: now,
        archived_at: null,
      };
      records.push(record);
      return record;
    },
    async updateRecord(id: string, patch: QiUpdateRecordInput) {
      const index = records.findIndex((record) => record.id === id);
      if (index < 0) throw new Error("Record not found.");
      records[index] = { ...records[index], ...patch, data: patch.data ?? records[index].data };
      return records[index];
    },
    async archiveRecord(id: string) {
      const record = records.find((item) => item.id === id);
      if (!record) throw new Error("Record not found.");
      record.archived_at = "2026-07-29T13:00:00.000Z";
    },
  };
}

const softwareDraft = {
  title: "Cloudflare",
  status: "active",
  objectType: "software_account" as const,
  description: "Hosting",
  sensitivity: "private" as const,
  primaryIdentifierId: null,
  lastVerifiedAt: "2026-07-29",
};

describe("Object Registry repository", () => {
  it("keeps provider identifiers as multiple children of one stable object ID", async () => {
    const repository = createObjectRegistryRepository(inMemoryStore());
    const object = await repository.createObject(softwareDraft);
    const first = await repository.addIdentifier({
      objectId: object.id, provider: "Cloudflare", identifierType: "account_id",
      identifierValue: "fake-account-1", displayValue: "Account ID",
      isPrimary: true, isSensitive: true, verifiedAt: null, sourceRecordId: null,
    });
    const second = await repository.addIdentifier({
      objectId: object.id, provider: "Cloudflare", identifierType: "customer_id",
      identifierValue: "fake-customer-1", displayValue: "Customer ID",
      isPrimary: false, isSensitive: true, verifiedAt: null, sourceRecordId: null,
    });

    expect(object.id).not.toBe(first.id);
    expect([first.data.object_id, second.data.object_id]).toEqual([object.id, object.id]);
    expect(await repository.listIdentifiers(object.id)).toHaveLength(2);
  });

  it("rejects duplicate normalized identifiers for the same object provider and type", async () => {
    const repository = createObjectRegistryRepository(inMemoryStore());
    const object = await repository.createObject(softwareDraft);
    const base = {
      objectId: object.id, provider: "Cloudflare", identifierType: "account id",
      identifierValue: " FAKE-123 ", displayValue: "Account",
      isPrimary: false, isSensitive: false, verifiedAt: null, sourceRecordId: null,
    };
    await repository.addIdentifier(base);
    await expect(repository.addIdentifier({
      ...base, provider: " cloudflare ", identifierType: "account-id", identifierValue: "fake-123",
    })).rejects.toThrow("already exists");
  });

  it("permits the same value under unrelated providers", async () => {
    const repository = createObjectRegistryRepository(inMemoryStore());
    const object = await repository.createObject(softwareDraft);
    const base = {
      objectId: object.id, identifierType: "account_id", identifierValue: "fake-123",
      displayValue: "Account", isPrimary: false, isSensitive: false,
      verifiedAt: null, sourceRecordId: null,
    };
    await repository.addIdentifier({ ...base, provider: "Cloudflare" });
    await expect(repository.addIdentifier({ ...base, provider: "Supabase" })).resolves.toBeTruthy();
  });

  it("preserves object history raw capture separately", async () => {
    const repository = createObjectRegistryRepository(inMemoryStore());
    const object = await repository.createObject(softwareDraft);
    const record = await repository.addRecord({
      objectId: object.id, title: "Support response", recordType: "support_request",
      occurredAt: "2026-07-29", sourceType: "email", sourceReference: "message-fake-1",
      rawCapture: "Original fake support response.", structuredData: { state: "open" },
    });
    expect(record.data.raw_capture).toBe("Original fake support response.");
    expect(record.data.structured_data).toEqual({ state: "open" });
  });

  it("keeps archived objects readable but out of normal selectors", async () => {
    const repository = createObjectRegistryRepository(inMemoryStore());
    const object = await repository.createObject(softwareDraft);
    await repository.archiveObject(object.id);
    expect(await repository.getObject(object.id)).toMatchObject({ id: object.id });
    expect(await repository.listSelectableObjects()).toEqual([]);
  });
});
