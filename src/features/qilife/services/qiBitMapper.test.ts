import { describe, expect, it } from "vitest";
import type { QiBit, QiRecord } from "../types";
import { qiBitToQiRecord, qiRecordToQiBit } from "./qiBitMapper";

describe("qiBitMapper", () => {
  it("normalizes a legacy QiRecord into a QiBit", () => {
    const record: QiRecord = {
      id: "rec_123",
      entity_key: "task",
      title: "Review Q3 Budget",
      status: "open",
      created_at: "2026-08-12T00:00:00.000Z",
      updated_at: "2026-08-12T00:00:00.000Z",
      data: {
        notes: "Check spreadsheet with Sarah",
        qiDecimal: "10.20.100",
        due_date: "2026-08-15",
      },
    };

    const bit = qiRecordToQiBit(record);

    expect(bit.id).toBe("rec_123");
    expect(bit.type).toBe("task");
    expect(bit.title).toBe("Review Q3 Budget");
    expect(bit.body).toBe("Check spreadsheet with Sarah");
    expect(bit.qiDecimal).toBe("10.20.100");
    expect(bit.provenance.creator).toBe("user");
  });

  it("round-trips a QiBit back to QiRecord safely", () => {
    const bit: QiBit = {
      id: "bit_789",
      qiDecimal: "10.20.200",
      type: "journal",
      title: "Morning Journal Entry",
      body: "Reflecting on open loops today...",
      metadata: { tags: ["journal", "morning"] },
      provenance: {
        creator: "user",
        sourceSystem: "qilife",
        createdAt: "2026-08-12T00:00:00.000Z",
        updatedAt: "2026-08-12T00:00:00.000Z",
      },
      memoryState: "promoted",
      createdAt: "2026-08-12T00:00:00.000Z",
      updatedAt: "2026-08-12T00:00:00.000Z",
    };

    const record = qiBitToQiRecord(bit);
    expect(record.id).toBe("bit_789");
    expect(record.entity_key).toBe("journal_entry");
    expect(record.title).toBe("Morning Journal Entry");
    expect(record.data.qiDecimal).toBe("10.20.200");
  });
});
