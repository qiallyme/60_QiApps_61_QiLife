import { describe, expect, it } from "vitest";
import { OpenBrainService } from "./openBrainService";
import { detectOpenLoops, openLoopToCandidateAction } from "./openLoopDetector";
import type { QiBit } from "../types";

describe("OpenBrainService & OpenLoopDetector", () => {
  it("registers and searches bits in Open Brain", () => {
    const brain = new OpenBrainService();
    const bit: QiBit = {
      id: "bit_1",
      type: "project",
      title: "QiLife 2.0 Architectural Overhaul",
      body: "Building Open Brain memory and derived open loops",
      metadata: { tags: ["qilife", "architecture"] },
      provenance: { creator: "user", createdAt: "2026-08-12T00:00:00Z", updatedAt: "2026-08-12T00:00:00Z" },
      memoryState: "transient",
      createdAt: "2026-08-12T00:00:00Z",
      updatedAt: "2026-08-12T00:00:00Z",
    };

    brain.registerBit(bit);
    const searchResults = brain.searchMemory({ queryText: "Overhaul" });
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].id).toBe("bit_1");
  });

  it("promotes memory from transient to durable promoted state", () => {
    const brain = new OpenBrainService();
    const bit: QiBit = {
      id: "bit_2",
      type: "journal",
      title: "Key Decision on System Architecture",
      metadata: {},
      provenance: { creator: "user", createdAt: "2026-08-12T00:00:00Z", updatedAt: "2026-08-12T00:00:00Z" },
      memoryState: "transient",
      createdAt: "2026-08-12T00:00:00Z",
      updatedAt: "2026-08-12T00:00:00Z",
    };

    brain.registerBit(bit);
    const promoted = brain.promoteMemory("bit_2", "Crucial architectural principle");
    expect(promoted.memoryState).toBe("promoted");
    expect(brain.getPromotedMemories().length).toBe(1);
  });

  it("detects open loops and builds candidate actions", () => {
    const bit: QiBit = {
      id: "bit_3",
      type: "capture",
      title: "Quick note from phone call",
      body: "Need to pay electric bill by Friday and waiting on response from landlord",
      metadata: {},
      provenance: { creator: "user", createdAt: "2026-08-12T00:00:00Z", updatedAt: "2026-08-12T00:00:00Z" },
      memoryState: "transient",
      createdAt: "2026-08-12T00:00:00Z",
      updatedAt: "2026-08-12T00:00:00Z",
    };

    const loops = detectOpenLoops(bit);
    expect(loops.length).toBeGreaterThanOrEqual(1);

    const actionLoop = loops.find((l) => l.loopType === "action");
    expect(actionLoop).toBeDefined();

    if (actionLoop) {
      const candidateAction = openLoopToCandidateAction(actionLoop, bit);
      expect(candidateAction.status).toBe("candidate");
      expect(candidateAction.originatingQiBitIds).toContain("bit_3");
      expect(candidateAction.consequential).toBe(true); // 'pay electric bill' contains 'pay'
    }
  });
});
