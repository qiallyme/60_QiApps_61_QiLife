# QiLife Interactive Record Rows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace bare underlined record links and oversized record cards with one compact, accessible, router-native interactive row pattern across Today, Actions, Projects, People related records, and Journal.

**Architecture:** Add presentation-only `RecordRow`, `RecordList`, and `RecordIcon` components under the shared QiLife feature layer. Modules remain responsible for loading records, resolving relationship titles, choosing routes, and formatting display-ready metadata. The shared components do not access repositories, QiRecords, authentication, storage mode, or navigation state.

**Tech Stack:** React 19, TypeScript, React Router 7, lucide-react, existing QiLife CSS variables, Vitest 4, React Testing Library 16.

## Global Constraints

- Work directly on `main` in `C:\QiLabs\60_QiApps\61_QiLife`.
- Do not change QiRecord mappings, repositories, authentication, persistence, export, restore, routing contracts, or module manifests.
- Do not add dependencies; `lucide-react` is already installed.
- Use React Router `Link` for every navigable record.
- A navigable record must be one link without nested interactive controls.
- Keep non-navigable projected records visually consistent but omit link semantics and the chevron.
- Preserve existing loading, error, empty, filtering, storage-mode, and Journal save behavior.
- Use the final stylesheet layer, `src/features/qilife/styles/assistant.css`, for the shared row classes so they are not accidentally overridden by older stylesheets.
- Preserve reduced-motion behavior and verify desktop and mobile layouts.
- Keep each commit focused; push `main` after each passing task. Deploy only after the complete presentation pattern is coherent across all approved modules.

---

## Task 1: Add the shared record-row foundation

**Files:**

- Create: `src/features/qilife/components/RecordIcon.tsx`
- Create: `src/features/qilife/components/RecordRow.tsx`
- Create: `src/features/qilife/components/RecordList.tsx`
- Create: `src/features/qilife/components/RecordRow.test.tsx`
- Create: `src/features/qilife/components/RecordList.test.tsx`
- Modify: `src/features/qilife/styles/assistant.css`

**Interfaces consumed:**

- Display-ready entity key, title, route, metadata, status, priority, date, and selected state supplied by a module.
- Existing Qi Soft Surface variables from `assistant.css`.
- Existing `lucide-react` dependency.

**Interfaces produced:**

```ts
export interface RecordRowProps {
  to?: string;
  entityKey: string;
  title: string;
  metadata?: string;
  status?: string | null;
  priority?: string | null;
  dateLabel?: string | null;
  selected?: boolean;
}

export type RecordListItem = RecordRowProps & { id: string };

export interface RecordListProps {
  items: readonly RecordListItem[];
  ariaLabel: string;
  emptyMessage?: string;
}
```

### Step 1: Write failing component tests

- [ ] Create `RecordRow.test.tsx` with tests for the single-link contract, optional content, and non-link fallback:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RecordRow } from "./RecordRow";

