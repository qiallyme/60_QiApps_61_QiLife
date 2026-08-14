import type { CandidateAction, OpenLoop, QiBit, QiBitType } from "../types";
import { OpenBrainService } from "./openBrainService";
import { detectOpenLoops, openLoopToCandidateAction } from "./openLoopDetector";

export interface QiEvent {
  id: string;
  ownerId?: string;
  eventType:
    | "bit.captured"
    | "bit.updated"
    | "bit.promoted"
    | "bit.archived"
    | "loop.detected"
    | "capability.executed";
  bitId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface QiEventInput {
  eventType: QiEvent["eventType"];
  bitId?: string;
  payload?: Record<string, unknown>;
}

export interface PipelineExecutionResult {
  event: QiEvent;
  bit?: QiBit;
  detectedLoops: OpenLoop[];
  candidateActions: CandidateAction[];
}

const LOCAL_EVENTS_KEY = "qilife.local.events.v1";
const openBrainInstance = new OpenBrainService();

function readLocalEvents(): QiEvent[] {
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY);
    return raw ? (JSON.parse(raw) as QiEvent[]) : [];
  } catch {
    return [];
  }
}

function writeLocalEvents(events: QiEvent[]) {
  try {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  } catch {
    // Session fallback
  }
}

/**
 * Format canonical QiDecimal for a given QiBitType or entity key (ADR 0005)
 */
export function formatQiDecimal(type: string, index: number): string {
  const categoryMap: Record<string, string> = {
    capture: "10",
    thought: "10",
    qibit: "10",
    task: "20",
    action: "20",
    project: "30",
    person: "40",
    journal: "50",
    journal_entry: "50",
    expense: "60",
    document: "70",
    notebook: "70",
    podcast: "70",
    output: "70",
  };

  const category = categoryMap[type.toLowerCase()] ?? "10";
  const formattedIndex = String(index).padStart(3, "0");
  return `61.${category}.${formattedIndex}`;
}

/**
 * Persistent Event Log & Open Brain Event-Driven Pipeline (ADR 0006)
 * Executes thin vertical slice: Capture -> Event -> QiBit -> Persistence -> Provenance -> Open Brain -> Operational State
 */
export async function emitPipelineEvent(
  input: QiEventInput,
  bitToProcess?: QiBit,
): Promise<PipelineExecutionResult> {
  const event: QiEvent = {
    id: `evt_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`,
    eventType: input.eventType,
    bitId: input.bitId ?? bitToProcess?.id,
    payload: input.payload ?? {},
    createdAt: new Date().toISOString(),
  };

  // Persist event to local storage log
  const existingEvents = readLocalEvents();
  writeLocalEvents([event, ...existingEvents]);

  let registeredBit: QiBit | undefined;
  const detectedLoops: OpenLoop[] = [];
  const candidateActions: CandidateAction[] = [];

  if (bitToProcess) {
    // 1. Assign canonical QiDecimal if missing
    if (!bitToProcess.qiDecimal) {
      bitToProcess.qiDecimal = formatQiDecimal(bitToProcess.type, existingEvents.length + 1);
    }

    // 2. Register with Open Brain memory engine
    registeredBit = openBrainInstance.registerBit(bitToProcess);

    // 3. Detect Open Loops from QiBit payload
    const loops = detectOpenLoops(registeredBit);
    loops.forEach((loop) => {
      detectedLoops.push(loop);
      const candidate = openLoopToCandidateAction(loop, registeredBit!);
      candidateActions.push(candidate);
    });
  }

  return {
    event,
    bit: registeredBit,
    detectedLoops,
    candidateActions,
  };
}

export function getOpenBrainInstance(): OpenBrainService {
  return openBrainInstance;
}

export function getEventLogHistory(): QiEvent[] {
  return readLocalEvents();
}
