import { describe, expect, it } from "vitest";
import type { QiBit, QiRecord } from "../types";
import { emitPipelineEvent, formatQiDecimal, getEventLogHistory, getOpenBrainInstance } from "./eventPipelineService";
import { migrateRecordsToBits } from "./qibitMigrationService";

describe("Phase 1 Thin Vertical Slice & Open-Brain Event Pipeline", () => {
  it("formats canonical QiDecimal 3-segment dot notation per ADR 0005", () => {
    expect(formatQiDecimal("task", 1)).toBe("61.20.001");
    expect(formatQiDecimal("journal", 42)).toBe("61.50.042");
    expect(formatQiDecimal("journal_entry", 42)).toBe("61.50.042");
    expect(formatQiDecimal("capture", 101)).toBe("61.10.101");
  });

  it("executes complete lifecycle: Capture -> Event -> QiBit -> Persistence -> Open Brain -> Open Loops", async () => {
    const rawBit: QiBit = {
      id: "test_bit_001",
      type: "capture",
      title: "Call Sarah tomorrow regarding Q3 marketing budget approval",
      body: "Need to confirm line items before Friday meeting.",
      metadata: {},
      provenance: {
        creator: "user",
        sourceSystem: "quick_capture",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      memoryState: "transient",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Emit event and process bit through pipeline
    const result = await emitPipelineEvent(
      {
        eventType: "bit.captured",
        bitId: rawBit.id,
        payload: { title: rawBit.title },
      },
      rawBit,
    );

    // 2. Verify Event Log persistence
    expect(result.event.eventType).toBe("bit.captured");
    expect(result.event.bitId).toBe("test_bit_001");
    const history = getEventLogHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]?.bitId).toBe("test_bit_001");

    // 3. Verify QiBit registered in Open Brain with formatted QiDecimal
    expect(result.bit).toBeDefined();
    expect(result.bit?.qiDecimal).toMatch(/^61\.\d{2}\.\d{3}$/);

    const brain = getOpenBrainInstance();
    const fetchedBit = brain.getBit("test_bit_001");
    expect(fetchedBit).toBeDefined();
    expect(fetchedBit?.title).toBe(rawBit.title);

    // 4. Verify derived Open Loops & Candidate Actions
    expect(result.detectedLoops.length).toBeGreaterThan(0);
    expect(result.candidateActions.length).toBeGreaterThan(0);
    expect(result.candidateActions[0]?.title).toBeDefined();
  });

  it("migrates legacy qilife.records to universal qilife.bits cleanly", async () => {
    const legacyRecords: QiRecord[] = [
      {
        id: "rec_101",
        entity_key: "task",
        title: "Review deployment scripts",
        status: "open",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: { when: "today" },
      },
      {
        id: "rec_102",
        entity_key: "journal_entry",
        title: "Quarterly Strategy Reflections",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: { text: "Focusing on core AI memory layer." },
      },
    ];

    const migration = await migrateRecordsToBits(legacyRecords);
    expect(migration.migratedCount).toBe(2);
    expect(migration.bits.length).toBe(2);
    expect(migration.bits[0]?.qiDecimal).toBe("61.20.001");
    expect(migration.bits[1]?.qiDecimal).toBe("61.50.002");
  });
});
