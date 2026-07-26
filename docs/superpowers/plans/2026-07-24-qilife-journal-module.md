# QiLife Journal Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable URL-first QiLife module registry and implement Journal as the first registered module while preserving the existing state-driven application behind a temporary compatibility route.

**Architecture:** `BrowserRouter` owns application location. Declarative module manifests feed a typed central registry whose routes render before a temporary compatibility catch-all. Journal maps typed entries to the shared `QiRecord` model through an injected repository that delegates to `qilifeStore`; editor changes persist through a debounced serialized save queue with router-level navigation protection.

**Tech Stack:** React 19, TypeScript, Vite 8, React Router DOM 7.18.1, Vitest 4.1.10, jsdom 29.1.1, React Testing Library 16.3.2, DOM Testing Library 10.4.1, jest-dom 6.9.1, user-event 14.6.1.

## Global Constraints

- Work only in the active application under `src/`, `public/`, `supabase/`, root configuration, and established documentation paths.
- Preserve the untracked user-owned `codex.md` and all unrelated changes.
- Journal must use `entity_key: "journal_entry"` in the shared `qilife.records` model.
- Journal dates exist only in `data.entry_date`; `due_date` remains null.
- Set `raw_capture` once during the first successful creation; edits never change it.
- Legacy `data.body` may supply `body_markdown`, but must never be used to fabricate `raw_capture`.
- No Journal-specific Supabase client, table, local database, mutation queue, or sync engine.
- Module manifests are declarative and contain no persistence logic or stateful service instances.
- Module routes render before the explicitly temporary compatibility catch-all.
- New modules must use URL-first routing; do not add new state-only screens.
- Use router-native links and navigation; do not use `window.location` for application navigation.
- Authentication return destinations must be same-origin internal paths and preserve pathname, search, and hash.
- Do not remove or rewrite Supabase callback parameters before the Supabase client processes them.
- Preserve the current Ctrl/Cmd+K quick-capture behavior; add only the minimal Journal command capability.
- Modify `AssistantPage.tsx` only if its existing `QiRecord` result callback supports a narrow Journal navigation branch.
- Do not add advanced calendars, mood analytics, streaks, AI summaries, elaborate templates, or unrelated module migrations.
- Every production behavior begins with a focused failing test and an observed expected failure.

---

## Planned File Map

### New application foundation

- `src/app/AppRouter.tsx` — renders aggregated module routes before the compatibility route.
- `src/app/CompatibilityShellRoute.tsx` — named temporary wrapper around the existing `QiLifeShell`.
- `src/app/moduleTypes.ts` — declarative module, route, navigation, command, and widget types.
- `src/app/moduleRegistry.ts` — deterministic aggregation and uniqueness validation.
- `src/test/setup.ts` — Vitest DOM matcher and cleanup setup.
- `vitest.config.ts` — jsdom test configuration.

### New Journal module

- `src/modules/journal/types.ts` — Journal domain and persistence interfaces.
- `src/modules/journal/manifest.ts` — declarative Journal capabilities.
- `src/modules/journal/routes.tsx` — route-level Journal components.
- `src/modules/journal/components/JournalCalendar.tsx` — simple date filter.
- `src/modules/journal/components/JournalEditor.tsx` — create/edit Markdown surface and save states.
- `src/modules/journal/components/JournalFilters.tsx` — query, tag, and date controls.
- `src/modules/journal/components/JournalList.tsx` — router-native entry links.
- `src/modules/journal/components/JournalNotFound.tsx` — missing/inaccessible/wrong-type state.
- `src/modules/journal/hooks/useJournalEntry.ts` — route-entry loading and save queue.
- `src/modules/journal/hooks/useJournalEntries.ts` — list loading and filtering state.
- `src/modules/journal/services/journalRepository.ts` — shared-record mapping and persistence adapter.
- `src/modules/journal/services/journalSearch.ts` — pure search and filtering.
- `src/modules/journal/services/markdownExport.ts` — deterministic Markdown export.
- `src/modules/journal/widgets/JournalWidget.tsx` — minimal dashboard Journal action.

### Existing files changed narrowly

- `package.json`, `package-lock.json` — pinned router/test dependencies and scripts.
- `tsconfig.json` — Vitest and jest-dom test types.
- `.github/workflows/ci.yml` — non-interactive tests before build.
- `src/main.tsx` — mount `AppRouter` inside `BrowserRouter`.
- `src/features/qilife/components/QiLifeShell.tsx` — compatibility host and router-native module entry handling.
- `src/features/qilife/components/SidebarNav.tsx` — render registered URL-first navigation.
- `src/features/qilife/components/HomeDashboard.tsx` — render the registered Journal widget.
- `src/features/qilife/components/Topbar.tsx` — expose the minimal registered Journal action without replacing quick capture.
- `src/features/qilife/components/AssistantPage.tsx` — only a narrow Journal result navigation branch if the current contract supports it.
- `src/features/qilife/auth/AuthProvider.tsx` — safe same-origin auth return URL.
- `src/features/qilife/data/entityRegistry.ts` — align Journal field names with the approved mapping.
- `src/features/qilife/services/qilifeStore.ts` — only if a shared read operation is required after verifying the API contract.
- `src/features/qilife/styles/qilife.css` — minimal Journal integration styles.
- `docs/ARCHITECTURE.md` — implemented module and persistence boundaries.
- `docs/architecture/qilife_journal_module.md` — Journal mapping, routing, save, and sync decisions.

---

## Phase 1 / Commit Checkpoint: Test and Routing Foundation

### Task 1: Install the pinned test and router foundation

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Test: `src/test/smoke.test.tsx`

**Interfaces:**

- Produces scripts `test`, `test:ci`, and `check`.
- Produces a jsdom Vitest environment with jest-dom matchers and automatic React cleanup.