describe("RecordRow", () => {
  it("renders the whole record as one router-native link", () => {
    render(
      <MemoryRouter>
        <RecordRow
          to="/actions/action-1"
          entityKey="task"
          title="Send the proposal"
          metadata="Project Phoenix"
          status="next"
          priority="high"
          dateLabel="Jul 26"
          selected
        />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: /^Send the proposal/ });
    expect(link).toHaveAttribute("href", "/actions/action-1");
    expect(link).toHaveClass("qilife-record-row");
    expect(screen.getByText("Project Phoenix")).toBeInTheDocument();
    expect(screen.getByText("next")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("Jul 26")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(link).toHaveAttribute("data-selected", "true");
  });

  it("renders a non-navigable record without fake link semantics", () => {
    render(
      <MemoryRouter>
        <RecordRow entityKey="event" title="Project kickoff" />
      </MemoryRouter>,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Project kickoff").closest(".qilife-record-row"))
      .toHaveAttribute("data-navigable", "false");
  });
});
```

- [ ] Create `RecordList.test.tsx` to prove list semantics and the explicit empty state:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RecordList } from "./RecordList";

describe("RecordList", () => {
  it("renders semantic list items", () => {
    render(
      <MemoryRouter>
        <RecordList
          ariaLabel="Actions"
          items={[{
            id: "action-1",
            to: "/actions/action-1",
            entityKey: "task",
            title: "Send the proposal",
          }]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("list", { name: "Actions" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("renders the supplied empty message without an empty list", () => {
    render(
      <MemoryRouter>
        <RecordList ariaLabel="Actions" items={[]} emptyMessage="No Actions yet." />
      </MemoryRouter>,
    );

    expect(screen.getByText("No Actions yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
```

### Step 2: Confirm the tests fail for the missing components

- [ ] Run:

```powershell
npx vitest run src/features/qilife/components/RecordRow.test.tsx src/features/qilife/components/RecordList.test.tsx
```

- [ ] Expected result: both suites fail because `RecordRow` and `RecordList` do not exist.

### Step 3: Implement the shared icon and row components

- [ ] Create `RecordIcon.tsx` with one canonical Lucide mapping:

```tsx
import {
  BookOpenText,
  CalendarDays,
  CheckSquare2,
  FileText,
  FolderKanban,
  Library,
  Link2,
  MessageSquare,
  Scale,
  UserRound,
} from "lucide-react";

const icons = {
  action: CheckSquare2,
  task: CheckSquare2,
  project: FolderKanban,
  person: UserRound,
  journal: BookOpenText,
  journal_entry: BookOpenText,
  thread: MessageSquare,
  event: CalendarDays,
  timeline: CalendarDays,
  decision: Scale,
  document: FileText,
  knowledge: Library,
  knowledge_item: Library,
} as const;

export function RecordIcon({ entityKey }: { entityKey: string }) {
  const Icon = icons[entityKey.toLowerCase() as keyof typeof icons] ?? Link2;
  return <Icon aria-hidden="true" size={18} strokeWidth={1.8} />;
}
```

- [ ] Create `RecordRow.tsx`. Keep title first in the accessible name, render textual chips, and render a chevron only for links:

```tsx
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { RecordIcon } from "./RecordIcon";

export interface RecordRowProps {
  to?: string;
  entityKey: string;
  title: string;
  metadata?: string;
  status?: string | null;
  priority?: string | null;
  dateLabel?: string | null;
  selected?: boolean;
}

export function RecordRow({
  to,
  entityKey,
  title,
  metadata,
  status,
  priority,
  dateLabel,
  selected = false,
}: RecordRowProps) {
  const content = (
    <>
      <span className="qilife-record-row-icon"><RecordIcon entityKey={entityKey} /></span>
      <span className="qilife-record-row-content">
        <span className="qilife-record-row-title">{title}</span>
        {metadata && <span className="qilife-record-row-meta">{metadata}</span>}
      </span>
      {(status || priority) && (
        <span className="qilife-record-row-chips">
          {status && <span className="qilife-record-chip" data-kind="status">{status}</span>}
          {priority && <span className="qilife-record-chip" data-kind="priority">{priority}</span>}
        </span>
      )}
      {dateLabel && <span className="qilife-record-row-date">{dateLabel}</span>}
      {to && <ChevronRight className="qilife-record-row-chevron" aria-hidden="true" size={18} />}
    </>
  );

  if (to) {
    return <Link className="qilife-record-row" data-selected={selected} data-navigable="true" to={to}>{content}</Link>;
  }

  return <div className="qilife-record-row" data-selected={selected} data-navigable="false">{content}</div>;
}
```

- [ ] Create `RecordList.tsx` as the semantic collection wrapper:

```tsx
import { RecordRow, type RecordRowProps } from "./RecordRow";

export type RecordListItem = RecordRowProps & { id: string };

export interface RecordListProps {
  items: readonly RecordListItem[];
  ariaLabel: string;
  emptyMessage?: string;
}

export function RecordList({ items, ariaLabel, emptyMessage }: RecordListProps) {
  if (items.length === 0) {
    return emptyMessage ? <p className="qilife-muted">{emptyMessage}</p> : null;
  }

  return (
    <ul className="qilife-record-list" aria-label={ariaLabel}>
      {items.map(({ id, ...item }) => (
        <li key={id}><RecordRow {...item} /></li>
      ))}
    </ul>
  );
}
```

### Step 4: Add the shared visual treatment

- [ ] Append the shared row classes to `assistant.css` using existing tokens:

```css
.qilife-record-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.qilife-record-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto auto;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 10px 12px;
  color: var(--qi-text);
  text-decoration: none;
  background: var(--qi-surface-interactive);
  border: 1px solid var(--qi-border-primary);
  border-radius: var(--qi-radius-md);
  box-shadow: var(--qi-shadow-soft);
}

.qilife-record-row[data-navigable="true"]:hover {
  color: var(--qi-text);
  background: var(--qi-surface-raised);
  border-color: var(--qi-border-strong);
}

.qilife-record-row[data-navigable="true"]:focus-visible {
  outline: 2px solid var(--qi-primary);
  outline-offset: 2px;
  box-shadow: var(--qi-focus-ring);
}

.qilife-record-row[data-selected="true"] {
  background: var(--qi-green-dark);
  border-color: var(--qi-primary);
}

.qilife-record-row-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  color: var(--qi-primary);
  background: var(--qi-green-dark);
  border: 1px solid var(--qi-border-primary);
  border-radius: 10px;
}

.qilife-record-row-content {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.qilife-record-row-title {
  overflow: hidden;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qilife-record-row-meta,
.qilife-record-row-date {
  color: var(--qi-muted);
  font-size: 12px;
}

.qilife-record-row-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.qilife-record-chip {
  padding: 3px 8px;
  color: var(--qi-muted);
  background: var(--qi-surface-raised);
  border: 1px solid var(--qi-border-primary);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.qilife-record-row-chevron {
  color: var(--qi-faint);
}

@media (max-width: 760px) {
  .qilife-record-row {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .qilife-record-row-chips,
  .qilife-record-row-date {
    grid-column: 2;
    justify-self: start;
  }

  .qilife-record-row-chevron {
    grid-column: 3;
    grid-row: 1 / span 3;
  }
}
```

- [ ] Do not add a second token set; the snippet uses the currently defined `--qi-primary`, `--qi-green-dark`, `--qi-focus-ring`, and `--qi-shadow-soft` variables.

### Step 5: Run focused and static verification

- [ ] Run:

```powershell
npx vitest run src/features/qilife/components/RecordRow.test.tsx src/features/qilife/components/RecordList.test.tsx
npx tsc --noEmit
git diff --check
```

- [ ] Expected result: both component suites pass, TypeScript passes, and `git diff --check` reports no whitespace errors.

### Step 6: Commit and push the foundation

- [ ] Stage only the five new component/test files and `assistant.css`.
- [ ] Commit:

```powershell
git commit -m "feat(qilife): add shared interactive record rows"
git push origin main
```

---

## Task 2: Convert Today projections to record rows

**Files:**

- Create: `src/modules/today/routes.test.tsx`
- Modify: `src/modules/today/routes.tsx`

**Interfaces consumed:**

- Existing `projectToday` result buckets.
- Existing entity-to-route mapping in `today/routes.tsx`.
- Shared `RecordListItem` and `RecordList`.

**Interfaces produced:**

- Every navigable Today item becomes a full-row link to its owning URL.
- Unknown entity types remain non-navigable rows.
- Empty Today sections remain hidden exactly as they are now.

### Step 1: Write the failing Today presentation test

- [ ] Create `routes.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { QiRecord } from "../../features/qilife/types";
import { TodayRoute } from "./routes";

const { listAllRecords } = vi.hoisted(() => ({ listAllRecords: vi.fn() }));
vi.mock("../../features/qilife/services/qilifeStore", () => ({ listAllRecords }));

const waitingAction: QiRecord = {
  id: "action-1",
  entity_key: "task",
  title: "Send the proposal",
  status: "waiting",
  priority: "high",
  due_date: null,
  data: {},
  created_at: "2026-07-20T12:00:00.000Z",
  updated_at: "2026-07-25T12:00:00.000Z",
};

describe("TodayRoute", () => {
  it("renders projected records as full-row owning-module links", async () => {
    listAllRecords.mockResolvedValue([waitingAction]);
    render(<MemoryRouter><TodayRoute /></MemoryRouter>);

    const link = await screen.findByRole("link", { name: /^Send the proposal/ });
    expect(link).toHaveAttribute("href", "/actions/action-1");
    expect(link).toHaveClass("qilife-record-row");
    expect(screen.getByRole("list", { name: "Waiting Actions" })).toBeInTheDocument();
  });
});
```

### Step 2: Confirm the test fails on the current plain-link markup

- [ ] Run:

```powershell
npx vitest run src/modules/today/routes.test.tsx
```

- [ ] Expected result: the route renders the record, but the link lacks `qilife-record-row` and the named record list.

### Step 3: Replace `RecordLink` and the unordered-link list

- [ ] Import `RecordList` and `RecordListItem`.
- [ ] Map each `QiRecord` to display-ready row data without moving route or projection logic into the shared component:

```tsx
function toRecordListItem(record: QiRecord): RecordListItem {
  const prefix = routes[record.entity_key];
  return {
    id: record.id,
    to: prefix ? `${prefix}/${record.id}` : undefined,
    entityKey: record.entity_key,
    title: record.title,
    metadata: record.entity_key.replaceAll("_", " "),
    status: record.status,
    priority: record.priority,
    dateLabel: record.due_date?.slice(0, 10) ?? null,
  };
}

function Section({ title, records }: { title: string; records: QiRecord[] }) {
  if (!records.length) return null;
  return (
    <section className="qilife-panel today-section">
      <div className="qilife-section-heading"><h2>{title}</h2><span>{records.length}</span></div>
      <RecordList ariaLabel={title} items={records.map(toRecordListItem)} />
    </section>
  );
}
```

- [ ] Remove the now-unused `Link` import and `RecordLink` component.

### Step 4: Verify Today and the shared component regression

- [ ] Run:

```powershell
npx vitest run src/modules/today/routes.test.tsx src/modules/today/services/todayProjection.test.ts src/features/qilife/components/RecordRow.test.tsx
npx tsc --noEmit
git diff --check
```

- [ ] Expected result: all focused tests and TypeScript pass; projection behavior is unchanged.

### Step 5: Commit and push Today

- [ ] Commit:

```powershell
git commit -m "style(today): present projections as record rows"
git push origin main
```

---

## Task 3: Convert Actions and Projects indexes

**Files:**

- Create: `src/modules/actions/routes.test.tsx`
- Create: `src/modules/projects/index-route.test.tsx`
- Modify: `src/modules/actions/routes.tsx`
- Modify: `src/modules/projects/routes.tsx`

**Interfaces consumed:**

- Existing `Action`, `Project`, repository, filter, and related-title behavior.
- Shared `RecordList`.

**Interfaces produced:**

- Actions and Projects indexes use compact rows while preserving filters, empty states, and owning routes.

### Step 1: Write failing index presentation tests

- [ ] In `actions/routes.test.tsx`, mock only the repositories used by `ActionsIndexRoute` and assert the existing route plus the new row class:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ActionsIndexRoute } from "./routes";

