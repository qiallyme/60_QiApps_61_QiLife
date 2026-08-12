import type { QiBit } from "../../../features/qilife/types";

export interface PodcastGenerationOptions {
  title: string;
  durationMinutes?: number;
  sources: QiBit[];
}

export interface GeneratedPodcastOutput {
  podcastBit: QiBit;
  transcript: string;
  outline: string[];
}

/**
 * Native Podcast & Audio Briefing Generator Engine (ADR 0009)
 * Transforms curated Notebook context into connected podcast outputs with full source provenance.
 */
export async function generatePodcastFromSources(
  options: PodcastGenerationOptions,
): Promise<GeneratedPodcastOutput> {
  const duration = options.durationMinutes ?? 10;
  const sourceIds = options.sources.map((s) => s.id);

  const outline = [
    `Introduction: Executive Overview of ${options.title}`,
    `Deep Dive: Insights from ${options.sources.length} primary source material(s)`,
    `Operational Takeaways & Next Steps`,
  ];

  const transcript = `[00:00] Welcome to your QiLife Audio Briefing: "${options.title}".
[00:30] In today's ${duration}-minute briefing, we review key insights synthesized from ${options.sources.length} sources.
[01:00] Primary Source Highlights:
${options.sources.map((s) => `- ${s.title}: ${s.body ? s.body.slice(0, 100) + "..." : "Source reference"}`).join("\n")}
[05:00] Summary & Recommended Operational Focus: Maintain momentum across active open loops.`;

  const podcastBit: QiBit = {
    id: `podcast_${Math.random().toString(36).slice(2)}`,
    type: "podcast",
    title: `Podcast Briefing: ${options.title}`,
    body: transcript,
    metadata: {
      durationMinutes: duration,
      outline,
      sourceCount: options.sources.length,
      audioUrl: `/api/v1/outputs/podcasts/simulated_audio_${Date.now()}.mp3`,
    },
    provenance: {
      creator: "agent",
      sourceSystem: "qilife-podcast-engine",
      originatingQiBitIds: sourceIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    memoryState: "promoted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    podcastBit,
    transcript,
    outline,
  };
}