- [ ] **Step 1: Install exact dependencies and update the lockfile**

Run:

```powershell
npm install --save-exact react-router-dom@7.18.1
npm install --save-dev --save-exact vitest@4.1.10 jsdom@29.1.1 @testing-library/react@16.3.2 @testing-library/dom@10.4.1 @testing-library/jest-dom@6.9.1 @testing-library/user-event@14.6.1
```

Expected: `package.json` contains exact versions without `^` or `~`; `package-lock.json` changes.

- [ ] **Step 2: Add test scripts**

Set:

```json
{
  "scripts": {
    "dev": "vite",
    "test": "vitest",
    "test:ci": "vitest run",
    "build": "tsc && vite build",
    "check": "npm run test:ci && npm run build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 3: Create a failing DOM smoke test**

Create `src/test/smoke.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("test foundation", () => {
  it("renders React into jsdom", () => {
    render(<p>QiLife test foundation</p>);
    expect(screen.getByText("QiLife test foundation")).toBeInTheDocument();
  });
});
```

Run:

```powershell
npm run test:ci -- src/test/smoke.test.tsx
```

Expected: FAIL because the Vitest jsdom setup and jest-dom matcher types are not configured.

- [ ] **Step 4: Add the minimal test configuration**

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
```

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vitest.config.ts"]
}
```

- [ ] **Step 5: Verify the foundation**

Run:

```powershell
npm run test:ci -- src/test/smoke.test.tsx
npm run build
```

Expected: smoke test PASS; production build PASS.

### Task 2: Add BrowserRouter with a temporary compatibility route

**Files:**

- Create: `src/app/CompatibilityShellRoute.tsx`
- Create: `src/app/AppRouter.tsx`
- Modify: `src/main.tsx`
- Test: `src/app/AppRouter.test.tsx`

**Interfaces:**

- Produces `AppRouter(): JSX.Element`.
- Produces `CompatibilityShellRoute(): JSX.Element`.
- Consumes module routes from Phase 2; until then uses an empty route array.

- [ ] **Step 1: Write failing compatibility-route tests**

Create `src/app/AppRouter.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../features/qilife/components/QiLifeShell", () => ({
  QiLifeShell: () => <div>Compatibility QiLife shell</div>,
}));

import { AppRouter } from "./AppRouter";

describe("AppRouter", () => {
  it("renders the temporary compatibility shell for existing paths", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRouter />
      </MemoryRouter>,
    );
    expect(screen.getByText("Compatibility QiLife shell")).toBeInTheDocument();
  });
});
```

Run:

```powershell
npm run test:ci -- src/app/AppRouter.test.tsx
```

Expected: FAIL because `AppRouter` does not exist.

- [ ] **Step 2: Implement the smallest compatibility router**

Create `src/app/CompatibilityShellRoute.tsx`:

```tsx
import { QiLifeShell } from "../features/qilife/components/QiLifeShell";

/**
 * Temporary bridge for pre-module state-driven QiLife screens.
 * New screens and modules must register URL-first routes instead.
 */
export function CompatibilityShellRoute() {
  return <QiLifeShell />;
}
```

Create `src/app/AppRouter.tsx`:

```tsx
import { Route, Routes } from "react-router-dom";
import { CompatibilityShellRoute } from "./CompatibilityShellRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route path="*" element={<CompatibilityShellRoute />} />
    </Routes>
  );
}
```

Modify `src/main.tsx` so the render tree is:

```tsx
<React.StrictMode>
  <AuthProvider>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </AuthProvider>
</React.StrictMode>
```

- [ ] **Step 3: Verify compatibility behavior**

Run:

```powershell
npm run test:ci -- src/app/AppRouter.test.tsx
npm run build
```

Expected: route test PASS; production build PASS.

- [ ] **Step 4: Commit checkpoint**

Run:

```powershell
git add package.json package-lock.json tsconfig.json vitest.config.ts src/test src/app/AppRouter.tsx src/app/AppRouter.test.tsx src/app/CompatibilityShellRoute.tsx src/main.tsx
git commit -m "test: add QiLife routing foundation"
```

Expected: commit contains only test tooling and the compatibility router foundation.

---

## Phase 2 / Commit Checkpoint: Module Registry

### Task 3: Define and aggregate declarative module capabilities

**Files:**

- Create: `src/app/moduleTypes.ts`
- Create: `src/app/moduleRegistry.ts`
- Modify: `src/app/AppRouter.tsx`
- Test: `src/app/moduleRegistry.test.ts`
- Test: `src/app/AppRouter.test.tsx`

**Interfaces:**

- Produces `QiLifeModule`, `ModuleRoute`, `NavigationItem`, `CommandDefinition`, and `DashboardWidgetDefinition`.
- Produces `createModuleRegistry(modules)` and singleton `moduleRegistry`.
- Produces registry arrays `routes`, `navigation`, `commands`, `widgets`, and `recordTypes`.

- [ ] **Step 1: Write failing registry tests**

Create `src/app/moduleRegistry.test.ts`:

```tsx
import { describe, expect, it } from "vitest";
import { createModuleRegistry } from "./moduleRegistry";
import type { QiLifeModule } from "./moduleTypes";

const Alpha = () => null;

function module(overrides: Partial<QiLifeModule> = {}): QiLifeModule {
  return {
    key: "alpha",
    name: "Alpha",
    routes: [{ id: "alpha-index", path: "/alpha", Component: Alpha }],
    navigation: [{ id: "alpha-nav", label: "Alpha", to: "/alpha", icon: "A" }],
    commands: [{ id: "alpha-new", label: "New Alpha", to: "/alpha/new" }],
    widgets: [{ id: "alpha-widget", label: "Alpha", to: "/alpha" }],
    recordTypes: ["alpha_record"],
    ...overrides,
  };
}

