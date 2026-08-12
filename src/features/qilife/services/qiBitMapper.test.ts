import { describe, expect, it } from "vitest";
import { qiBitToQiRecord, qiRecordToQiBit } from "./qiBitMapper";
import type { QiBit, QiRecord } from "../types";

describe("qiBitMapper", () => {
  it("normalizes a legacy QiRecord into a QiBit", () => {
    const record: QiRecord = {
      id: "rec_123",
      entity_key: "task",
      title: "Review QiLife 2.0 Plan",
      status: "next",
      priority: "high",
      due_date: "2026-08-15",
      data: {
        notes: "Detailed implementation steps",
        project_id: "proj_456",
        qiDecimal: "10.20.100",
      },
      source: "qilife",
      created_at: "2026-08-12T00:00:00.000Z",
      updated_at: "2026-08-12T00:00:00.000Z",
    };

    const bit = qiRecordToQiBit(record);

    expect(bit.id).toBe("rec_123");
    expect(bit.type).toBe("task");
    expect(bit.title).toBe("Review QiLife 2.0 Plan");
    expect(bit.body).toBe("Detailed implementation steps");
    expect(bit.qiDecimal).toBe("10.20.100");
    expect(bit.provenance.creator).toBe("user");
    expect(bit.metadata.project_id).toBe("proj_456");
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
    expect(record.entity_key).toBe("journal");
    expect(record.title).toBe("Morning Journal Entry");
    expect(record.data.qiDecimal).toBe("10.20.200");
    expect(record.data.memoryState).toBe("promoted");
  });
});