vi.mock("./services/actionRepository", () => ({
  actionRepository: {
    list: vi.fn().mockResolvedValue([{
      id: "action-1",
      title: "Send the proposal",
      status: "next",
      priority: "high",
      dueDate: "2026-07-30",
      projectId: "project-1",
      peopleIds: [],
      threadId: null,
      context: "Office",
      notes: "",
    }]),
  },
}));

vi.mock("../../features/qilife/services/qilifeStore", () => ({
  listRecords: vi.fn().mockImplementation((entity: string) => Promise.resolve(
    entity === "project"
      ? [{ id: "project-1", entity_key: "project", title: "Project Phoenix", data: {} }]
      : [],
  )),
}));

describe("ActionsIndexRoute", () => {
  it("renders Actions as compact owning-route rows", async () => {
    render(<MemoryRouter><ActionsIndexRoute /></MemoryRouter>);
    const link = await screen.findByRole("link", { name: /^Send the proposal/ });
    expect(link).toHaveAttribute("href", "/actions/action-1");
    expect(link).toHaveClass("qilife-record-row");
    expect(screen.getByText("Project Phoenix")).toBeInTheDocument();
  });
});
```

- [ ] In `projects/index-route.test.tsx`, mock `projectRepository.list()` and unrelated exports required when the routes module loads:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProjectsIndexRoute } from "./routes";

vi.mock("./services/projectRepository", () => ({
  projectRepository: {
    list: vi.fn().mockResolvedValue([{
      id: "project-1",
      name: "Project Phoenix",
      status: "active",
      priority: "high",
      dueDate: "2026-08-01",
      ownerId: null,
      area: "Work",
      tags: [],
      brief: "Ship the new client experience",
    }]),
  },
}));

describe("ProjectsIndexRoute", () => {
  it("renders Projects as compact owning-route rows", async () => {
    render(<MemoryRouter><ProjectsIndexRoute /></MemoryRouter>);
    const link = await screen.findByRole("link", { name: /^Project Phoenix/ });
    expect(link).toHaveAttribute("href", "/projects/project-1");
    expect(link).toHaveClass("qilife-record-row");
    expect(screen.getByText("Ship the new client experience")).toBeInTheDocument();
  });
});
```