describe("createModuleRegistry", () => {
  it("aggregates capabilities deterministically", () => {
    const registry = createModuleRegistry([module()]);
    expect(registry.routes.map((route) => route.path)).toEqual(["/alpha"]);
    expect(registry.navigation.map((item) => item.to)).toEqual(["/alpha"]);
    expect(registry.commands.map((item) => item.to)).toEqual(["/alpha/new"]);
    expect(registry.widgets.map((item) => item.to)).toEqual(["/alpha"]);
    expect(registry.recordTypes).toEqual(["alpha_record"]);
  });

  it("rejects duplicate module keys", () => {
    expect(() => createModuleRegistry([module(), module()])).toThrow(
      'Duplicate QiLife module key "alpha".',
    );
  });

  it("rejects duplicate route ids", () => {
    expect(() =>
      createModuleRegistry([
        module(),
        module({
          key: "beta",
          name: "Beta",
          routes: [{ id: "alpha-index", path: "/beta", Component: Alpha }],
        }),
      ]),
    ).toThrow('Duplicate QiLife module route id "alpha-index".');
  });
});
```

Run:

```powershell
npm run test:ci -- src/app/moduleRegistry.test.ts
```

Expected: FAIL because the module types and registry do not exist.

- [ ] **Step 2: Implement module types**

Create `src/app/moduleTypes.ts`:

```ts
import type { ComponentType } from "react";

export interface ModuleRoute {
  id: string;
  path: string;
  Component: ComponentType;
}

export interface NavigationItem {
  id: string;
  label: string;
  to: string;
  icon: string;
}

export interface CommandDefinition {
  id: string;
  label: string;
  to: string;
  keywords?: string[];
}

export interface DashboardWidgetDefinition {
  id: string;
  label: string;
  to: string;
  Component?: ComponentType<{ to: string }>;
}

export interface QiLifeModule {
  key: string;
  name: string;
  routes: ModuleRoute[];
  navigation?: NavigationItem[];
  commands?: CommandDefinition[];
  widgets?: DashboardWidgetDefinition[];
  recordTypes?: string[];
}

export interface QiLifeModuleRegistry {
  modules: readonly QiLifeModule[];
  routes: readonly ModuleRoute[];
  navigation: readonly NavigationItem[];
  commands: readonly CommandDefinition[];
  widgets: readonly DashboardWidgetDefinition[];
  recordTypes: readonly string[];
}
```

- [ ] **Step 3: Implement deterministic aggregation**

Create `src/app/moduleRegistry.ts`:

```ts
import type { QiLifeModule, QiLifeModuleRegistry } from "./moduleTypes";

function assertUnique(values: readonly string[], label: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) throw new Error(`Duplicate ${label} "${value}".`);
    seen.add(value);
  }
}

export function createModuleRegistry(
  modules: readonly QiLifeModule[],
): QiLifeModuleRegistry {
  assertUnique(modules.map((module) => module.key), "QiLife module key");
  const routes = modules.flatMap((module) => module.routes);
  assertUnique(routes.map((route) => route.id), "QiLife module route id");

  return Object.freeze({
    modules: Object.freeze([...modules]),
    routes: Object.freeze(routes),
    navigation: Object.freeze(modules.flatMap((module) => module.navigation ?? [])),
    commands: Object.freeze(modules.flatMap((module) => module.commands ?? [])),
    widgets: Object.freeze(modules.flatMap((module) => module.widgets ?? [])),
    recordTypes: Object.freeze(modules.flatMap((module) => module.recordTypes ?? [])),
  });
}

export const moduleRegistry = createModuleRegistry([]);
```

- [ ] **Step 4: Register module routes before the catch-all**

Update `AppRouter`:

```tsx
export function AppRouter() {
  return (
    <Routes>
      {moduleRegistry.routes.map(({ id, path, Component }) => (
        <Route key={id} path={path} element={<Component />} />
      ))}
      <Route path="*" element={<CompatibilityShellRoute />} />
    </Routes>
  );
}
```

Extend `AppRouter.test.tsx` with a test registry injected through an optional prop:

```tsx
it("renders a module route before the compatibility catch-all", () => {
  const registry = createModuleRegistry([{
    key: "journal",
    name: "Journal",
    routes: [{ id: "journal-index", path: "/journal", Component: () => <p>Journal route</p> }],
  }]);
  render(
    <MemoryRouter initialEntries={["/journal"]}>
      <AppRouter registry={registry} />
    </MemoryRouter>,
  );
  expect(screen.getByText("Journal route")).toBeInTheDocument();
  expect(screen.queryByText("Compatibility QiLife shell")).not.toBeInTheDocument();
});
```

Make `AppRouter` accept `registry: QiLifeModuleRegistry = moduleRegistry`.

- [ ] **Step 5: Verify module aggregation and route precedence**

Run:

```powershell
npm run test:ci -- src/app/moduleRegistry.test.ts src/app/AppRouter.test.tsx
npm run build
```

Expected: all registry/router tests PASS; build PASS.

- [ ] **Step 6: Commit checkpoint**

Run:

```powershell
git add src/app/moduleTypes.ts src/app/moduleRegistry.ts src/app/moduleRegistry.test.ts src/app/AppRouter.tsx src/app/AppRouter.test.tsx
git commit -m "feat: add typed QiLife module registry"
```

---

## Phase 3 / Commit Checkpoint: Journal Data Mapping and Repository

### Task 4: Define exact Journal mapping and immutable raw capture

**Files:**

- Create: `src/modules/journal/types.ts`
- Create: `src/modules/journal/services/journalRepository.ts`
- Test: `src/modules/journal/services/journalRepository.test.ts`

**Interfaces:**

- Produces `JournalEntry`, `JournalDraft`, `JournalRecordStore`, and `JournalRepository`.
- Produces `mapRecordToJournalEntry(record)`.
- Produces `createJournalRepository(store)`.

- [ ] **Step 1: Write failing mapping tests**

Create tests that assert:

```ts
it("maps a shared Journal record without using due_date", () => {
  const entry = mapRecordToJournalEntry(record({
    due_date: null,
    data: {
      entry_date: "2026-07-24",
      body_markdown: "# Current",
      raw_capture: "# Original",
      tags: ["life"],
      pinned: true,
    },
  }));
  expect(entry.entryDate).toBe("2026-07-24");
  expect(entry.bodyMarkdown).toBe("# Current");
  expect(entry.rawCapture).toBe("# Original");
});

