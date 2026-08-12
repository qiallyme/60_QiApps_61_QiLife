import { describe, expect, it } from "vitest";
import { generatePodcastFromSources } from "./podcastGenerator";
import type { QiBit } from "../../../features/qilife/types";

describe("podcastGenerator Engine (ADR 0009)", () => {
  it("generates a podcast QiBit with full source provenance", async () => {
    const source1: QiBit = {
      id: "src_1",
      type: "document",
      title: "QiLife 2.0 Product Roadmap",
      body: "Strategic plan for Open Brain memory and podcast generation",
      metadata: {},
      provenance: { creator: "user", createdAt: "2026-08-12T00:00:00Z", updatedAt: "2026-08-12T00:00:00Z" },
      memoryState: "promoted",
      createdAt: "2026-08-12T00:00:00Z",
      updatedAt: "2026-08-12T00:00:00Z",
    };

    const output = await generatePodcastFromSources({
      title: "Weekly Product Briefing",
      durationMinutes: 15,
      sources: [source1],
    });

    expect(output.podcastBit.type).toBe("podcast");
    expect(output.podcastBit.title).toContain("Weekly Product Briefing");
    expect(output.podcastBit.provenance.originatingQiBitIds).toContain("src_1");
    expect(output.transcript).toContain("Weekly Product Briefing");
    expect(output.outline.length).toBeGreaterThan(0);
  });
});
