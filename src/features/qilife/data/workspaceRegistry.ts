export type QiWorkspaceKey =
  | "today"
  | "planner"
  | "projects"
  | "people"
  | "life_record"
  | "knowledge"
  | "reports"
  | "apps";

export interface QiWorkspaceTab {
  id: string;
  label: string;
  entityKey: string;
}

export interface QiWorkspaceDefinition {
  key: QiWorkspaceKey;
  label: string;
  icon: string;
  eyebrow: string;
  description: string;
  tabs: QiWorkspaceTab[];
}

export const workspaceRegistry: Record<QiWorkspaceKey, QiWorkspaceDefinition> = {
  today: {
    key: "today",
    label: "Today",
    icon: "◷",
    eyebrow: "CURRENT FOCUS",
    description: "What is due, waiting, scheduled, or sitting unprocessed right now.",
    tabs: [
      { id: "tasks", label: "Tasks", entityKey: "task" },
      { id: "reminders", label: "Reminders", entityKey: "reminder" },
      { id: "appointments", label: "Appointments", entityKey: "appointment" },
      { id: "inbox", label: "Inbox", entityKey: "qibit" }
    ]
  },
  planner: {
    key: "planner",
    label: "Planner",
    icon: "▦",
    eyebrow: "PLAN THE WORK",
    description: "Move from open loops to scheduled, sequenced, and reviewable action.",
    tabs: [
      { id: "projects", label: "Projects", entityKey: "project" },
      { id: "tasks", label: "Actions", entityKey: "task" },
      { id: "appointments", label: "Calendar", entityKey: "appointment" },
      { id: "decisions", label: "Decisions", entityKey: "decision" }
    ]
  },
  projects: {
    key: "projects",
    label: "Projects",
    icon: "◇",
    eyebrow: "OUTCOMES & CONTEXT",
    description: "Finite outcomes and the ongoing threads that surround them.",
    tabs: [
      { id: "projects", label: "Projects", entityKey: "project" },
      { id: "threads", label: "Threads", entityKey: "thread" },
      { id: "actions", label: "Next Actions", entityKey: "task" }
    ]
  },
  people: {
    key: "people",
    label: "People",
    icon: "◎",
    eyebrow: "RELATIONSHIPS",
    description: "People, organizations, follow-ups, context, and recent contact.",
    tabs: [
      { id: "people", label: "People", entityKey: "person" },
      { id: "followups", label: "Follow-ups", entityKey: "task" },
      { id: "events", label: "Activity", entityKey: "event" }
    ]
  },
  life_record: {
    key: "life_record",
    label: "Life Record",
    icon: "≋",
    eyebrow: "WHAT ACTUALLY HAPPENED",
    description: "Factual events, subjective reflection, decisions, and supporting evidence.",
    tabs: [
      { id: "timeline", label: "Timeline", entityKey: "event" },
      { id: "journal", label: "Journal", entityKey: "journal_entry" },
      { id: "decisions", label: "Decisions", entityKey: "decision" },
      { id: "evidence", label: "Evidence", entityKey: "document" }
    ]
  },
  knowledge: {
    key: "knowledge",
    label: "Knowledge",
    icon: "⌘",
    eyebrow: "QIVAULT",
    description: "Markdown knowledge, documents, procedures, research, and source material.",
    tabs: [
      { id: "vault", label: "QiVault", entityKey: "knowledge_item" },
      { id: "documents", label: "Documents", entityKey: "document" }
    ]
  },
  reports: {
    key: "reports",
    label: "Reports",
    icon: "▤",
    eyebrow: "REVIEW & SYNTHESIS",
    description: "Daily, weekly, monthly, project, chronology, and evidence reporting.",
    tabs: [{ id: "reports", label: "Reports", entityKey: "report" }]
  },
  apps: {
    key: "apps",
    label: "Apps",
    icon: "⬡",
    eyebrow: "CONNECTED SYSTEMS",
    description: "Qi apps and specialized operational records exposed through QiLife.",
    tabs: [
      { id: "connected", label: "Connected Apps", entityKey: "connected_app" },
      { id: "finance", label: "Finance", entityKey: "expense" },
      { id: "care", label: "Care", entityKey: "care_note" },
      { id: "legal", label: "Legal", entityKey: "legal_matter" },
      { id: "home", label: "Home", entityKey: "home_item" }
    ]
  }
};

export const workspaceList = Object.values(workspaceRegistry);

const preferredWorkspaceByEntity: Record<string, QiWorkspaceKey> = {
  qibit: "today",
  task: "today",
  reminder: "today",
  appointment: "today",
  project: "projects",
  thread: "projects",
  person: "people",
  event: "life_record",
  journal_entry: "life_record",
  decision: "life_record",
  knowledge_item: "knowledge",
  document: "knowledge",
  report: "reports",
  connected_app: "apps",
  expense: "apps",
  care_note: "apps",
  legal_matter: "apps",
  home_item: "apps"
};

export function workspaceForEntity(entityKey: string): QiWorkspaceKey {
  return preferredWorkspaceByEntity[entityKey] || "today";
}
