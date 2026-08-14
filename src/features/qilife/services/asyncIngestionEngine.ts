import type { CandidateAction, OpenLoop, QiBit } from "../types";
import { getEventLogHistory, getOpenBrainInstance, type QiEvent } from "./eventPipelineService";
import { detectOpenLoops, openLoopToCandidateAction } from "./openLoopDetector";
import { qiApiRequest } from "../../../lib/qiApiClient";

export interface IngestionBatchSummary {
  eventsProcessed: number;
  bitsIndexed: number;
  openLoopsDerived: number;
  candidateActionsCreated: number;
  promotedMemories: number;
}

const PROCESSED_EVENTS_KEY = "qilife.processed_events.v1";

function getProcessedEventIds(): Set<string> {
  try {
    const raw = localStorage.getItem(PROCESSED_EVENTS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveProcessedEventIds(ids: Set<string>) {
  try {
    localStorage.setItem(PROCESSED_EVENTS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore storage failure
  }
}

/**
 * Open Brain Background Event Consumer & Async Ingestion Pipeline (ADR 0006)
 * Continuously processes unprocessed events, generates vector embeddings, extracts open loops, and promotes memories.
 */
export class AsyncIngestionEngine {
  private readonly processedIds: Set<string>;
  private isProcessing = false;

  constructor() {
    this.processedIds = getProcessedEventIds();
  }

  /**
   * Process all pending events in the persistent event log queue
   */
  public async processPendingEvents(): Promise<IngestionBatchSummary> {
    if (this.isProcessing) {
      return {
        eventsProcessed: 0,
        bitsIndexed: 0,
        openLoopsDerived: 0,
        candidateActionsCreated: 0,
        promotedMemories: 0,
      };
    }

    this.isProcessing = true;
    const history = getEventLogHistory();
    const brain = getOpenBrainInstance();

    let eventsProcessed = 0;
    let bitsIndexed = 0;
    let openLoopsDerived = 0;
    let candidateActionsCreated = 0;
    let promotedMemories = 0;

    try {
      const unprocessed = history.filter((event) => !this.processedIds.has(event.id));

      for (const event of unprocessed) {
        this.processedIds.add(event.id);
        eventsProcessed += 1;

        if (event.bitId) {
          const bit = brain.getBit(event.bitId);
          if (bit) {
            // 1. Index bit in Open Brain Memory
            brain.registerBit(bit);
            bitsIndexed += 1;

            // 2. Perform background vector indexing via 251_QiApi (with local fallback)
            void this.indexBitVector(bit);

            // 3. Scan & derive Open Loops
            const loops = detectOpenLoops(bit);
            openLoopsDerived += loops.length;

            loops.forEach((loop) => {
              const candidate = openLoopToCandidateAction(loop, bit);
              if (candidate) {
                candidateActionsCreated += 1;
              }
            });

            // 4. Memory Promotion Check (Promote transient notes with rich context)
            if (bit.memoryState === "transient" && (bit.body?.length ?? 0) > 100) {
              brain.promoteMemory(bit.id, "Auto-promoted by Async Ingestion Pipeline");
              promotedMemories += 1;
            }
          }
        }
      }

      saveProcessedEventIds(this.processedIds);
    } finally {
      this.isProcessing = false;
    }

    return {
      eventsProcessed,
      bitsIndexed,
      openLoopsDerived,
      candidateActionsCreated,
      promotedMemories,
    };
  }

  /**
   * Asynchronous vector embedding indexing to 251_QiApi
   */
  private async indexBitVector(bit: QiBit): Promise<void> {
    try {
      await qiApiRequest<{ success: boolean }>("/v1/brain/index", {
        method: "POST",
        body: JSON.stringify({
          bitId: bit.id,
          qiDecimal: bit.qiDecimal,
          title: bit.title,
          content: `${bit.title}\n${bit.body ?? ""}`,
          type: bit.type,
        }),
      });
    } catch {
      // Local fallback silently preserves offline state
    }
  }

  /**
   * Query derived candidate actions from Open Brain
   */
  public getCandidateActions(): CandidateAction[] {
    const brain = getOpenBrainInstance();
    const bits = brain.searchMemory();
    const candidateActions: CandidateAction[] = [];

    bits.forEach((bit) => {
      const loops = detectOpenLoops(bit);
      loops.forEach((loop) => {
        candidateActions.push(openLoopToCandidateAction(loop, bit));
      });
    });

    return candidateActions;
  }
}

export const globalIngestionEngine = new AsyncIngestionEngine();
