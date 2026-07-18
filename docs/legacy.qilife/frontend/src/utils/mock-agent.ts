import { Action, AgentDraft, Draft, Priority, QiBitType } from "../types";

const CATEGORY_RULES: Array<{
  type: QiBitType;
  space: string;
  keywords: string[];
}> = [
  {
    type: "care",
    space: "Moms Care",
    keywords: ["mom", "oxygen", "med", "doctor", "symptom", "pain", "appointment", "hospital", "nurse", "vitals"],
  },
  {
    type: "finance",
    space: "Finance",
    keywords: ["bill", "bank", "receipt", "payment", "invoice", "statement", "transaction", "refund", "electric"],
  },
  {
    type: "legal",
    space: "Legal",
    keywords: ["court", "filing", "motion", "judge", "case", "deadline", "evidence", "exhibit", "exhibits"],
  },
  {
    type: "tech",
    space: "Tech",
    keywords: ["server", "deploy", "repo", "build", "api", "database", "cloudflare", "qiserver", "package lock"],
  },
];

const ACTION_VERBS = [
  "pick up",
  "follow up",
  "schedule",
  "organize",
  "remind",
  "finish",
  "email",
  "call",
  "send",
  "pay",
  "file",
  "save",
  "text",
];

const TASK_SIGNALS = [...ACTION_VERBS, "need to", "today", "tomorrow", "tonight", "this week", "next week"];
const DUE_HINTS = ["today", "tomorrow", "tonight", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "this week", "next week"];