it("reads legacy body without fabricating raw capture", () => {
  const entry = mapRecordToJournalEntry(record({
    data: { entry_date: "2026-07-23", body: "legacy", tags: [] },
  }));
  expect(entry.bodyMarkdown).toBe("legacy");
  expect(entry.rawCapture).toBeUndefined();
});

it("rejects a non-journal record", () => {
  expect(() => mapRecordToJournalEntry(record({ entity_key: "task" }))).toThrow(
    "Record is not a Journal entry.",
  );
});
```

Run:

```powershell
npm run test:ci -- src/modules/journal/services/journalRepository.test.ts
```

Expected: FAIL because the repository does not exist.

- [ ] **Step 2: Define the domain and persistence interfaces**

Create `src/modules/journal/types.ts`:

```ts
import type {
  QiCreateRecordInput,
  QiRecord,
  QiUpdateRecordInput,
} from "../../features/qilife/types";

export interface JournalEntry {
  id: string;
  title: string;
  entryDate: string;
  bodyMarkdown: string;
  rawCapture?: string | null;
  tags: string[];
  pinned: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalDraft {
  title: string;
  entryDate: string;
  bodyMarkdown: string;
  tags: string[];
  pinned: boolean;
}

export interface JournalRecordStore {
  listRecords(entityKey: string): Promise<QiRecord[]>;
  createRecord(input: QiCreateRecordInput): Promise<QiRecord>;
  updateRecord(id: string, patch: QiUpdateRecordInput): Promise<QiRecord>;
}

export interface JournalRepository {
  list(): Promise<JournalEntry[]>;
  get(id: string): Promise<JournalEntry | null>;
  create(draft: JournalDraft): Promise<JournalEntry>;
  update(id: string, draft: JournalDraft): Promise<JournalEntry>;
}
```

- [ ] **Step 3: Implement mapping and owner-scoped repository behavior**

Implement:

```ts
import {
  createRecord,
  listRecords,
  updateRecord,
} from "../../../features/qilife/services/qilifeStore";

const JOURNAL_ENTITY_KEY = "journal_entry";

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function mapRecordToJournalEntry(record: QiRecord): JournalEntry {
  if (record.entity_key !== JOURNAL_ENTITY_KEY) {
    throw new Error("Record is not a Journal entry.");
  }
  const hasRawCapture = Object.prototype.hasOwnProperty.call(record.data, "raw_capture");
  return {
    id: record.id,
    title: record.title,
    entryDate: typeof record.data.entry_date === "string" ? record.data.entry_date : "",
    bodyMarkdown:
      typeof record.data.body_markdown === "string"
        ? record.data.body_markdown
        : typeof record.data.body === "string"
          ? record.data.body
          : "",
    ...(hasRawCapture
      ? { rawCapture:
          typeof record.data.raw_capture === "string"
            ? record.data.raw_capture
            : null }
      : {}),
    tags: strings(record.data.tags),
    pinned: record.data.pinned === true,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}
```

Repository rules:

```ts
export function createJournalRepository(store: JournalRecordStore): JournalRepository {
  async function journalRecords() {
    return store.listRecords(JOURNAL_ENTITY_KEY);
  }

  return {
    async list() {
      return (await journalRecords()).map(mapRecordToJournalEntry);
    },
    async get(id) {
      const record = (await journalRecords()).find((item) => item.id === id);
      return record ? mapRecordToJournalEntry(record) : null;
    },
    async create(draft) {
      return mapRecordToJournalEntry(await store.createRecord({
        entity_key: JOURNAL_ENTITY_KEY,
        title: draft.title,
        status: null,
        priority: null,
        due_date: null,
        data: {
          entry_date: draft.entryDate,
          body_markdown: draft.bodyMarkdown,
          raw_capture: draft.bodyMarkdown,
          tags: draft.tags,
          pinned: draft.pinned,
        },
      }));
    },
    async update(id, draft) {
      const records = await journalRecords();
      const existing = records.find((item) => item.id === id);
      if (!existing) throw new Error("Journal entry is unavailable.");
      return mapRecordToJournalEntry(await store.updateRecord(id, {
        title: draft.title,
        status: existing.status ?? null,
        priority: existing.priority ?? null,
        due_date: null,
        data: {
          ...existing.data,
          entry_date: draft.entryDate,
          body_markdown: draft.bodyMarkdown,
          tags: draft.tags,
          pinned: draft.pinned,
        },
      }));
    },
  };
}

export const journalRepository = createJournalRepository({
  listRecords,
  createRecord,
  updateRecord,
});
```

Use the existing owner-scoped `listRecords("journal_entry")` endpoint for direct lookup. Do not invent `GET /v1/life/records/:id` unless the backend contract is independently verified.

- [ ] **Step 4: Add create/update behavior tests**

Tests must prove:

- creation sets `raw_capture` equal to the first body;
- creation sends `due_date: null`;
- later edits preserve existing `raw_capture`;
- later edits do not add `raw_capture` to legacy records where it was absent;
- unrelated JSON properties survive updates;
- missing IDs reject with `Journal entry is unavailable.`;

Use an in-memory `JournalRecordStore` fake that stores real `QiRecord` objects rather than asserting mock call counts alone.

- [ ] **Step 5: Verify data mapping**

Run:

```powershell
npm run test:ci -- src/modules/journal/services/journalRepository.test.ts
npm run build
```

Expected: repository tests PASS; build PASS.

### Task 5: Add pure Journal search and Markdown export

**Files:**

- Create: `src/modules/journal/services/journalSearch.ts`
- Create: `src/modules/journal/services/markdownExport.ts`
- Test: `src/modules/journal/services/journalSearch.test.ts`
- Test: `src/modules/journal/services/markdownExport.test.ts`

**Interfaces:**

- Produces `filterJournalEntries(entries, filters)`.
- Produces `buildJournalMarkdown(entry)` and `journalExportFilename(entry)`.

- [ ] **Step 1: Write failing search tests**

Test title/body/tag matching, case-insensitivity, exact tag filtering, date filtering, and pinned-first/date-descending ordering.

- [ ] **Step 2: Implement pure search**

Use:

```ts
export interface JournalFilters {
  query: string;
  tag: string | null;
  entryDate: string | null;
}

export function filterJournalEntries(
  entries: readonly JournalEntry[],
  filters: JournalFilters,
): JournalEntry[] {
  const query = filters.query.trim().toLowerCase();
  return entries
    .filter((entry) => !filters.tag || entry.tags.includes(filters.tag))
    .filter((entry) => !filters.entryDate || entry.entryDate === filters.entryDate)
    .filter((entry) => {
      if (!query) return true;
      return [
        entry.title,
        entry.bodyMarkdown,
        entry.entryDate,
        ...entry.tags,
      ].some((value) => value.toLowerCase().includes(query));
    })
    .sort((left, right) =>
      Number(right.pinned) - Number(left.pinned)
      || right.entryDate.localeCompare(left.entryDate)
      || right.title.localeCompare(left.title),
    );
}
```

- [ ] **Step 3: Write failing export tests**

Assert sanitized filename and exact Markdown body after stable front matter.

- [ ] **Step 4: Implement deterministic export content**

`buildJournalMarkdown` must quote front-matter strings safely, serialize tags as JSON-compatible YAML flow syntax, include `pinned: true` only when pinned, include `qilife_id`, and append the unmodified `bodyMarkdown` after one blank line.

- [ ] **Step 5: Verify services and commit checkpoint**

Run:

```powershell
npm run test:ci -- src/modules/journal/services
npm run build
git add src/modules/journal
git commit -m "feat: map Journal through shared QiLife records"
```

Expected: all Journal service tests PASS; build PASS; checkpoint contains no UI or routing work.

---

## Phase 4 / Commit Checkpoint: Journal Routes and UI

### Task 6: Register Journal routes declaratively

**Files:**

- Create: `src/modules/journal/manifest.ts`
- Create: `src/modules/journal/routes.tsx`
- Modify: `src/app/moduleRegistry.ts`
- Test: `src/modules/journal/manifest.test.ts`
- Test: `src/modules/journal/routes.test.tsx`

**Interfaces:**

- Produces `journalModule: QiLifeModule`.
- Produces route components `JournalIndexRoute`, `JournalNewRoute`, and `JournalEntryRoute`.

- [ ] **Step 1: Write a failing manifest test**

Assert exact paths and capabilities:

```ts
expect(journalModule.routes.map((route) => route.path)).toEqual([
  "/journal",
  "/journal/new",
  "/journal/:id",
]);
expect(journalModule.recordTypes).toEqual(["journal_entry"]);
expect(journalModule.navigation?.[0].to).toBe("/journal");
expect(journalModule.commands?.[0].to).toBe("/journal/new");
```

Expected initial result: FAIL because the manifest does not exist.

- [ ] **Step 2: Add route components and declarative manifest**

The manifest contains component references and metadata only:

```ts
export const journalModule: QiLifeModule = {
  key: "journal",
  name: "Journal",
  routes: [
    { id: "journal-index", path: "/journal", Component: JournalIndexRoute },
    { id: "journal-new", path: "/journal/new", Component: JournalNewRoute },
    { id: "journal-entry", path: "/journal/:id", Component: JournalEntryRoute },
  ],
  navigation: [{ id: "journal-nav", label: "Journal", to: "/journal", icon: "✎" }],
  commands: [{
    id: "journal-new",
    label: "Quick journal",
    to: "/journal/new",
    keywords: ["journal", "write", "reflection"],
  }],
  widgets: [{
    id: "journal-widget",
    label: "Journal",
    to: "/journal",
    Component: JournalWidget,
  }],
  recordTypes: ["journal_entry"],
};
```

Register with:

```ts
export const moduleRegistry = createModuleRegistry([journalModule]);
```

- [ ] **Step 3: Write route precedence and URL-parameter tests**

Use `MemoryRouter` initial entries to prove:

- `/journal` renders index;
- `/journal/new` renders new editor;
- `/journal/entry-123` passes only `entry-123` from `useParams`;
- the compatibility shell never renders for these paths;
- Back/Forward changes the rendered Journal view.

- [ ] **Step 4: Verify registration**

Run:

```powershell
npm run test:ci -- src/modules/journal/manifest.test.ts src/modules/journal/routes.test.tsx src/app/AppRouter.test.tsx
```

Expected: all tests PASS.

### Task 7: Build list, filters, calendar, and explicit error states

**Files:**

- Create: `src/modules/journal/components/JournalList.tsx`
- Create: `src/modules/journal/components/JournalFilters.tsx`
- Create: `src/modules/journal/components/JournalCalendar.tsx`
- Create: `src/modules/journal/components/JournalNotFound.tsx`
- Create: `src/modules/journal/hooks/useJournalEntries.ts`
- Modify: `src/modules/journal/routes.tsx`
- Test: `src/modules/journal/components/JournalList.test.tsx`
- Test: `src/modules/journal/routes.test.tsx`

**Interfaces:**

- `JournalList` consumes entries and renders `Link to={"/journal/" + id}`.
- `JournalFilters` consumes `JournalFilters` values and emits complete replacements.
- `JournalCalendar` emits one `YYYY-MM-DD` selection or null.
- `useJournalEntries(repository)` exposes `{ entries, loading, error, reload }`.

- [ ] **Step 1: Write failing user-facing tests**

Tests prove:

- links use `/journal/:id`;
- query/tag/date filters change the visible list;
- empty lists render `No journal entries yet.`;
- repository failures render a Journal error;
- `/journal/:id` missing IDs render `Journal entry unavailable` without dashboard redirection.

- [ ] **Step 2: Implement minimal components and hook**

Keep the calendar to a date input/list of available dates; do not build a month-grid calendar.

- [ ] **Step 3: Verify list and error behavior**

Run:

```powershell
npm run test:ci -- src/modules/journal/components/JournalList.test.tsx src/modules/journal/routes.test.tsx
```

Expected: all tests PASS.

### Task 8: Build the editor and initial create redirect

**Files:**

- Create: `src/modules/journal/components/JournalEditor.tsx`
- Create: `src/modules/journal/hooks/useJournalEntry.ts`
- Modify: `src/modules/journal/routes.tsx`
- Modify: `src/features/qilife/data/entityRegistry.ts`
- Modify: `src/features/qilife/styles/qilife.css`
- Test: `src/modules/journal/components/JournalEditor.test.tsx`
- Test: `src/modules/journal/routes.test.tsx`

**Interfaces:**

- `JournalEditor` consumes a `JournalDraft`, save status, `onChange`, `onCreate`, `onRetry`, and `onExport`.
- The create route uses `navigate("/journal/" + created.id, { replace: true })` only after confirmed creation.
- The entry route obtains ID exclusively from `useParams`.

- [ ] **Step 1: Write failing editor tests**

Tests prove:

- title, date, tags, pin, and raw Markdown are editable;
- the initial save sends the exact body;
- successful creation replaces `/journal/new` with `/journal/:id`;
- failed creation remains on `/journal/new`;
- export uses exact current Markdown;
- entity registry uses `body_markdown`, `entry_date`, `tags`, and `pinned`, and does not use mood or `due_date`.

- [ ] **Step 2: Implement the minimal editor**

Use controlled inputs. Parse tags by commas into trimmed, non-empty strings. The editor must not render or transform Markdown.

- [ ] **Step 3: Align the shared entity definition**

Replace the Journal `body` field with `body_markdown`, keep `entry_date` and tags, remove mood from this phase, and add a checkbox `pinned`. Do not add `dueDateField`.

- [ ] **Step 4: Add minimal styling**

Add only selectors used by the Journal layout, editor, filters, status indicator, and error state. Reuse existing color and spacing variables.

- [ ] **Step 5: Verify Journal UI and commit checkpoint**

Run:

```powershell
npm run test:ci -- src/modules/journal src/app
npm run build
git add src/modules/journal src/app/moduleRegistry.ts src/features/qilife/data/entityRegistry.ts src/features/qilife/styles/qilife.css
git commit -m "feat: add URL-first Journal routes and editor"
```

Expected: Journal and application tests PASS; build PASS.

---

## Phase 5 / Commit Checkpoint: Commands and Widgets Integration

### Task 9: Add minimal registry-driven Journal entry points

**Files:**

- Modify: `src/features/qilife/components/SidebarNav.tsx`
- Modify: `src/features/qilife/components/QiLifeShell.tsx`
- Modify: `src/features/qilife/components/HomeDashboard.tsx`
- Modify: `src/features/qilife/components/Topbar.tsx`
- Create: `src/modules/journal/widgets/JournalWidget.tsx`
- Test: `src/features/qilife/components/SidebarNav.test.tsx`
- Test: `src/features/qilife/components/HomeDashboard.test.tsx`
- Test: `src/features/qilife/components/QiLifeShell.test.tsx`

**Interfaces:**

- `SidebarNav` receives registered URL-first navigation items and renders `NavLink`.
- `HomeDashboard` receives registered widgets and renders `JournalWidget`.
- Ctrl/Cmd+K continues to set `captureOpen` exactly as before.
- A visible `Quick journal` action uses `useNavigate()` to `/journal/new`.

- [ ] **Step 1: Write failing navigation/widget tests**

Tests prove:

- registered Journal navigation links to `/journal`;
- widget links to `/journal` and `/journal/new`;
- quick-journal action navigates to `/journal/new`;
- Ctrl/Cmd+K still opens the existing Quick Capture modal;
- no generalized searchable command palette is introduced.

- [ ] **Step 2: Implement the smallest capability rendering**

Pass `moduleRegistry.navigation`, `moduleRegistry.widgets`, and the single Journal command through existing component props. Render `widget.Component` when present and pass its declared `to`; otherwise render the existing generic dashboard action treatment. Do not create command categories, fuzzy search, keyboard remapping, history, or remote actions.

- [ ] **Step 3: Evaluate AssistantPage integration without expanding its contract**

Read the existing result callback:

- If `AssistantPage` already receives a `QiRecord` and delegates navigation through `onOpenEntity(entityKey, record)`, add one narrow branch at the shell boundary: `journal_entry` uses `navigate("/journal/" + record.id)`; all other records keep the existing behavior.
- If this requires changing result types, search indexing, assistant state, or API behavior, do not modify `AssistantPage.tsx`. Add a deferred integration note to `docs/architecture/qilife_journal_module.md`.

- [ ] **Step 4: Verify entry points and commit checkpoint**

Run:

```powershell
npm run test:ci -- src/features/qilife/components src/modules/journal
npm run build
git add src/features/qilife/components/SidebarNav.tsx src/features/qilife/components/SidebarNav.test.tsx src/features/qilife/components/QiLifeShell.tsx src/features/qilife/components/QiLifeShell.test.tsx src/features/qilife/components/HomeDashboard.tsx src/features/qilife/components/HomeDashboard.test.tsx src/features/qilife/components/Topbar.tsx src/features/qilife/components/AssistantPage.tsx src/modules/journal/widgets
git commit -m "feat: integrate Journal navigation and quick actions"
```

Expected: all integration tests PASS; Ctrl/Cmd+K regression test PASS; build PASS.

---

## Phase 6 / Commit Checkpoint: Authentication and Navigation Protection

### Task 10: Preserve safe same-origin authentication return destinations

**Files:**

- Create: `src/features/qilife/auth/authReturnPath.ts`
- Modify: `src/features/qilife/auth/AuthProvider.tsx`
- Test: `src/features/qilife/auth/authReturnPath.test.ts`
- Test: `src/features/qilife/auth/AuthProvider.test.tsx`

**Interfaces:**

- Produces `currentInternalDestination(location)`.
- Produces `sameOriginAuthRedirect(origin, internalDestination)`.
- Auth methods derive the destination from the current browser location, not an untrusted caller-supplied external URL.

- [ ] **Step 1: Write failing return-path security tests**

Test:

```ts
expect(currentInternalDestination({
  pathname: "/journal/abc",
  search: "?view=raw&code=supabase-code",
  hash: "#section",
})).toBe("/journal/abc?view=raw&code=supabase-code#section");

expect(sameOriginAuthRedirect(
  "https://life.qially.com",
  "https://attacker.example/steal",
)).toBe("https://life.qially.com/");

expect(sameOriginAuthRedirect(
  "https://life.qially.com",
  "/journal/abc?view=raw#section",
)).toBe("https://life.qially.com/journal/abc?view=raw#section");
```

Also test protocol-relative external URLs (`//attacker.example`), malformed input, and root-relative internal paths.

- [ ] **Step 2: Implement strict same-origin normalization**

Implement:

```ts
export interface InternalLocation {
  pathname: string;
  search: string;
  hash: string;
}

export function currentInternalDestination(location: InternalLocation): string {
  const pathname = location.pathname.startsWith("/") ? location.pathname : "/";
  return `${pathname}${location.search}${location.hash}`;
}

export function sameOriginAuthRedirect(origin: string, destination: string): string {
  const base = new URL(origin);
  try {
    const candidate = new URL(destination, base);
    if (candidate.origin !== base.origin) return new URL("/", base).toString();
    return new URL(
      `${candidate.pathname}${candidate.search}${candidate.hash}`,
      base,
    ).toString();
  } catch {
    return new URL("/", base).toString();
  }
}
```

Do not add a generic `returnTo` query consumer. Use the current browser pathname, search, and hash at the moment sign-in starts.

- [ ] **Step 3: Update AuthProvider without touching callback parameters**

For both magic link and Google:

```ts
const destination = currentInternalDestination(window.location);
const redirectTo = sameOriginAuthRedirect(window.location.origin, destination);
```

Pass `redirectTo` to Supabase. Do not remove `code`, `access_token`, `refresh_token`, `error`, or other callback parameters from search/hash. Let Supabase session initialization process them.

- [ ] **Step 4: Verify auth redirects**

Run:

```powershell
npm run test:ci -- src/features/qilife/auth
```

Expected: safe-return tests PASS; AuthProvider passes a same-origin URL containing the complete internal destination.

### Task 11: Add serialized auto-save and router navigation protection

**Files:**

- Create: `src/modules/journal/hooks/useSerializedJournalSave.ts`
- Modify: `src/modules/journal/hooks/useJournalEntry.ts`
- Modify: `src/modules/journal/components/JournalEditor.tsx`
- Modify: `src/modules/journal/routes.tsx`
- Test: `src/modules/journal/hooks/useSerializedJournalSave.test.tsx`
- Test: `src/modules/journal/routes.test.tsx`

**Interfaces:**

- Produces save status `"clean" | "dirty" | "saving" | "failed"`.
- Produces `queue(draft)`, `retry()`, and `hasUnsafeNavigation`.
- Route blocker activates only for pending or failed persistence.

- [ ] **Step 1: Write failing fake-timer save tests**

Tests prove:

- edits wait for the configured debounce;
- only one write runs at a time;
- edits during a write become exactly one next write with the latest snapshot;
- status becomes saved/clean only after confirmation;
- rejection retains the current draft and sets failed;
- retry persists the failed latest snapshot;
- stale responses cannot mark newer changes clean.

- [ ] **Step 2: Implement the serialized save hook**

Keep queue state in refs and expose React state only for UI status. Use one debounce timer and one in-flight promise. Do not persist on every keystroke and do not issue concurrent updates.

- [ ] **Step 3: Write failing blocker tests**

Using a data router or the React Router 7 blocker test harness, prove:

- clean navigation proceeds;
- pending/failed navigation shows a confirmation;
- cancel keeps the current URL and draft;
- confirm proceeds;
- retry can resolve the failure before navigation;
- no test assumes `beforeunload` guarantees a network save.

- [ ] **Step 4: Implement router blocker and best-effort flush**

Use React Router’s public blocker API from the pinned version. A best-effort flush may run when confirming navigation, but confirmation remains the protection and the UI must not label unconfirmed content saved.

- [ ] **Step 5: Verify save safety and commit checkpoint**

Run:

```powershell
npm run test:ci -- src/modules/journal/hooks src/modules/journal/routes.test.tsx src/features/qilife/auth
npm run build
git add src/features/qilife/auth src/modules/journal
git commit -m "feat: protect Journal auth returns and pending saves"
```

Expected: auth security, serialized save, blocker, Journal route, and build checks PASS.

---

## Phase 7 / Commit Checkpoint: Documentation and Final Verification

### Task 12: Update architecture and CI documentation

**Files:**

- Modify: `docs/ARCHITECTURE.md`
- Create: `docs/architecture/qilife_journal_module.md`
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md` only if it currently documents verification commands
- Test: existing full suite

**Interfaces:**

- CI runs `npm run test:ci` before `npm run build`.
- Documentation records implemented behavior rather than planned behavior.

- [ ] **Step 1: Update CI**

Insert after `npm ci`:

```yaml
- name: Test QiLife
  run: npm run test:ci
```

Keep the existing production build and `dist/index.html` verification unchanged.

- [ ] **Step 2: Document the module foundation**

Update `docs/ARCHITECTURE.md` with:

- typed module manifest responsibilities;
- central capability aggregation;
- module-route-before-catch-all ordering;
- temporary compatibility route;
- URL-first requirement for future modules;
- Cloudflare SPA fallback evidence.

- [ ] **Step 3: Document Journal boundaries**

Create `docs/architecture/qilife_journal_module.md` covering:

- exact Journal-to-QiRecord field mapping;
- `due_date: null`;
- new and legacy `raw_capture` behavior;
- shared repository path;
- no schema migration;
- `data.pinned` rationale;
- debounced serialized saves and navigation blocker;
- safe same-origin auth redirects;
- current localStorage fallback;
- future shared local-first flow;
- Assistant integration completed narrowly or explicitly deferred;
- active files intentionally left in `src/features/qilife/`.

- [ ] **Step 4: Run the complete verification suite**

Run:

```powershell
npm run test:ci
npm run build
npm run check
git diff --check
rg -n "legacy implementation|copied reference|prototype application" src
rg -n "createClient\\(" src
rg -n "journal_entries|journal_tags|journal_people|journal_attachments|journal_timeline|Dexie" src supabase
```

Expected:

- all tests PASS;
- production build PASS and `dist/index.html` exists;
- `npm run check` PASS;
- no whitespace errors;
- legacy import search returns no matches;
- exactly one `createClient(` match at `src/lib/supabaseClient.ts`;
- Journal silo search returns no matches.

- [ ] **Step 5: Manually verify route behavior in the built app**

Start:

```powershell
npm run dev
```

Verify:

- `/journal`, `/journal/new`, and a real `/journal/:id` render directly;
- refresh preserves each Journal route;
- Back/Forward traverse Journal views correctly;
- existing Home/workspace navigation still works;
- Ctrl/Cmd+K opens Quick Capture;
- Quick journal uses `/journal/new`;
- failed/pending saves show navigation protection;
- missing IDs remain on the Journal error screen;
- authentication redirect destinations remain same-origin.

Record the observed results in the final handoff; do not claim manual behavior that was not exercised.

- [ ] **Step 6: Review the diff for scope**

Run:

```powershell
git status --short
git diff --stat
git diff --name-only
```

Expected: only the files named by this plan plus the already-untracked user-owned `codex.md`; no legacy/reference edits and no Supabase migration.

- [ ] **Step 7: Commit checkpoint**

Run:

```powershell
git add .github/workflows/ci.yml docs/ARCHITECTURE.md docs/architecture/qilife_journal_module.md README.md
git commit -m "docs: document QiLife Journal module architecture"
```

If `README.md` did not require a change, omit it from `git add`.

---

## Final Acceptance Checklist

- [ ] Typed central module registry exists and rejects duplicate keys/routes.
- [ ] Declarative Journal manifest registers routes, navigation, one command, one widget, and `journal_entry`.
- [ ] Module routes render before the temporary compatibility catch-all.
- [ ] `/journal`, `/journal/new`, and `/journal/:id` support direct navigation, refresh, Back, and Forward.
- [ ] URL parameters are the only selected-entry source of truth.
- [ ] Existing state-driven QiLife screens still render through the compatibility route.
- [ ] Future-module URL-first rule and temporary route are documented.
- [ ] Journal create, view, edit, search, tag/date filter, pin, and Markdown export work.
- [ ] Journal date exists only in `data.entry_date`; `due_date` remains null.
- [ ] First successful creation sets `raw_capture` exactly once.
- [ ] Ordinary edits never alter `raw_capture`.
- [ ] Legacy `data.body` compatibility never fabricates `raw_capture`.
- [ ] Unrelated shared JSON properties survive Journal updates.
- [ ] Save queue is debounced and serialized, and saved state requires persistence confirmation.
- [ ] Pending/failed saves activate visible router navigation protection.
- [ ] Missing, inaccessible, and wrong-type entries render Journal-level states.
- [ ] Same-origin auth redirects preserve pathname, search, and hash.
- [ ] External and protocol-relative auth return destinations are rejected.
- [ ] Supabase callback parameters are not prematurely removed or rewritten.
- [ ] Ctrl/Cmd+K still opens existing Quick Capture.
- [ ] Journal command/widget/navigation use router-native transitions.
- [ ] Assistant integration is narrow or explicitly deferred.
- [ ] No Journal-specific table, Supabase client, local database, queue, or sync engine exists.
- [ ] No active imports reference legacy/reference/prototype paths.
- [ ] All automated tests, production build, CI check, and diff checks pass.
- [ ] Architecture documentation matches the implementation.
