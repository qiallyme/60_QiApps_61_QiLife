# QiLife Journal Module and Routing Foundation Design

**Date:** 2026-07-24

**Status:** Approved design pending written-spec review
**Scope:** Incremental module foundation and Journal implementation in the active QiLife application

## 1. Objective

Evolve the active QiLife application toward a modular Life OS architecture by adding a typed module contract, a central module registry, and Journal as the first URL-first module.

This is an incremental refactor. Existing state-driven QiLife screens remain functional behind a temporary compatibility route. Journal records remain part of the shared `qilife.records` model and use the existing persistence boundary. The implementation must not introduce a Journal-specific table, Supabase client, local database, mutation queue, or sync engine.

## 2. Repository Findings

The active application is the repository root:

- `src/` contains the production React application.
- `public/` contains production static assets and Cloudflare routing configuration.
- `supabase/` contains the active shared-record migrations.
- Historical implementation and reference trees were not imported by active source code and have since been removed.

The current application has:

- React 19, TypeScript, and Vite;
- no routing library;
- state-driven shell navigation in `QiLifeShell`;
- entity, workspace, and navigation registries;
- one shared `qilife.records` table with ownership-based RLS;
- a shared `qilifeStore` that selects the authenticated Qi API or localStorage fallback;
- one centralized Supabase client;
- an existing `journal_entry` entity definition;
- no automated test runner;
- a passing production build before this work.

The shared record has no top-level occurrence-time field. `due_date` is the only top-level date field and is semantically reserved for obligations and deadlines. Existing occurrence dates are kept in entity-specific JSON data, including `data.occurred_at` for events and `data.entry_date` for Journal. Journal therefore keeps its date only in `data.entry_date`.

No active shared pin, favorite, starred, bookmark, or record-metadata convention exists. Journal may use `data.pinned` as shared record metadata without adding a storage silo.

Cloudflare already supports deep-link refreshes:

- Cloudflare SPA fallback is configured by root `wrangler.jsonc`.
- `wrangler.jsonc` uses `"not_found_handling": "single-page-application"`.

## 3. Routing Architecture

Add `react-router-dom` and wrap the application in `BrowserRouter` at the app boundary.

Each URL-first module declares its routes in its manifest. The central module registry aggregates those route definitions. Aggregated module routes are registered before the temporary compatibility catch-all so the existing state-based shell cannot swallow `/journal/*` or future module routes.

The route order is:

1. module routes aggregated from the central registry;
2. the explicitly temporary compatibility catch-all for existing QiLife screens.

Journal owns:

- `/journal`
- `/journal/new`
- `/journal/:id`

The URL is the sole source of truth for the active Journal view and selected Journal record. `/journal/:id` reads `id` directly from router parameters. The implementation must not mirror the selected ID in component state.

All route changes use router-native `Link`, `NavLink`, or `useNavigate`. Direct `window.location` changes are not used for application navigation.

Existing state-driven screens continue to work during this phase through a named compatibility route and the existing shell state. That route is documented as temporary. New modules must use URL-first routing, and no new state-only screens may be added.

Authentication redirects preserve the path and query string that initiated sign-in. Existing Supabase callback query or fragment data must remain available for session establishment. Router setup must not strip or replace authentication parameters before Supabase processes them.

## 4. Module Contract and Registry

Create a typed module contract by adapting existing QiLife definitions:

```ts
export interface QiLifeModule {
  key: string;
  name: string;
  routes: ModuleRoute[];
  navigation?: NavigationItem[];
  commands?: CommandDefinition[];
  widgets?: DashboardWidgetDefinition[];
  recordTypes?: string[];
}
```

The exact supporting interfaces use the existing navigation, entity, and shell conventions where compatible. They remain declarative and serializable except for route elements or component references required by React.

The central registry:

- stores registered module manifests;
- validates unique module keys and route identifiers;
- exposes flattened module routes in deterministic order;
- exposes navigation, commands, widgets, and supported record types;
- keeps the compatibility route outside module manifests;
- does not implement a dynamic plugin loader, dependency-injection container, or remote runtime.

The Journal manifest declares capabilities only. It must not contain persistence logic, instantiate repositories, or create stateful services.

## 5. Journal Record Mapping

Journal uses `QiRecord` with `entity_key: "journal_entry"`.

```ts
interface JournalRecordData {
  entry_date: string;
  body_markdown: string;
  raw_capture?: string | null;
  tags: string[];
  pinned?: boolean;
}

interface JournalEntry {
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
```

The shared record mapping is:

```ts
{
  entity_key: "journal_entry",
  title,
  status: null,
  priority: null,
  due_date: null,
  data: {
    entry_date,
    body_markdown,
    raw_capture,
    tags,
    pinned
  }
}
```

