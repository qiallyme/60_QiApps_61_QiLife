export type QiSpecialViewKey = "assistant";

export interface QiNavItem {
  id: string;
  label: string;
  icon: string;
  to: string;
}

export interface QiNavGroup {
  id: string;
  label: string;
  items: QiNavItem[];
}

export const homeNavigation: QiNavItem = {
  id: "home",
  label: "Home",
  icon: "⌂",
  to: "/",
};

export const navGroups: QiNavGroup[] = [
  {
    id: "planner",
    label: "PLANNER",
    items: [
      { id: "today", label: "Today", icon: "◷", to: "/today" },
      { id: "inbox", label: "Inbox", icon: "↓", to: "/inbox" },
      { id: "actions", label: "Actions", icon: "✓", to: "/actions" },
      { id: "calendar", label: "Calendar", icon: "□", to: "/calendar" },
    ],
  },
  {
    id: "organize",
    label: "ORGANIZE",
    items: [
      { id: "projects", label: "Projects", icon: "◇", to: "/projects" },
      { id: "threads", label: "Threads", icon: "≋", to: "/threads" },
      { id: "people", label: "People", icon: "◎", to: "/people" },
    ],
  },
  {
    id: "record",
    label: "RECORD",
    items: [
      { id: "journal", label: "Journal", icon: "✎", to: "/journal" },
      { id: "timeline", label: "Timeline", icon: "↝", to: "/timeline" },
      { id: "documents", label: "Documents", icon: "▤", to: "/documents" },
      { id: "knowledge", label: "Knowledge", icon: "⌘", to: "/knowledge" },
    ],
  },
  {
    id: "review",
    label: "REVIEW",
    items: [
      { id: "decisions", label: "Decisions", icon: "◆", to: "/decisions" },
      { id: "reports", label: "Reports", icon: "▥", to: "/reports" },
    ],
  },
  {
    id: "system",
    label: "SYSTEM",
    items: [
      { id: "apps", label: "Apps", icon: "⬡", to: "/apps" },
      { id: "automations", label: "Automations", icon: "⚙", to: "/automations" },
      { id: "settings", label: "Settings", icon: "◉", to: "/settings" },
    ],
  },
];