### Step 2: Confirm both tests fail on the card grid

- [ ] Run:

```powershell
npx vitest run src/modules/actions/routes.test.tsx src/modules/projects/index-route.test.tsx
```

- [ ] Expected result: both links exist but use `qilife-card`, not `qilife-record-row`.

### Step 3: Convert the Actions index

- [ ] Replace the `qilife-card-grid` map with:

```tsx
<RecordList
  ariaLabel="Actions"
  items={visible.map((action) => ({
    id: action.id,
    to: `/actions/${action.id}`,
    entityKey: "task",
    title: action.title,
    metadata: action.projectId
      ? titleFor(records, action.projectId)
      : action.context || "No project",
    status: action.status,
    priority: action.priority,
    dateLabel: action.dueDate,
  }))}
/>
```

- [ ] Preserve the existing separate `qilife-empty` message after the list so filter behavior is unchanged.

### Step 4: Convert the Projects index

- [ ] Replace the `qilife-card-grid` map with:

```tsx
<RecordList
  ariaLabel="Projects"
  items={projects.map((project) => ({
    id: project.id,
    to: `/projects/${project.id}`,
    entityKey: "project",
    title: project.name,
    metadata: project.brief || project.area || "No brief",
    status: project.status,
    priority: project.priority,
    dateLabel: project.dueDate,
  }))}
/>
```

