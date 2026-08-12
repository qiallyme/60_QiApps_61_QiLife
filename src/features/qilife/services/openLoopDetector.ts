import type { CandidateAction, OpenLoop, QiBit } from "../types";

const ACTION_PATTERNS = [
  /(?:need to|todo:|must|should|remember to|call|email|pay|schedule|send|upload|buy|file|follow up|submit)\s+([^.!?\n]+)/i,
];

const WAITING_PATTERNS = [
  /(?:waiting (?:on|for)|pending|awaiting|expecting response from)\s+([^.!?\n]+)/i,
];

const DECISION_PATTERNS = [
  /(?:need to decide|decide whether|choose between|considering)\s+([^.!?\n]+)/i,
];

const BLOCKER_PATTERNS = [
  /(?:blocked by|stuck on|waiting on blocker|dependency on)\s+([^.!?\n]+)/i,
];

/**
 * Open Loop Detector Engine (ADR 0003 & ADR 0006)
 * Automatically derives operational open loops and candidate actions from QiBits.
 */
export function detectOpenLoops(bit: QiBit): OpenLoop[] {
  const textToScan = `${bit.title}\n${bit.body ?? ""}`;
  const loops: OpenLoop[] = [];

  // 1. Scan for Action Open Loops
  for (const pattern of ACTION_PATTERNS) {
    const match = textToScan.match(pattern);
    if (match && match[1]) {
      loops.push({
        id: `loop_${Math.random().toString(36).slice(2)}`,
        bitId: bit.id,
        summary: match[1].trim(),
        loopType: "action",
        status: "open",
        confidence: 0.85,
        createdAt: new Date().toISOString(),
      });
      break;
    }
  }

  // 2. Scan for Waiting Open Loops
  for (const pattern of WAITING_PATTERNS) {
    const match = textToScan.match(pattern);
    if (match && match[1]) {
      loops.push({
        id: `loop_${Math.random().toString(36).slice(2)}`,
        bitId: bit.id,
        summary: match[1].trim(),
        loopType: "waiting",
        status: "open",
        confidence: 0.9,
        createdAt: new Date().toISOString(),
      });
      break;
    }
  }

  // 3. Scan for Decision Open Loops
  for (const pattern of DECISION_PATTERNS) {
    const match = textToScan.match(pattern);
    if (match && match[1]) {
      loops.push({
        id: `loop_${Math.random().toString(36).slice(2)}`,
        bitId: bit.id,
        summary: match[1].trim(),
        loopType: "decision",
        status: "open",
        confidence: 0.8,
        createdAt: new Date().toISOString(),
      });
      break;
    }
  }

  // 4. Scan for Blocker Open Loops
  for (const pattern of BLOCKER_PATTERNS) {
    const match = textToScan.match(pattern);
    if (match && match[1]) {
      loops.push({
        id: `loop_${Math.random().toString(36).slice(2)}`,
        bitId: bit.id,
        summary: match[1].trim(),
        loopType: "blocker",
        status: "open",
        confidence: 0.95,
        createdAt: new Date().toISOString(),
      });
      break;
    }
  }

  // Fallback: If bit is explicit 'task' or 'capture' with unchecked checkbox
  if (loops.length === 0 && (bit.type === "task" || bit.type === "capture")) {
    loops.push({
      id: `loop_${Math.random().toString(36).slice(2)}`,
      bitId: bit.id,
      summary: bit.title,
      loopType: "action",
      status: "open",
      confidence: 1.0,
      createdAt: new Date().toISOString(),
    });
  }

  return loops;
}

/**
 * Converts detected open loops into candidate actions (Action Model 2.0)
 */
export function openLoopToCandidateAction(loop: OpenLoop, originatingBit: QiBit): CandidateAction {
  const isExternalConsequential =
    /email|send|pay|submit|delete|file|transfer/i.test(loop.summary);

  return {
    id: `cand_${Math.random().toString(36).slice(2)}`,
    title: loop.summary,
    description: `Derived from ${originatingBit.type}: "${originatingBit.title}"`,
    status: "candidate",
    consequential: isExternalConsequential,
    originatingQiBitIds: [originatingBit.id],
    proposedParameters: {
      loopId: loop.id,
      bitId: originatingBit.id,
      loopType: loop.loopType,
    },
    createdAt: new Date().toISOString(),
  };
}
