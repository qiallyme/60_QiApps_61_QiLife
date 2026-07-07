---
title: QiLife Build Plan
type: plan
status: active
last_updated: 2026-06-22
---

# QiLife Build Plan

5 phases. Each phase ships something usable. No phase requires the next to be valuable.

---

## Phase 1 — Shell

**Goal:** One working skeleton. Navigation exists. Nothing crashes.

**Components to build:**

| Component          | What it does                          |
| ------------------ | ------------------------------------- |
| `QiLifeShell`      | Root layout, sidebar + topbar + content area |
| `SidebarNav`       | Module list, active state, collapse   |
| `Topbar`           | Mode indicator, search, quick capture button, sync status |
| `PageHeader`       | Title, breadcrumb, action buttons     |
| `DashboardCards`   | Stat cards on home screen             |
| `SettingsPage`     | Placeholder, module toggles           |

**Done when:** You can click every sidebar item and get a real (even if empty) page.

---

## Phase 2 — Entity Registry

**Goal:** One config file drives all entity screens.

**File:** `src/features/qilife/data/entityRegistry.ts`

**Done when:** `entityRegistry.person` describes the People entity completely — fields, columns, table, layout.

**Start with just these 5:**

```txt
person
task
note
expense
document
```

---

## Phase 3 — Generic Entity Screens

**Goal:** Zero hardcoded domain screens. Routes read the registry.

**Routes:**

```txt
/entities/:entityKey         → EntityList (table or cards)
/entities/:entityKey/:id     → EntityDetail
```

**Components:**

| Component       | Renders                          |
| --------------- | -------------------------------- |
| `EntityList`    | table or cards, driven by registry |
| `EntityDetail`  | form/detail view, driven by registry |
| `EntityTable`   | column config from registry      |
| `EntityCards`   | card grid, primary field + tags  |
| `EntityFilter`  | filter bar, fields from registry |

**Done when:** You can view and add a Person, Task, and Expense with zero domain-specific code.

---

## Phase 4 — Domain Dashboards

**Goal:** Smart summary views per section. Not new systems — views over existing entities.

**Dashboards:**

| Dashboard    | Shows                                              |
| ------------ | -------------------------------------------------- |
| Home         | Today snapshot, pinned items, recent activity      |
| Today        | Tasks due today, appointments, reminders           |
| Care         | Recent care notes, upcoming appointments, meds     |
| Finance      | Recent expenses, account balances, open items      |
| Legal        | Active matters, upcoming deadlines                 |
| Projects     | Active projects by status                          |

**Done when:** Home dashboard shows real data from Supabase.

---

## Phase 5 — AI Layer

**Goal:** AI on top of stable data. Not underneath it.

**Capabilities:**

```txt
summarize my week
show overdue care issues
find contradictions in legal notes
draft a message to a provider
classify this receipt into an expense category
connect this document to a legal matter
```

**Stack:** Gemini / GPT via API, Supabase pgvector for semantic search, QiServer as the local runtime.

**Done when:** At least one AI action works end-to-end with real data.

---

## What v1 Ships

```txt
✅ One shell
✅ Sidebar navigation
✅ Home dashboard
✅ Today view
✅ Quick capture modal
✅ People (person entity)
✅ Tasks (task entity)
✅ Projects (project entity)
✅ Care notes (care_note entity)
✅ Appointments (appointment entity)
✅ Expenses (expense entity)
✅ Documents (document entity)
✅ Legal matters (legal_matter entity)
✅ Generic table / cards / detail layouts
✅ Settings page
```

```txt
❌ Graph brain
❌ Perfect automation
❌ Every life category
❌ Multi-user
❌ Enterprise anything
```