- [ ] Preserve `No Projects yet.` as the existing module-level empty state.

### Step 5: Verify indexes and filtering

- [ ] Run:

```powershell
npx vitest run src/modules/actions/routes.test.tsx src/modules/actions/services/actionFilters.test.ts src/modules/projects/index-route.test.tsx src/modules/projects/services/projectRepository.test.ts
npx tsc --noEmit
git diff --check
```

- [ ] Expected result: all focused suites pass; Action filters and Project repository behavior are unchanged.

### Step 6: Commit and push the indexes

- [ ] Commit:

```powershell
git commit -m "style(qilife): streamline Actions and Projects lists"
git push origin main
```

---

## Task 4: Convert Project dashboard relationships and clarify quick creation

**Files:**

- Create: `src/modules/projects/detail-route.test.tsx`
- Modify: `src/modules/projects/routes.tsx`
- Modify: `src/features/qilife/styles/assistant.css`

**Interfaces consumed:**

- Existing relation resolver methods and current related-record route decisions.
- Existing project quick-create destinations and query parameters.
- Shared `RecordList`.

**Interfaces produced:**

- Related Project records use the same row grammar.
- Quick-create destinations remain links but are visually grouped as compact buttons, not record rows.

### Step 1: Write a failing Project detail test

- [ ] Create `detail-route.test.tsx` with stable repository and resolver mocks:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProjectDetailRoute } from "./routes";

