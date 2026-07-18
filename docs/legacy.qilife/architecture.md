---
title: QiLife Architecture & Build Doctrine
section: qilife
status: active
type: architecture
last_updated: 2026-06-22
---

# QiLife Architecture & Build Doctrine

> **QiLife should be one life-command interface with modules inside it.**

Not separate random apps for care, finance, tasks, documents, people, projects, etc.

---

## The Core Pattern (from Cadence)

The Cadence plugin proves the model with just 4 files:

| File            | Job                                                            |
| --------------- | -------------------------------------------------------------- |
| `manifest.json` | declares the app/plugin identity                               |
| `data.json`     | stores settings, modules, layouts, custom entities, reminders  |
| `main.js`       | app logic, navigation, entity registry, rendering, CRUD        |
| `styles.css`    | visual system and layout                                       |

The lesson is not the files. The lesson is the **pattern**:

> **Small shell + config-driven modules + generic entity screens.**

---

## What We Steal from Cadence

### 1. The Sidebar Module Model

Cadence: `Home / Planner / Projects / CRM / PRM / Workflow / Reports / Settings`

QiLife translation:

```txt
Home
Capture
Today
Life
People
Care
Finance
Legal
Home / House
Projects
Documents
Reports
Settings
```

### 2. The Entity Registry

This is the real gold. Each entity has: folder, label, fields, columns, types, enum options, suggestion sources.

**QiLife v1 entities:**

```txt
person          task            event
note            project         document
expense         account         care_note
medication      appointment     legal_matter
home_item       asset           reminder
```

**Later (not v1):**

```txt
vehicle         pet             provider
case_event      evidence_item   income_source
subscription    routine         meal
inventory_item
```

One generic table/card/detail renderer handles all of them. No hand-building every screen.

### 3. Source-of-Truth Discipline

| Layer              | Truth type                          |
| ------------------ | ----------------------------------- |
| Supabase           | structured records                  |
| QiNexus / Drive    | files, receipts, documents, photos  |
| Wiki.js / QiSpark  | manuals, explanations, doctrine     |
| QiLife app         | operational UI                      |
| AI / vector / graph | derived intelligence, not truth    |

> Cadence says: "I know where my data lives." QiLife must say the same.

### 4. Config-Driven Pages

```ts
customPages = [
  { id: "finance.transactions", label: "Transactions",   entityKey: "transaction",    defaultLayout: "table",  sectionId: "finance" },
  { id: "care.medications",     label: "Medications",    entityKey: "medication",     defaultLayout: "table",  sectionId: "care"    },
  { id: "legal.matters",        label: "Legal Matters",  entityKey: "legal_matter",   defaultLayout: "cards",  sectionId: "legal"   }
]
```

This is how we stop overbuilding.

---

## What We Do NOT Copy

### Do not build as a giant single file

Cadence can get away with that as an Obsidian plugin. For QiLife, massive single files become chaos with a cute outfit on.

Use the QiAccess pattern instead:

```txt
Route → Page → Feature → Component → Data
```

### Do not make every life thing a full separate app

**QiLife v1 = one shell:**

```txt
One shell.
One sidebar.
One dashboard.
One entity registry.
One generic entity list.
One generic detail page.
One quick capture.
```

Then add modules. Do not let "later" bully v1.

---

## Architecture Stack

```txt
QiLife UI (React/Next/Vite)
  ↓
Entity registry config
  ↓
Generic screens (table / cards / kanban / detail)
  ↓
Supabase tables/views
  ↓
QiNexus files / Google Drive blobs
  ↓
Wiki.js / QiSpark readable docs
```

---

## MVP Build Phases

### Phase 1 — Clone the Shell Concept

```txt
QiLifeShell
SidebarNav
Topbar
PageHeader
DashboardCards
EntityList
EntityDetail
QuickCaptureModal
SettingsPage
```

No AI yet. No Neo4j yet. No overcooked nonsense.

### Phase 2 — Define the Entity Registry

```ts
// src/features/qilife/data/entityRegistry.ts

export const entityRegistry = {
  person: {
    label: "Person",
    plural: "People",
    table: "qilife.people",
    primaryField: "name",
    defaultLayout: "table",
    fields: [
      { key: "name",  label: "Name",  type: "text",  primary: true },
      { key: "role",  label: "Role",  type: "text"  },
      { key: "phone", label: "Phone", type: "text"  },
      { key: "email", label: "Email", type: "text"  },
      { key: "tags",  label: "Tags",  type: "tags"  }
    ],
    columns: ["name", "role", "phone", "email"]
  }
  // ...
}
```

### Phase 3 — Build Generic Entity Pages

```txt
/entities/:entityKey
/entities/:entityKey/:id
```

Registry tells the UI what to render. No hardcoded screens per domain.

### Phase 4 — Add Domain Dashboards

Once generic CRUD works:

```txt
Home dashboard
Care dashboard
Finance dashboard
Legal dashboard
House dashboard
Projects dashboard
```

These are **views over entities**, not separate systems.

### Phase 5 — Add AI (Last)

```txt
summarize my week
show overdue care issues
find contradictions
draft a message
classify this receipt
connect this document to a legal matter
```

> If we add AI before the data shape is stable, we get a haunted Roomba with a login screen.

---

## QiLife v1 Contract

**Must have:**

- Home dashboard
- Today view
- Quick capture
- People
- Tasks
- Projects
- Care notes
- Appointments
- Expenses
- Documents
- Legal matters
- Settings
- Generic table / card / detail layouts

**Must NOT have yet:**

- Giant graph brain
- Perfect automation
- Every possible life category
- Ten database abstractions
- Multi-user enterprise nonsense