`due_date` remains null and is never used for Journal dates.

For a new entry:

- the first successful creation sets `raw_capture` once from the submitted Markdown body;
- the same body is stored as `body_markdown`;
- ordinary edits update `body_markdown` but never change `raw_capture`;
- title, tag, date, and pin changes never change `raw_capture`.

For legacy records:

- `data.body_markdown` is the preferred editable body;
- `data.body` is a compatibility read source when `body_markdown` is absent;
- an existing `data.raw_capture` is preserved exactly;
- normalization never fabricates `raw_capture` from `data.body`;
- when the historical original is unknown, `raw_capture` remains absent or null;
- the next successful edit may store `body_markdown`, but it must not overwrite unrelated data fields.

`data.pinned` is used because the active shared model has no existing pin/favorite convention. It remains ordinary metadata in the shared record rather than a Journal-specific storage feature.

No database migration is required because `qilife.records.data` is already JSONB.

## 6. Persistence Boundary

The dependency flow is:

```text
Journal UI
  -> journal hook or journalRepository
  -> qilifeStore/shared record service
  -> authenticated Qi API or existing local fallback
  -> qilife.records
```

`journalRepository`:

- maps `QiRecord` to and from `JournalEntry`;
- lists and retrieves only `journal_entry` records;
- creates records through the shared create operation;
- edits records through the shared update operation;
- preserves existing JSON data not owned by Journal;
- enforces immutable `raw_capture` behavior;
- exposes persistence through an interface that can later be backed by shared local-first infrastructure.

React components do not query Supabase directly. Journal does not create a second Supabase client, direct database path, Dexie store, local database, mutation queue, or sync coordinator.

The current localStorage fallback is reused through `qilifeStore`. A future shared local-first system remains outside this phase.

## 7. Journal UI and Routes

### `/journal`

The index renders:

- Journal title and new-entry action;
- searchable Journal list;
- tag and date filters;
- a simple date-oriented calendar filter;
- pinned entries using `data.pinned`;
- loading, error, and empty states.

Search matches normalized title, Markdown body, tags, and entry date. Filtering is deterministic and implemented as pure functions so it can be tested without rendering.

### `/journal/new`

The new-entry route renders a blank Markdown editor with:

- title;
- entry date;
- tags;
- pin control;
- raw Markdown body.

The initial creation is explicit. On the first confirmed successful creation, navigation replaces `/journal/new` with `/journal/:id`, preventing browser Back from reopening an already-created draft.

### `/journal/:id`

The entry route reads the ID from router parameters and renders the matching `journal_entry`.

The editor supports:

- title editing;
- entry-date editing;
- tag editing using the shared tag representation;
- pinning using `data.pinned`;
- raw Markdown editing;
- debounced auto-save after initial creation;
- Markdown-file export;
- visible dirty, saving, saved, and failed states.

The selected entry ID is never duplicated in component state.

## 8. Save Queue and Navigation Safety

Auto-save uses a debounced serialized queue:

1. editor changes mark the draft dirty;
2. the debounce schedules the latest snapshot;
3. only one persistence write runs at a time;
4. changes made during a write become the next queued snapshot;
5. the UI marks a snapshot saved only after the persistence layer confirms it;
6. an older response cannot mark newer content saved.

Pending or failed content remains available in editor state for the current session.

When navigation is attempted while a save is pending or failed:

- a router blocker presents a visible confirmation;
- leaving is not silently allowed under the assumption that an asynchronous unload save will finish;
- retry remains available after failure;
- a best-effort final flush may run, but it is not the primary data-loss protection.

Normal debounced persistence is the primary protection.

## 9. Commands, Navigation, and Widget Integration

The Journal manifest contributes:

- a navigation item linking to `/journal`;
- a quick-journal command linking to `/journal/new`;
- a dashboard widget that opens `/journal` or `/journal/new`;
- the `journal_entry` supported record type;
- the three declarative route definitions.

Search results that represent Journal entries navigate to `/journal/:id`. Command-menu and widget actions use router navigation.

The initial command surface may adapt the existing Ctrl/Cmd+K capture behavior into a small registry-driven command menu. Existing quick capture remains reachable and its behavior must not regress.

## 10. Error and Not-Found Behavior

Journal renders explicit module-level states for:

- list loading;
- empty list;
- list/search failure;
- missing entry;
- inaccessible entry;
- wrong record type;
- initial create failure;
- pending auto-save;
- failed auto-save with retry;
- unavailable browser export APIs.

A missing, inaccessible, or wrong-type entry does not redirect to Home or the dashboard.