vi.mock("./services/projectRepository", () => ({
  projectRepository: {
    get: vi.fn().mockResolvedValue({
      id: "project-1",
      name: "Project Phoenix",
      status: "active",
      priority: "high",
      dueDate: null,
      ownerId: null,
      area: "Work",
      tags: [],
      brief: "Ship the new client experience",
    }),
  },
}));

vi.mock("../../features/qilife/relations/relationResolver", () => ({
  relationResolver: {
    getActionsForProject: vi.fn().mockResolvedValue([{
      id: "action-1",
      entity_key: "task",
      title: "Send the proposal",
      status: "next",
      priority: "high",
      due_date: "2026-07-30",
      data: {},
    }]),
    getPeopleForProject: vi.fn().mockResolvedValue([]),
    getJournalForProject: vi.fn().mockResolvedValue([]),
    getRelatedRecords: vi.fn().mockResolvedValue([]),
  },
}));

describe("ProjectDetailRoute", () => {
  it("uses record rows for related work and buttons for quick creation", async () => {
    render(
      <MemoryRouter initialEntries={["/projects/project-1"]}>
        <Routes><Route path="/projects/:id" element={<ProjectDetailRoute />} /></Routes>
      </MemoryRouter>,
    );

    const action = await screen.findByRole("link", { name: /^Send the proposal/ });
    expect(action).toHaveAttribute("href", "/actions/action-1");
    expect(action).toHaveClass("qilife-record-row");
    expect(screen.getByRole("link", { name: "Add Journal entry" })).toHaveClass("qilife-btn");
    expect(screen.getByRole("link", { name: "Add Event" })).toHaveClass("qilife-btn");
  });
});
```

### Step 2: Confirm the test fails on plain related and quick-create links

- [ ] Run:

```powershell
npx vitest run src/modules/projects/detail-route.test.tsx
```

- [ ] Expected result: the Action and quick-create links exist, but they lack the shared row/button classes.

### Step 3: Replace `RelatedList` internals

- [ ] Keep route selection in the Project module and pass display-ready rows:

```tsx
function RelatedList({
  title,
  records,
  route,
}: {
  title: string;
  records: QiRecord[];
  route?: string;
}) {
  return (
    <section className="qilife-panel">
      <div className="qilife-section-heading"><h2>{title}</h2><span>{records.length}</span></div>
      <RecordList
        ariaLabel={title}
        emptyMessage="None yet."
        items={records.map((record) => ({
          id: record.id,
          to: route ? `${route}/${record.id}` : undefined,
          entityKey: record.entity_key,
          title: record.title,
          status: record.status,
          priority: record.priority,
          dateLabel: record.due_date?.slice(0, 10) ?? null,
        }))}
      />
    </section>
  );
}
```

- [ ] Do not invent routes for Timeline events, Decisions, Documents, or Knowledge; those rows remain non-navigable until an owning detail route exists.

### Step 4: Make the quick-create rail explicit

- [ ] Replace the bare-link action group with:

```tsx
<nav className="qilife-quick-action-rail" aria-label="Project quick actions">
  <Link className="qilife-btn" to={`/journal/new?projectId=${id}`}>Add Journal entry</Link>
  <Link className="qilife-btn" to={`/events/new?projectId=${id}`}>Add Event</Link>
  <Link className="qilife-btn" to={`/projects/${id}/link-person`}>Link Person</Link>
  <Link className="qilife-btn" to={`/projects/${id}/link-document`}>Link Document</Link>
