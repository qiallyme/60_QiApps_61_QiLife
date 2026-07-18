import type { QiWorkspaceKey } from "./workspaceRegistry";

export type QiSpecialViewKey = "assistant";

export interface QiNavItem {
  id: string;
  label: string;
  icon: string;
  workspaceKey?: QiWorkspaceKey;
  home?: boolean;
}

export const navGroups: Array<{ id: string; label: string; items: QiNavItem[] }> = [
  {
    id: "core",
    label: "",
    items: [
      { id: "home", label: "Home", icon: "⌂", home: true },
      { id: "today", label: "Today", icon: "◷", workspaceKey: "today" },
      { id: "planner", label: "Planner", icon: "▦", workspaceKey: "planner" },
      { id: "projects", label: "Projects", icon: "◇", workspaceKey: "projects" },
      { id: "people", label: "People", icon: "◎", workspaceKey: "people" }
    ]
  },
  {
    id: "library",
    label: "Library",
    items: [
      { id: "life-record", label: "Life Record", icon: "≋", workspaceKey: "life_record" },
      { id: "knowledge", label: "Knowledge", icon: "⌘", workspaceKey: "knowledge" },
      { id: "reports", label: "Reports", icon: "▤", workspaceKey: "reports" },
      { id: "apps", label: "Apps", icon: "⬡", workspaceKey: "apps" }
    ]
  }
];
