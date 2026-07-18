import type { QiEntityDefinition } from "../types";

export const entityRegistry: Record<string, QiEntityDefinition> = {
  qibit: {
    key: "qibit",
    label: "Inbox Item",
    plural: "Inbox Items",
    icon: "◉",
    section: "capture",
    description: "Raw captures preserved before they are reviewed, linked, or routed.",
    defaultLayout: "table",
    titleField: "title",
    statusField: "status",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true, placeholder: "What came in?" },
      { key: "kind", label: "Kind", type: "enum", options: ["thought", "task", "note", "email", "document", "expense", "event", "idea", "evidence", "other"] },
      { key: "status", label: "Status", type: "enum", options: ["inbox", "reviewed", "routed", "archived"] },
      { key: "source", label: "Source", type: "text", placeholder: "voice, email, screenshot, manual..." },
      { key: "captured_at", label: "Captured", type: "datetime" },
      { key: "destination", label: "Route To", type: "text", placeholder: "task, thread, QiVault, QiFinance..." },
      { key: "tags", label: "Tags", type: "tags" },
      { key: "raw_content", label: "Raw Content", type: "textarea" }
    ],
    columns: ["title", "kind", "status", "source", "captured_at", "destination"]
  },

  person: {
    key: "person",
    label: "Person",
    plural: "People",
    icon: "👥",
    section: "people",
    description: "Family, support network, providers, clients, contacts, and context.",
    defaultLayout: "table",
    titleField: "name",
    fields: [
      { key: "name", label: "Name", type: "text", primary: true, required: true, placeholder: "Family member, provider, client..." },
      { key: "role", label: "Role", type: "text", placeholder: "Family, landlord, provider..." },
      { key: "phone", label: "Phone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "relationship", label: "Relationship", type: "text" },
      { key: "last_contact", label: "Last Contact", type: "datetime" },
      { key: "tags", label: "Tags", type: "tags", placeholder: "care, family, client, urgent" },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["name", "role", "phone", "email", "relationship", "last_contact"]
  },

  task: {
    key: "task",
    label: "Task",
    plural: "Tasks",
    icon: "✅",
    section: "today",
    description: "Daily action, next steps, waiting items, delegated work, and loose ends.",
    defaultLayout: "table",
    titleField: "title",
    statusField: "status",
    priorityField: "priority",
    dueDateField: "due_date",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true, placeholder: "Call clinic, pay bill, upload receipt..." },
      { key: "status", label: "Status", type: "enum", options: ["inbox", "next", "waiting", "blocked", "done", "cancelled"] },
      { key: "priority", label: "Priority", type: "enum", options: ["low", "medium", "high", "urgent"] },
      { key: "due_date", label: "Due", type: "date" },
      { key: "project", label: "Project", type: "relation", relationEntity: "project" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "person", label: "Person", type: "relation", relationEntity: "person" },
      { key: "context", label: "Context", type: "enum", options: ["phone", "computer", "errand", "home", "waiting", "low_energy", "anywhere"] },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["title", "status", "priority", "due_date", "project", "thread"]
  },

  project: {
    key: "project",
    label: "Project",
    plural: "Projects",
    icon: "🗂️",
    section: "projects",
    description: "Finite outcomes with a clear definition of done.",
    defaultLayout: "cards",
    titleField: "name",
    statusField: "status",
    priorityField: "priority",
    dueDateField: "due_date",
    fields: [
      { key: "name", label: "Name", type: "text", primary: true, required: true, placeholder: "Launch service, resolve dispute, finish app..." },
      { key: "status", label: "Status", type: "enum", options: ["active", "on_hold", "backlog", "done", "cancelled"] },
      { key: "priority", label: "Priority", type: "enum", options: ["low", "medium", "high"] },
      { key: "owner", label: "Owner", type: "relation", relationEntity: "person" },
      { key: "due_date", label: "Due", type: "date" },
      { key: "area", label: "Life Area", type: "text", placeholder: "business, housing, health, technology..." },
      { key: "tags", label: "Tags", type: "tags" },
      { key: "brief", label: "Brief", type: "textarea" }
    ],
    columns: ["name", "status", "priority", "owner", "due_date", "area"]
  },

  thread: {
    key: "thread",
    label: "Thread",
    plural: "Threads",
    icon: "🧵",
    section: "organize",
    description: "Ongoing situations that cross projects, people, documents, events, and apps.",
    defaultLayout: "cards",
    titleField: "title",
    statusField: "status",
    priorityField: "priority",
    dueDateField: "next_review",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true, placeholder: "Housing search, rental dispute, family care..." },
      { key: "status", label: "Status", type: "enum", options: ["active", "waiting", "paused", "resolved", "archived"] },
      { key: "domain", label: "Domain", type: "enum", options: ["life", "business", "care", "finance", "legal", "housing", "transportation", "relationship", "technology", "other"] },
      { key: "priority", label: "Priority", type: "enum", options: ["low", "medium", "high", "urgent"] },
      { key: "lead_person", label: "Lead Person", type: "relation", relationEntity: "person" },
      { key: "next_review", label: "Next Review", type: "date" },
      { key: "summary", label: "Current Summary", type: "textarea" },
      { key: "desired_outcome", label: "Desired Outcome", type: "textarea" },
      { key: "tags", label: "Tags", type: "tags" }
    ],
    columns: ["title", "status", "domain", "priority", "lead_person", "next_review"]
  },

  event: {
    key: "event",
    label: "Event",
    plural: "Events",
    icon: "◷",
    section: "record",
    description: "The factual record of calls, incidents, payments, work, travel, and system changes.",
    defaultLayout: "table",
    titleField: "title",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true },
      { key: "event_type", label: "Type", type: "enum", options: ["call", "conversation", "incident", "appointment", "payment", "work_session", "decision", "travel", "system_change", "milestone", "other"] },
      { key: "occurred_at", label: "Occurred At", type: "datetime" },
      { key: "person", label: "Person", type: "relation", relationEntity: "person" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "project", label: "Project", type: "relation", relationEntity: "project" },
      { key: "location", label: "Location", type: "text" },
      { key: "outcome", label: "Outcome", type: "textarea" },
      { key: "source_url", label: "Source URL", type: "url" },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["title", "event_type", "occurred_at", "person", "thread", "project"]
  },

  journal_entry: {
    key: "journal_entry",
    label: "Journal Entry",
    plural: "Journal Entries",
    icon: "✎",
    section: "record",
    description: "Subjective reflection kept separate from factual events and source records.",
    defaultLayout: "cards",
    titleField: "title",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true },
      { key: "entry_type", label: "Type", type: "enum", options: ["daily", "reflection", "dream", "spiritual", "after_action", "relationship", "working_note", "lesson"] },
      { key: "entry_date", label: "Date", type: "date" },
      { key: "mood", label: "Mood / State", type: "text" },
      { key: "thread", label: "Related Thread", type: "relation", relationEntity: "thread" },
      { key: "body", label: "Entry", type: "textarea" },
      { key: "tags", label: "Tags", type: "tags" }
    ],
    columns: ["title", "entry_type", "entry_date", "mood", "thread"]
  },

  decision: {
    key: "decision",
    label: "Decision",
    plural: "Decisions",
    icon: "◇",
    section: "record",
    description: "Choices, rationale, assumptions, risks, review dates, and outcomes.",
    defaultLayout: "cards",
    titleField: "title",
    statusField: "status",
    dueDateField: "review_date",
    fields: [
      { key: "title", label: "Decision", type: "text", primary: true, required: true },
      { key: "status", label: "Status", type: "enum", options: ["active", "review", "superseded", "reversed"] },
      { key: "decided_at", label: "Decided At", type: "date" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "project", label: "Project", type: "relation", relationEntity: "project" },
      { key: "rationale", label: "Rationale", type: "textarea" },
      { key: "assumptions", label: "Assumptions", type: "textarea" },
      { key: "risks", label: "Risks", type: "textarea" },
      { key: "review_date", label: "Review Date", type: "date" },
      { key: "outcome", label: "Outcome", type: "textarea" }
    ],
    columns: ["title", "status", "decided_at", "thread", "project", "review_date"]
  },

  knowledge_item: {
    key: "knowledge_item",
    label: "Knowledge Item",
    plural: "Knowledge Items",
    icon: "⌘",
    section: "knowledge",
    description: "QiVault markdown notes, doctrine, references, procedures, templates, and research.",
    defaultLayout: "table",
    titleField: "title",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true },
      { key: "kind", label: "Kind", type: "enum", options: ["note", "reference", "doctrine", "research", "template", "procedure", "index"] },
      { key: "vault_path", label: "QiVault Path", type: "text", placeholder: "areas/business/ask-cody.md" },
      { key: "source_url", label: "Source URL", type: "url" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "tags", label: "Tags", type: "tags" },
      { key: "summary", label: "Summary", type: "textarea" }
    ],
    columns: ["title", "kind", "vault_path", "thread", "source_url"]
  },

  report: {
    key: "report",
    label: "Report",
    plural: "Reports",
    icon: "▤",
    section: "knowledge",
    description: "Generated and finalized daily, weekly, monthly, project, timeline, and evidence reports.",
    defaultLayout: "table",
    titleField: "title",
    statusField: "status",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true },
      { key: "report_type", label: "Type", type: "enum", options: ["daily", "weekly", "monthly", "project", "timeline", "evidence", "contact_history", "incident", "custom"] },
      { key: "status", label: "Status", type: "enum", options: ["draft", "generated", "reviewed", "final"] },
      { key: "period_start", label: "Period Start", type: "date" },
      { key: "period_end", label: "Period End", type: "date" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "source_url", label: "Report URL", type: "url" },
      { key: "summary", label: "Summary", type: "textarea" }
    ],
    columns: ["title", "report_type", "status", "period_start", "period_end", "thread"]
  },

  connected_app: {
    key: "connected_app",
    label: "Connected App",
    plural: "Connected Apps",
    icon: "⬡",
    section: "apps",
    description: "Qi apps and external systems exposed through the QiLife control plane.",
    defaultLayout: "cards",
    titleField: "name",
    statusField: "status",
    fields: [
      { key: "name", label: "Name", type: "text", primary: true, required: true, placeholder: "QiFinance, QiVault, Gmail, Calendar..." },
      { key: "app_type", label: "Type", type: "enum", options: ["qi_app", "connector", "storage", "service", "device"] },
      { key: "status", label: "Status", type: "enum", options: ["active", "planned", "needs_auth", "offline", "retired"] },
      { key: "url", label: "Open URL", type: "url" },
      { key: "data_scope", label: "Data Scope", type: "text", placeholder: "transactions, email, calendar, markdown..." },
      { key: "last_sync", label: "Last Sync", type: "datetime" },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["name", "app_type", "status", "data_scope", "last_sync", "url"]
  },

  care_note: {
    key: "care_note",
    label: "Care Note",
    plural: "Care Notes",
    icon: "🫀",
    section: "care",
    description: "Care observations, symptoms, meds, incidents, supplies, and follow-ups.",
    defaultLayout: "table",
    titleField: "subject",
    fields: [
      { key: "subject", label: "Subject", type: "text", primary: true, required: true, placeholder: "Symptom, medication, appointment update..." },
      { key: "person", label: "Person", type: "relation", relationEntity: "person" },
      { key: "category", label: "Category", type: "enum", options: ["symptom", "medication", "appointment", "incident", "supply", "general"] },
      { key: "when", label: "When", type: "datetime" },
      { key: "severity", label: "Severity", type: "enum", options: ["low", "medium", "high", "urgent"] },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["subject", "person", "category", "severity", "when"]
  },

  appointment: {
    key: "appointment",
    label: "Appointment",
    plural: "Appointments",
    icon: "📅",
    section: "today",
    description: "Medical, legal, business, finance, home, and support appointments.",
    defaultLayout: "table",
    titleField: "title",
    statusField: "status",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true },
      { key: "person", label: "Person", type: "relation", relationEntity: "person" },
      { key: "provider", label: "Provider / Organization", type: "text" },
      { key: "when", label: "When", type: "datetime" },
      { key: "status", label: "Status", type: "enum", options: ["scheduled", "completed", "cancelled", "reschedule"] },
      { key: "location", label: "Location", type: "text" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["title", "person", "provider", "when", "status", "thread"]
  },

  expense: {
    key: "expense",
    label: "Finance Reference",
    plural: "Finance References",
    icon: "🧾",
    section: "finance",
    description: "QiFinance-linked expenses, receipts, bills, and financial exceptions—not a duplicate ledger.",
    defaultLayout: "table",
    titleField: "description",
    fields: [
      { key: "description", label: "Description", type: "text", primary: true, required: true },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "account", label: "Account", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "qifinance_url", label: "QiFinance URL", type: "url" },
      { key: "receipt_url", label: "Receipt URL", type: "url" },
      { key: "reimbursable", label: "Reimbursable", type: "checkbox" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["description", "amount", "account", "category", "date", "thread"]
  },

  document: {
    key: "document",
    label: "Document",
    plural: "Documents",
    icon: "📄",
    section: "documents",
    description: "QiDrive/QiNexus file references, source records, and evidence metadata.",
    defaultLayout: "table",
    titleField: "title",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true },
      { key: "domain", label: "Domain", type: "enum", options: ["life", "care", "finance", "legal", "home", "tech", "identity", "business"] },
      { key: "file_url", label: "File URL", type: "url" },
      { key: "related_person", label: "Related Person", type: "relation", relationEntity: "person" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "evidence_status", label: "Evidence Status", type: "enum", options: ["source", "supporting", "submitted", "verified", "superseded"] },
      { key: "tags", label: "Tags", type: "tags" },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["title", "domain", "related_person", "thread", "evidence_status", "file_url"]
  },

  legal_matter: {
    key: "legal_matter",
    label: "Legal Matter",
    plural: "Legal Matters",
    icon: "⚖️",
    section: "legal",
    description: "Matter summaries and links into specialized legal workflows.",
    defaultLayout: "cards",
    titleField: "title",
    statusField: "status",
    dueDateField: "deadline",
    fields: [
      { key: "title", label: "Title", type: "text", primary: true, required: true },
      { key: "status", label: "Status", type: "enum", options: ["active", "waiting", "filed", "resolved", "closed"] },
      { key: "jurisdiction", label: "Jurisdiction", type: "text" },
      { key: "deadline", label: "Deadline", type: "date" },
      { key: "opposing_party", label: "Other Party", type: "text" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["title", "status", "jurisdiction", "deadline", "thread"]
  },

  home_item: {
    key: "home_item",
    label: "Home Item",
    plural: "Home Items",
    icon: "🏠",
    section: "home",
    description: "Safety items, repairs, supplies, installations, and household inventory.",
    defaultLayout: "table",
    titleField: "name",
    statusField: "status",
    fields: [
      { key: "name", label: "Name", type: "text", primary: true, required: true },
      { key: "category", label: "Category", type: "enum", options: ["safety", "repair", "supply", "furniture", "utility", "cleaning", "other"] },
      { key: "status", label: "Status", type: "enum", options: ["needed", "bought", "installed", "returned", "done"] },
      { key: "cost", label: "Cost", type: "currency" },
      { key: "location", label: "Location", type: "text" },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["name", "category", "status", "cost", "location", "thread"]
  },

  reminder: {
    key: "reminder",
    label: "Reminder",
    plural: "Reminders",
    icon: "🔔",
    section: "today",
    description: "Simple reminders and nagging loose ends that need a visible home.",
    defaultLayout: "table",
    titleField: "text",
    statusField: "status",
    fields: [
      { key: "text", label: "Text", type: "text", primary: true, required: true },
      { key: "when", label: "When", type: "datetime" },
      { key: "status", label: "Status", type: "enum", options: ["open", "done", "cancelled"] },
      { key: "thread", label: "Thread", type: "relation", relationEntity: "thread" },
      { key: "notes", label: "Notes", type: "textarea" }
    ],
    columns: ["text", "when", "status", "thread"]
  }
};

export const entityList = Object.values(entityRegistry);