</nav>
```

- [ ] Add only layout styling, reusing button primitives:

```css
.qilife-quick-action-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
```

### Step 5: Verify Project behavior remains intact

- [ ] Run:

```powershell
npx vitest run src/modules/projects/detail-route.test.tsx src/modules/projects/services/projectQuickCreate.test.ts src/modules/projects/services/projectRepository.test.ts
npx tsc --noEmit
git diff --check
```

- [ ] Expected result: related Action navigation and quick-create tests pass; existing pre-linking behavior remains unchanged.

### Step 6: Commit and push the Project dashboard

- [ ] Commit:

```powershell
git commit -m "style(projects): clarify related work and quick actions"
git push origin main
```

---

## Task 5: Unify Journal and People related-record presentation

**Files:**

- Modify: `src/modules/journal/components/JournalList.tsx`
- Modify: `src/modules/journal/components/JournalList.test.tsx`
- Modify: `src/modules/people/components/RelatedRecordsPanel.tsx`
- Create: `src/modules/people/components/RelatedRecordsPanel.test.tsx`

**Interfaces consumed:**

- Existing `JournalEntry` display fields.
- Existing `RelatedRecordReference` values and fallback routes.
- Shared `RecordList`.

**Interfaces produced:**

- Journal entries and Person dashboard related records use the same accessible record-row pattern.
- Existing Journal and People data behavior remains unchanged.

### Step 1: Strengthen the Journal regression test before changing markup

- [ ] Extend the existing Journal link test:

```tsx
const link = screen.getByRole("link", { name: /^A day worth keeping/ });
expect(link).toHaveAttribute("href", "/journal/entry-123");
expect(link).toHaveClass("qilife-record-row");
expect(screen.getByText("2026-07-24 · life")).toBeInTheDocument();
expect(screen.getByText("pinned")).toBeInTheDocument();
```

- [ ] Run:

```powershell
npx vitest run src/modules/journal/components/JournalList.test.tsx
```

- [ ] Expected result: the current custom journal link does not have `qilife-record-row`.

### Step 2: Convert JournalList

- [ ] Replace its custom wrapper and links with:

```tsx
return (
  <RecordList
    ariaLabel="Journal entries"
    items={entries.map((entry) => ({
      id: entry.id,
      to: `/journal/${entry.id}`,
      entityKey: "journal_entry",
      title: entry.title,
      metadata: `${entry.entryDate || "Undated"} · ${entry.tags.join(", ") || "No tags"}`,
      status: entry.pinned ? "pinned" : null,
    }))}
  />
);
```

- [ ] Keep the existing `qilife-empty` Journal empty state before this return so its wording and behavior remain unchanged.

### Step 3: Write the failing People related-record test

- [ ] Create `RelatedRecordsPanel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RelatedRecordsPanel } from "./RelatedRecordsPanel";

describe("RelatedRecordsPanel", () => {
  it("renders linked records as shared owning-route rows", () => {
    render(
      <MemoryRouter>
        <RelatedRecordsPanel records={[{
          id: "action-1",
          entityType: "task",
          title: "Send the proposal",
          timestamp: "2026-07-26T12:00:00.000Z",
          summary: "Next action",
          sourceModule: "actions",
          relationshipType: "assigned_to",
          targetRoute: "/actions/action-1",
        }]} />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: /^Send the proposal/ });
    expect(link).toHaveAttribute("href", "/actions/action-1");
    expect(link).toHaveClass("qilife-record-row");
    expect(screen.getByText("assigned to")).toBeInTheDocument();
  });
});
```

- [ ] Run:

```powershell
npx vitest run src/modules/people/components/RelatedRecordsPanel.test.tsx
```

- [ ] Expected result: the current one-off related record link lacks the shared row class.

### Step 4: Convert RelatedRecordsPanel and remove one-off styling

- [ ] Replace the emoji mapping, inline record styles, and nested layout with:

```tsx
<section className="qilife-panel people-related-records">
  <div className="qilife-section-heading">
    <h4>Related QiLife Records</h4>
    <span>{records.length} linked</span>
  </div>
  <RecordList
    ariaLabel="Related QiLife Records"
    emptyMessage="No cross-module records linked yet."
    items={records.map((record) => ({
      id: record.id,
      to: record.targetRoute,
      entityKey: record.entityType,
      title: record.title,
      metadata: record.summary,
      status: record.relationshipType.replaceAll("_", " "),
      dateLabel: new Date(record.timestamp).toLocaleDateString(),
    }))}
  />
