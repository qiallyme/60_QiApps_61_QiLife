export type QiSpecialViewKey = "assistant";

export interface QiNavItem {
  id: string;
  label: string;
  entityKey?: string | null;
  viewKey?: QiSpecialViewKey;
}

export interface QiNavGroup {
  id: string;
  label: string;
  items: QiNavItem[];
}

export const navGroups: QiNavGroup[] = [
  {
    id: "home",
    label: "",
    items: [
      { id: "home", label: "Home", entityKey: null },
      { id: "assistant", label: "Ask QiLife", viewKey: "assistant" }
    ]
  },
  {
    id: "command",
    label: "Command",
    items: [
      { id: "qibit", label: "Inbox", entityKey: "qibit" },
      { id: "task", label: "Tasks", entityKey: "task" },
      { id: "reminder", label: "Reminders", entityKey: "reminder" },
      { id: "appointment", label: "Appointments", entityKey: "appointment" }
    ]
  },
  {
    id: "organize",
    label: "Organize",
    items: [
      { id: "project", label: "Projects", entityKey: "project" },
      { id: "thread", label: "Threads", entityKey: "thread" },
      { id: "person", label: "People", entityKey: "person" }
    ]
  },
  {
    id: "record",
    label: "Life Record",
    items: [
      { id: "event", label: "Events", entityKey: "event" },
      { id: "journal_entry", label: "Journal", entityKey: "journal_entry" },
      { id: "decision", label: "Decisions", entityKey: "decision" }
    ]
  },
  {
    id: "knowledge",
    label: "Knowledge",
    items: [
      { id: "knowledge_item", label: "QiVault", entityKey: "knowledge_item" },
      { id: "document", label: "Documents", entityKey: "document" },
      { id: "report", label: "Reports", entityKey: "report" }
    ]
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "expense", label: "Finance", entityKey: "expense" },
      { id: "care_note", label: "Care", entityKey: "care_note" },
      { id: "legal_matter", label: "Legal", entityKey: "legal_matter" },
      { id: "home_item", label: "Home", entityKey: "home_item" },
      { id: "connected_app", label: "Connected Apps", entityKey: "connected_app" }
    ]
  }
];