Repository errors are converted to useful module-facing messages without exposing tokens, credentials, or backend internals.

## 11. Markdown Export

Export creates a `.md` file containing stable front matter followed by the exact `body_markdown`.

The front matter includes:

- title;
- entry date;
- tags;
- pinned state when true;
- QiLife record ID.

The filename is derived from the entry date and a sanitized title. Export does not mutate the record and does not use application navigation.

## 12. Test Foundation and Coverage

Add pinned versions of:

- Vitest;
- jsdom;
- React Testing Library and its required companion packages.

Commit `package-lock.json`. Add repository scripts for an interactive test command and a non-interactive CI test command. Update the existing CI workflow to run the non-interactive tests before the production build.

Tests cover:

- unique module registration;
- deterministic capability aggregation;
- module route ordering before the compatibility catch-all;
- `/journal`, `/journal/new`, and `/journal/:id` matching;
- URL-derived entry selection;
- browser Back/Forward behavior with a memory router;
- router-native navigation from Journal list, search, commands, and widgets;
- Journal-to-`QiRecord` mapping;
- `due_date` remaining null for Journal;
- immutable `raw_capture` for new records;
- legacy `data.body` compatibility without fabricating `raw_capture`;
- preservation of unrelated shared record data;
- create and edit behavior through an injected shared persistence boundary;
- exact Markdown preservation;
- search and tag/date filtering;
- debounced serialized auto-save;
- pending/failed navigation blocking;
- module-level missing/inaccessible entry states;
- Markdown export contents and filename;
- authentication redirect path and query preservation where testable;
- absence of active legacy/reference imports;
- absence of duplicate Supabase clients or Journal-specific databases.

Verification runs the commands defined in `package.json` and CI:

- TypeScript compilation through the production build;
- all automated tests;
- production Vite build;
- route rendering tests for existing and Journal routes;
- static checks for legacy imports and duplicate clients.

## 13. File Structure

The implementation moves only the files required for the module foundation and Journal:

```text
src/
  app/
    AppRouter.tsx
    moduleRegistry.ts
    moduleTypes.ts
  modules/
    journal/
      components/
        JournalCalendar.tsx
        JournalEditor.tsx
        JournalFilters.tsx
        JournalList.tsx
        JournalNotFound.tsx
      hooks/
        useJournalEntry.ts
        useJournalEntries.ts
      services/
        journalRepository.ts
        journalSearch.ts
        markdownExport.ts
      widgets/
        JournalWidget.tsx
      manifest.ts
      routes.tsx
      types.ts
```

Exact test filenames follow the repository's new Vitest convention and remain beside the relevant module or under a focused test directory.

Existing `src/features/qilife/` files remain in place unless a small targeted change is required to consume the module registry or router. No broad cosmetic move or unrelated module scaffolding is included.

## 14. Documentation

Update the established architecture documentation to cover:

- the `QiLifeModule` contract;
- central registry aggregation;
- URL-first module routing;
- the temporary compatibility route;
- the rule that future modules must not add state-only screens;
- Journal-to-QiRecord mapping;
- immutable raw-capture semantics;
- persistence and authentication boundaries;
- current local fallback limitations;
- future shared local-first synchronization;
- files intentionally left in their current locations.

## 15. Explicit Non-Goals

This phase does not add:

- Journal-specific database tables;
- Journal-specific tags, people, attachments, or timeline tables;
- a second Supabase client;
- a Journal local database or sync engine;
- a dynamic plugin runtime;
- advanced calendar behavior;
- mood analytics;
- streaks or gamification;
- AI summaries;
- elaborate templates;
- unrelated module migrations;
- a full conversion of existing QiLife screens to URL-first routing.

## 16. Completion Criteria

The work is complete when:

1. QiLife has a typed central module registry.
2. Module routes are registered before the documented temporary compatibility catch-all.
3. Journal is registered through a declarative manifest.
4. `/journal`, `/journal/new`, and `/journal/:id` support direct navigation, refresh, and browser history.
5. A user can create, view, edit, search, filter, pin, and export a Markdown Journal entry.
6. Journal entries persist through the shared QiLife record layer.
7. Journal never maps its date to `due_date`.
8. New-record `raw_capture` is set once and ordinary edits never overwrite it.
9. Legacy normalization never fabricates unknown raw capture.
10. Pending or failed saves receive visible navigation protection.
11. Missing or inaccessible entries render a Journal-level state.
12. Existing QiLife screens continue to build and render.
13. No Journal data silo, duplicate Supabase client, or Journal sync engine exists.
14. Automated tests and the production build pass.
15. Architecture documentation describes the implemented boundaries and remaining migration work.
