import { describe, expect, it } from "vitest";
import type { QiBit } from "../types";
import { AsyncIngestionEngine } from "./asyncIngestionEngine";
import { emitPipelineEvent, getOpenBrainInstance } from "./eventPipelineService";

describe("Phase 2 Async Ingestion & Open Brain Pipeline Engine", () => {
  it("consumes event queue, indexes QiBits, derives open loops, and promotes memories", async () => {
    const engine = new AsyncIngestionEngine();
    const brain = getOpenBrainInstance();

    // 1. Create a transient capture bit with detailed text requiring action
    const testBit: QiBit = {
      id: "bit_async_101",
      type: "capture",
      title: "Review Q3 financial forecast with team lead",
      body: "Need to verify projected operational budget and confirm software license expense lines before end of week. Follow up with Mark on approval status.",
      metadata: {},
      provenance: {
        creator: "user",
        sourceSystem: "qilife",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      memoryState: "transient",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Emit event into persistent pipeline
    await emitPipelineEvent(
      {
        eventType: "bit.captured",
        bitId: testBit.id,
        payload: { source: "test_harness" },
      },
      testBit,
    );

    // 3. Trigger async ingestion processing batch
    const summary = await engine.processPendingEvents();

    // 4. Assert batch results
    expect(summary.eventsProcessed).toBeGreaterThan(0);
    expect(summary.bitsIndexed).toBeGreaterThan(0);
    expect(summary.openLoopsDerived).toBeGreaterThan(0);
    expect(summary.candidateActionsCreated).toBeGreaterThan(0);
    expect(summary.promotedMemories).toBeGreaterThan(0);

    // 5. Verify memory state was promoted
    const updatedBit = brain.getBit("bit_async_101");
    expect(updatedBit).toBeDefined();
    expect(updatedBit?.memoryState).toBe("promoted");
  });
});
