// src/features/qilife/data/navRegistry.ts

export interface NavItem {
  id: string;
  label: string;
  entityKey: string | null;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    id: "home",
    label: "",
    items: [
      { id: "home", label: "Home", entityKey: null },
    ],
  },
  {
    id: "today",
    label: "Today",
    items: [
      { id: "task",     label: "Tasks",     entityKey: "task"     },
      { id: "reminder", label: "Reminders", entityKey: "reminder" },
    ],
  },
  {
    id: "life",
    label: "Life",
    items: [
      { id: "person",   label: "People",    entityKey: "person"   },
      { id: "project",  label: "Projects",  entityKey: "project"  },
      { id: "document", label: "Documents", entityKey: "document" },
    ],
  },
  {
    id: "care",
    label: "Care",
    items: [
      { id: "care_note",    label: "Care Notes",    entityKey: "care_note"    },
      { id: "appointment",  label: "Appointments",  entityKey: "appointment"  },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "expense",      label: "Expenses",      entityKey: "expense"      },
      { id: "legal_matter", label: "Legal Matters", entityKey: "legal_matter" },
      { id: "home_item",    label: "Home Items",    entityKey: "home_item"    },
    ],
  },
];