function sentenceCase(value: string): string {
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summarize(rawText: string, max = 120): string {
  const cleaned = rawText.trim().replace(/\s+/g, " ");
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

function buildSignals(text: string): { type: QiBitType; space: string; matches: string[] } {
  for (const rule of CATEGORY_RULES) {
    const matches = rule.keywords.filter((keyword) => text.includes(keyword));
    if (matches.length > 0) {
      return { type: rule.type, space: rule.space, matches };
    }
  }

  const taskMatches = TASK_SIGNALS.filter((keyword) => text.includes(keyword));
  if (taskMatches.length > 0) {
    return { type: "task", space: "Operations", matches: taskMatches };
  }

  return { type: "note", space: "General", matches: [] };
}

function inferPriority(type: QiBitType, text: string): Priority {
  if (type === "care") return "high";
  if (type === "legal") return "high";
  if (type === "tech" && text.includes("failed")) return "high";
  if (text.includes("deadline") || text.includes("urgent")) return "high";
  if (type === "finance" || type === "task") return "medium";
  return "low";
}

function inferConfidence(type: QiBitType, signals: string[]): AgentDraft["confidence"] {
  if (type === "note") return "low";
  if (signals.length >= 2) return "high";
  return "medium";
}

function inferInsight(type: QiBitType, text: string): string {
  if (type === "care" && (text.includes("doctor") || text.includes("call"))) {
    return "This is both a care observation and a follow-up task.";
  }
  if (type === "finance") {
    return "This is a financial obligation with a concrete next step.";
  }
  if (type === "legal") {
    return "This combines a legal deadline with document-prep work.";
  }
  if (type === "tech" && text.includes("failed")) {
    return "This is a technical issue that can block delivery until the root cause is fixed.";
  }
  if (type === "task") {
    return "This capture already contains actionable next steps.";
  }
  return "This is a general note worth saving for retrieval.";
}

function inferTitle(type: QiBitType, rawText: string, text: string): string {
  if (type === "care" && text.includes("oxygen") && (text.includes("chair") || text.includes("transfer"))) {
    return "Mom oxygen drop after chair transfer";
  }
  if (type === "finance" && text.includes("electric bill")) {
    return "Pay electric bill and save receipt";
  }
  if (type === "legal" && text.includes("motion") && text.includes("exhibit")) {
    return "Court filing deadline and motion prep";
  }
  if (type === "tech" && text.includes("cloudflare") && text.includes("build failed")) {
    return "Cloudflare build failed from package lock mismatch";
  }

  const words = rawText.trim().replace(/\s+/g, " ").split(" ").slice(0, 8).join(" ");
  return sentenceCase(words);
}

function inferSummary(type: QiBitType, rawText: string, text: string): string {
  if (type === "care" && text.includes("oxygen") && (text.includes("chair") || text.includes("transfer"))) {
    return "Mom had lower oxygen after moving to the chair; doctor follow-up needed.";
  }
  if (type === "finance" && text.includes("electric bill")) {
    return "The electric bill needs payment by Friday and the receipt should be saved.";
  }
  if (type === "legal" && text.includes("motion") && text.includes("exhibit")) {
    return "A court filing deadline is approaching; the motion and exhibits still need work.";
  }
  if (type === "tech" && text.includes("cloudflare") && text.includes("build failed")) {
    return "Cloudflare build failed because the package lock was out of sync.";
  }

  return summarize(rawText, 140);
}

function inferTags(type: QiBitType, signals: string[], text: string): string[] {
  const base = type === "note" ? ["note"] : [type];
  if (text.includes("mom")) base.push("mom");
  if (text.includes("oxygen")) base.push("oxygen");
  if (text.includes("transfer") || text.includes("chair")) base.push("transfer");
  if (text.includes("doctor")) base.push("doctor");
  if (text.includes("electric")) base.push("electric");
  if (text.includes("receipt")) base.push("receipt");
  if (text.includes("motion")) base.push("motion");
  if (text.includes("exhibit")) base.push("exhibits");
  if (text.includes("cloudflare")) base.push("cloudflare");
  if (text.includes("build")) base.push("build");
  return Array.from(new Set([...base, ...signals]));
}

function detectDueHint(text: string): string | undefined {
  return DUE_HINTS.find((hint) => text.includes(hint));
}

function normalizeActionTitle(value: string): string {
  return sentenceCase(
    value
      .replace(/\b(and|then)\b$/i, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function extractActions(rawText: string, type: QiBitType, priority: Priority): Action[] {
  const text = rawText.toLowerCase();
  const matches = ACTION_VERBS.flatMap((verb) => {
    const pattern = new RegExp(`\\b${verb.replace(" ", "\\s+")}\\b`, "gi");
    return Array.from(rawText.matchAll(pattern)).map((match) => ({
      verb,
      index: match.index ?? 0,
      value: match[0],
    }));
  }).sort((a, b) => a.index - b.index);

  if (matches.length === 0 && text.includes("need to")) {
    const hint = detectDueHint(text);
    return [
      {
        id: `action-${Math.random().toString(36).slice(2, 10)}`,
        qibitId: null,
        createdAt: new Date().toISOString(),
        title: sentenceCase(rawText.replace(/^.*need to/i, "").trim()),
        status: "open",
        priority,
        dueHint: hint,
        sourceText: rawText,
      },
    ];
  }

  const actions: Action[] = [];

  matches.forEach((match, index) => {
    const nextIndex = index < matches.length - 1 ? matches[index + 1].index : rawText.length;
    const fragment = rawText
      .slice(match.index, nextIndex)
      .replace(/[.,;]+$/g, "")
      .trim();

    let title = normalizeActionTitle(fragment);

    if (type === "care" && match.verb === "call" && text.includes("oxygen") && (text.includes("chair") || text.includes("transfer"))) {
      title = "Call doctor tomorrow about oxygen drop after transfer";
    }

    if (!title) return;

    actions.push({
      id: `action-${Math.random().toString(36).slice(2, 10)}`,
      qibitId: null,
      createdAt: new Date().toISOString(),
      title,
      status: "open",
      priority,
      dueHint: detectDueHint(fragment.toLowerCase()) ?? detectDueHint(text),
      sourceText: rawText,
    });
  });

  return actions.filter((action, index, all) => all.findIndex((candidate) => candidate.title.toLowerCase() === action.title.toLowerCase()) === index);
}

export function mockAgentDraft(rawText: string): AgentDraft {
  const text = rawText.toLowerCase();
  const signals = buildSignals(text);
  const priority = inferPriority(signals.type, text);
  const actions = extractActions(rawText, signals.type, priority);

  return {
    suggestedType: signals.type,
    suggestedTitle: inferTitle(signals.type, rawText, text),
    suggestedSummary: inferSummary(signals.type, rawText, text),
    suggestedTags: inferTags(signals.type, signals.matches, text),
    suggestedPriority: priority,
    suggestedSpace: signals.space,
    detectedSignals: signals.matches.length > 0 ? signals.matches.map(titleCase) : ["General note"],
    confidence: inferConfidence(signals.type, signals.matches),
    insight: inferInsight(signals.type, text),
    actions,
    extractedActions: actions,
  };
}

export function buildDraft(rawText: string, sourceType?: string, draftId?: string, agentDraftInput?: AgentDraft, createdAt?: string): Draft {
  const agentDraft = agentDraftInput ?? mockAgentDraft(rawText);
  const now = createdAt ?? new Date().toISOString();

  return {
    id: draftId ?? `draft-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: now,
    updatedAt: now,
    rawText,
    source: sourceType || "capture",
    status: "draft",
    agentDraft,
  };
}

export function mockIngestion(rawText: string, sourceType?: string): Draft {
  return buildDraft(rawText, sourceType);
}
