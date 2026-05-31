import { Action, Draft } from "../types";

export function mockAgentDraft(rawText: string): Partial<Draft> {
  const text = rawText.toLowerCase();

  let type = "qibits";
  let tags = ["note"];
  let priority = "low";
  let space = "Inbox";
  let insight = "Standard capture note.";
  let confidence: "high" | "medium" | "low" = "high";
  const signals: string[] = [];
  const actions: Action[] = [];

  // 1. Detect Category/Space/Tags
  if (text.includes("mom") || text.includes("oxygen") || text.includes("med") || text.includes("doctor")) {
    type = "care";
    tags = ["health", "care"];
    if (text.includes("mom")) tags.push("mom");
    priority = "high";
    space = "Mom's Care";
    insight = "This looks like a care observation. Monitoring may be required.";
    signals.push("care context", "health anomaly");
  } else if (text.includes("bill") || text.includes("bank") || text.includes("receipt") || text.includes("payment")) {
    type = "transactions";
    tags = ["finance", "money"];
    priority = "medium";
    space = "Finance";
    insight = "Detected financial transaction or obligation.";
    signals.push("financial record");
  } else if (text.includes("court") || text.includes("filing") || text.includes("motion") || text.includes("legal")) {
    type = "events";
    tags = ["legal"];
    priority = "high";
    space = "Legal / Life";
    insight = "Legal event or milestone detected.";
    signals.push("legal tracking");
  } else if (text.includes("server") || text.includes("app") || text.includes("repo") || text.includes("deploy")) {
    type = "actions";
    tags = ["tech", "dev"];
    space = "Projects";
    insight = "Technical or dev note.";
    signals.push("system dev");
  } else if (text.includes("todo") || text.includes("call") || text.includes("send") || text.includes("finish")) {
    type = "actions";
    tags = ["task"];
    priority = "medium";
    insight = "Direct action items found.";
    signals.push("task extraction");
  }

  // 2. Action Extraction Rules
  const actionTriggers = ["call", "send", "pay", "file", "finish", "schedule", "pick up", "follow up", "email", "text", "remind", "need to"];
  const dueTriggers = ["today", "tomorrow", "tonight", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "this week"];

  let extractedActionTitle = "";
  let dueHint = "";

  // Very naive extraction for mock purposes: if we find a trigger, take the rest of the sentence or next ~10 words
  for (const trigger of actionTriggers) {
    const idx = text.indexOf(trigger);
    if (idx !== -1) {
      // Find end of sentence or limit length
      const endIdx = rawText.indexOf(".", idx);
      const chunk = endIdx !== -1 ? rawText.substring(idx, endIdx) : rawText.substring(idx, idx + 60);
      extractedActionTitle = chunk.trim();
      
      // Capitalize first letter
      extractedActionTitle = extractedActionTitle.charAt(0).toUpperCase() + extractedActionTitle.slice(1);
      
      // Look for due hints
      for (const due of dueTriggers) {
        if (text.includes(due)) {
          dueHint = due;
          break;
        }
      }
      break; // Just extract one action for the mock
    }
  }

  if (extractedActionTitle) {
    actions.push({
      id: "act-" + Math.random().toString(36).substring(2, 9),
      qibitId: null, // assigned on save
      createdAt: new Date().toISOString(),
      title: extractedActionTitle,
      status: "open",
      priority,
      dueHint,
      sourceText: rawText
    });
    insight += " Follow-up task extracted.";
    if (type === "qibits") type = "actions";
  }

  const suggestedTitle = rawText.length > 30 ? rawText.substring(0, 30).trim() + "..." : rawText;
  const suggestedSummary = rawText.length > 50 ? rawText.substring(0, 47) + "..." : rawText;

  return {
    suggestedType: type,
    suggestedTitle,
    suggestedSummary,
    suggestedTags: tags,
    suggestedPriority: priority,
    suggestedSpace: space,
    insight,
    confidence,
    detectedSignals: signals,
    actions
  };
}

export function mockIngestion(rawText: string, sourceType?: string): Draft {
  const suggestions = mockAgentDraft(rawText);

  return {
    id: "draft-" + Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
    sourceType,
    rawText,
    suggestedType: suggestions.suggestedType || "qibits",
    suggestedTitle: suggestions.suggestedTitle || "Untitled",
    suggestedSummary: suggestions.suggestedSummary || rawText,
    suggestedTags: suggestions.suggestedTags || [],
    suggestedPriority: suggestions.suggestedPriority || "low",
    suggestedSpace: suggestions.suggestedSpace || "Inbox",
    insight: suggestions.insight || "No insight generated.",
    confidence: suggestions.confidence || "medium",
    detectedSignals: suggestions.detectedSignals || [],
    actions: suggestions.actions || [],
    status: "draft"
  };
}