</section>
```

- [ ] Remove the `React` and `Link` imports and import `RecordList`.
- [ ] Do not change `RelatedRecordReference`, People repositories, or relationship resolution.

### Step 5: Run module and regression verification

- [ ] Run:

```powershell
npx vitest run src/modules/journal/components/JournalList.test.tsx src/modules/journal/routes.test.tsx src/modules/people/components/RelatedRecordsPanel.test.tsx src/modules/people/services/peopleRepository.test.ts
npx tsc --noEmit
git diff --check
```

- [ ] Expected result: Journal routes/save behavior and People repository behavior still pass.

### Step 6: Run the complete release verification

- [ ] Run:

```powershell
npm run test:ci
npm run build
git diff --check
git status --short
```

- [ ] Expected result: all tests pass, the TypeScript/Vite build succeeds, no whitespace errors are reported, and only Task 5 files are uncommitted.

### Step 7: Perform responsive and navigation smoke checks

- [ ] Run the app locally with `npm run dev`.
- [ ] At approximately `1440x900` and `390x844`, inspect:
  - `/today`
  - `/actions`
  - `/projects`
  - one `/projects/:id`
  - one `/people/:id` with related records
  - `/journal`
- [ ] Verify each record title is not underlined, each navigable row is a full click target, metadata wraps without horizontal scrolling, focus is visible, and rows do not move when reduced motion is enabled.
- [ ] Verify Browser Back/Forward, direct route refresh, persistent storage-mode indicator, Journal entry opening/editing, and no browser console errors.

### Step 8: Commit and push the final module adoption

- [ ] Commit:

```powershell
git commit -m "style(qilife): unify Journal and People record lists"
git push origin main
```

### Step 9: Deploy and production-smoke the coherent presentation pass

- [ ] Build from the committed tree and deploy the existing Worker:

```powershell
npm run build
npx wrangler deploy
```

- [ ] Capture the Cloudflare version from Wrangler output.
- [ ] Smoke the production routes:
  - `https://qilife.qilife.workers.dev/today`
  - `https://qilife.qilife.workers.dev/actions`
  - `https://qilife.qilife.workers.dev/projects`
  - one real `/projects/:id`
  - one real `/people/:id`
  - `https://qilife.qilife.workers.dev/journal`
- [ ] Verify browser title, storage-mode indicator, full-row navigation, refresh, Back/Forward, and absence of runtime console errors.
- [ ] Confirm `git status -sb` reports `main...origin/main` with a clean worktree.

---

## Final Acceptance Criteria

- Bare underlined record links are removed from Today and Project related-record sections.
- Oversized record cards are replaced on Actions and Projects indexes.
- Journal and People related records use the same shared visual grammar.
- Project quick-create commands are compact buttons in an explicitly labelled action rail.
- Every navigable record is a single React Router link to its existing owning route.
- Non-navigable records do not pretend to be links.
- Record titles, metadata, status, priority, dates, and entity icons are readable and consistent.
- Desktop and mobile layouts do not overflow.
- Keyboard focus and textual status information satisfy the approved accessibility rules.
- No dependency, route, persistence, authentication, recovery, or QiRecord contract changes are introduced.
- Focused tests, the complete test suite, TypeScript/Vite production build, and `git diff --check` pass.
- The existing production Worker is deployed only after the full approved pattern is coherent.
