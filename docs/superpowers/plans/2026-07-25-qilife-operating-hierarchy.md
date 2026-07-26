# QiLife Operating Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace duplicated state workspaces with a URL-first operating hierarchy, shared record relationships, first-class Actions and Projects, and a light-first soft-surface interface.

**Architecture:** Actions and Projects register through the released `QiLifeModule` registry and use the existing `QiRecord` store. A shared relationship normalizer, resolver, and relation selector provide one relationship boundary for generic forms and module dashboards. Legacy screens remain behind the documented compatibility route while shared CSS tokens drive the shell and released modules.

**Tech Stack:** React 19, React Router 7.18.1, TypeScript, Vitest, React Testing Library, Vite, existing QiLife record service, Cloudflare Wrangler.

## Global Constraints

- Preserve Journal and People routes, data behavior, tests, and production functionality.
- Do not add databases, module-specific Supabase clients, queues, or sync engines.
- Preserve repository instructions and do not recreate removed reference applications, prototypes, or generated artifacts.
- Use test-first red-green cycles for behavior changes.
- Use router-native links and declarative module routes before the temporary compatibility catch-all.
- Do not perform a destructive relationship migration.
- Keep Ctrl/Cmd+K quick capture behavior.
- Default to the light soft-surface theme; do not implement dark mode in this pass.

---

### Task 1: Audit baseline and commit design documents

**Files:**
- Create: `docs/superpowers/specs/2026-07-25-qilife-operating-hierarchy-design.md`
- Create: `docs/superpowers/plans/2026-07-25-qilife-operating-hierarchy.md`

**Produces:** The canonical relationship contract, route ownership, migration rules, test matrix, and phased file map.

- [ ] Confirm `main` is clean and aligned with `origin/main`.
- [ ] Confirm the QiRecord service and JSON relationship fields do not require destructive migration.
- [ ] Run `git diff --check`.
- [ ] Commit only the two documentation files with `docs(qilife): plan operating hierarchy and soft surface pass`.

### Task 2: Navigation regrouping

**Files:**
- Modify: `src/app/moduleTypes.ts`
- Modify: `src/features/qilife/data/navRegistry.ts`
- Modify: `src/features/qilife/components/SidebarNav.tsx`
- Modify: `src/features/qilife/components/QiLifeShell.tsx`
- Modify: `src/app/createAppRoutes.tsx`
- Test: `src/features/qilife/components/SidebarNav.test.tsx`
- Test: `src/app/AppRouter.test.tsx`

**Produces:** Declarative grouped URL navigation and explicit compatibility destinations.

- [ ] Write failing tests asserting non-clickable Planner/Organize/Record/Review/System labels, router links, no clickable Planner workspace, and module routes before compatibility.
- [ ] Run the focused tests and confirm failures describe the old navigation.
- [ ] Add grouped navigation definitions and router-native rendering while preserving the command shortcut.
- [ ] Add URL-first Today and Inbox compatibility route adapters without creating new storage models.
- [ ] Run focused tests, `npm run build`, and `git diff --check`.
- [ ] Commit with `feat(qilife): restore operating hierarchy navigation`.

### Task 3: Shared relation selector

**Files:**
- Create: `src/features/qilife/relations/relationshipFields.ts`
- Create: `src/features/qilife/components/RelationSelector.tsx`
- Modify: `src/features/qilife/components/EntityFormModal.tsx`
- Modify: `src/features/qilife/utils/recordValues.ts`
- Test: `src/features/qilife/components/RelationSelector.test.tsx`
- Test: `src/features/qilife/components/EntityFormModal.test.tsx`

**Produces:** `RelationSelector` and lossless legacy value normalization.

- [ ] Write failing tests for title display with ID output, empty values, loading, errors, existing canonical IDs, and unresolved legacy values.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement `readRelationIds`, `writeCanonicalRelation`, and the selector using `listRecords(relationEntity)`.
- [ ] Route every generic `relation` field through the selector; missing `relationEntity` renders an explicit field error.
- [ ] Verify Task→Project/Person/Thread, Project→Owner, Event→Project/Person, and Decision→Project/Thread definitions.
- [ ] Run focused tests, the existing suite, build, and diff check.
- [ ] Commit with `feat(qilife): add shared relation controls`.

### Task 4: Shared relation resolver

**Files:**
- Create: `src/features/qilife/relations/relationResolver.ts`
- Create: `src/features/qilife/relations/relationRoutes.ts`
- Test: `src/features/qilife/relations/relationResolver.test.ts`
- Modify: `src/modules/people/services/peopleRepository.ts`
- Modify: `src/modules/people/services/peopleRepository.test.ts`

**Produces:** `getRelatedRecords`, `getActionsForProject`, `getPeopleForProject`, `getJournalForProject`, and `getRecordsForPerson`.

- [ ] Write failing pure resolver tests covering canonical and legacy singular/array values without false positives.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement resolver predicates over injected `listAllRecords`.
- [ ] Replace People module-local relationship filtering and `/tasks` route generation with shared resolver/route ownership.
- [ ] Run resolver, People, Journal repository, full tests, build, and diff check.
- [ ] Commit with `feat(qilife): centralize shared record relationships`.

### Task 5: Actions module

**Files:**
- Create: `src/modules/actions/types.ts`
- Create: `src/modules/actions/services/actionRepository.ts`
- Create: `src/modules/actions/services/actionFilters.ts`
- Create: `src/modules/actions/components/ActionForm.tsx`
- Create: `src/modules/actions/components/ActionList.tsx`
- Create: `src/modules/actions/components/ActionDetail.tsx`
- Create: `src/modules/actions/routes.tsx`
- Create: `src/modules/actions/manifest.ts`
- Modify: `src/app/moduleRegistry.ts`
- Test: corresponding `*.test.ts(x)` files and `src/modules/actions/manifest.test.ts`

**Produces:** `/actions`, `/actions/new`, `/actions/:id` over `entity_key: "task"`.

- [ ] Write failing repository mapping tests that preserve unknown data and write canonical relationship IDs.
- [ ] Implement the injected shared-store repository and pass mapping tests.
- [ ] Write failing filter tests for search, status, project, person, and due/overdue.
- [ ] Implement pure filters and pass tests.
- [ ] Write failing route tests for list, prefilled create, detail links, not-found, refresh-safe params, and Back/Forward behavior.
- [ ] Implement route components with shared controls and router-native links.
- [ ] Register the Actions manifest before compatibility routes.
- [ ] Run Actions, registry, router, full tests, build, and diff check.
- [ ] Commit with `feat(qilife): add URL-first Actions module`.

### Task 6: Projects module and dashboard

**Files:**
- Create: `src/modules/projects/types.ts`
- Create: `src/modules/projects/services/projectRepository.ts`
- Create: `src/modules/projects/components/ProjectForm.tsx`
- Create: `src/modules/projects/components/ProjectList.tsx`
- Create: `src/modules/projects/components/ProjectDashboard.tsx`
- Create: `src/modules/projects/components/ProjectRelatedRecords.tsx`
- Create: `src/modules/projects/routes.tsx`
- Create: `src/modules/projects/manifest.ts`
- Modify: `src/app/moduleRegistry.ts`
- Modify: `src/modules/journal/types.ts`
- Modify: `src/modules/journal/services/journalRepository.ts`
- Test: corresponding Project tests plus focused Journal repository regression tests

**Produces:** `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit`, dashboard metrics, related records, and prelinked quick creation.

- [ ] Write failing Project mapper/repository tests for identity fields, owner ID, brief, tags, and unknown-data preservation.
- [ ] Implement the shared-store repository and pass tests.
- [ ] Write failing dashboard tests for open/blocked/completed counts, next due, related records, reciprocal links, and not-found.
- [ ] Implement dashboard queries through the shared resolver.
- [ ] Write failing quick-create tests proving Action and Journal URLs carry the Project ID and persistence stores it.
- [ ] Extend Journal mapping additively with optional `projectId`, preserving raw capture and People links.
- [ ] Implement quick-create links and Project registration.
- [ ] Run Project, Action, Journal, People, registry, full tests, build, and diff check.
- [ ] Commit with `feat(qilife): add Project dashboards and linked work`.

### Task 7: Today projection and Home links

**Files:**
- Create: `src/features/qilife/components/TodayPage.tsx`
- Create: `src/features/qilife/services/todayProjection.ts`
- Modify: `src/features/qilife/components/HomeDashboard.tsx`
- Modify: `src/app/createAppRoutes.tsx`
- Test: `src/features/qilife/services/todayProjection.test.ts`
- Test: `src/features/qilife/components/TodayPage.test.tsx`

**Produces:** A read-only operational projection with owning-module links.

- [ ] Write failing projection tests for overdue, due today, waiting, recent changes, person follow-up, and blocked Projects.
- [ ] Implement deterministic pure projection functions.
- [ ] Write failing render tests for grouped attention sections and module links.
- [ ] Implement `/today` and restrained Home orientation links without vanity metrics.
- [ ] Run focused/full tests, build, and diff check.
- [ ] Commit with `feat(qilife): make Today an operational projection`.

### Task 8: Soft Surface tokens and shared components

**Files:**
- Modify: `src/features/qilife/styles/qilife.css`
- Modify: `src/features/qilife/styles/cadence.css`
- Modify: `src/features/qilife/styles/assistant.css`
- Modify: shared shell, topbar, form, table, card, modal, and drawer components only where classes are required
- Test: existing component tests plus any new semantic-state assertions

**Produces:** Light-first tokens and shared primitive presentation.

- [ ] Add a token contract test or static assertion that fails while legacy dark/neon variables remain.
- [ ] Define canvas, raised, interactive, overlay, border, shadow, focus, semantic color, radius, and motion variables.
- [ ] Replace shared one-off colors with tokens; remove misleading variable names such as purple `--qi-green`.
- [ ] Add visible hover/focus/active/disabled/success/warning/error states, 40-pixel minimum controls, responsive rules, and reduced motion.
- [ ] Inspect shell, Home, Today, forms, tables, cards, modals, and drawers at desktop and mobile widths.
- [ ] Run full tests, build, and diff check.
- [ ] Commit with `style(qilife): add light soft-surface design system`.

### Task 9: Journal and People visual integration

**Files:**
- Modify: Journal and People components only to replace inline presentation values with shared classes/tokens
- Modify: `src/features/qilife/styles/qilife.css`
- Test: existing Journal and People component/route tests

**Produces:** Released modules visually integrated without data or route changes.

- [ ] Capture existing Journal and People regression test results before styling changes.
- [ ] Replace inline dark colors and duplicated surface styles with shared classes.
- [ ] Verify Journal save/navigation states and People related-record behavior remain unchanged.
- [ ] Inspect Journal and People at desktop and mobile widths.
- [ ] Run Journal, People, full tests, build, and diff check.
- [ ] Commit with `style(qilife): integrate Journal and People soft surfaces`.

### Task 10: Release verification, PR, merge, and deployment

**Files:**
- Modify only release documentation if verification reveals an inaccurate statement.

**Produces:** Reviewed, merged, deployed production version.

- [ ] Run `npm run test:ci`, `npm run build`, and `git diff --check`.
- [ ] Verify no imports target legacy/reference paths and no module-specific data silo/client was added.
- [ ] Browser-smoke `/`, `/today`, `/actions`, `/actions/new`, `/projects`, `/projects/new`, one `/projects/:id`, `/people`, and `/journal`.
- [ ] Verify create/link flows, refresh, Back/Forward, mobile/desktop, console, and existing Ctrl/Cmd+K behavior.
- [ ] Push a feature branch and create a PR with architecture, relation contract, routes, tokens, verification, limitations, and manual QA.
- [ ] Wait for CI; fix only evidenced failures with a regression test.
- [ ] Merge after CI succeeds, update the production checkout, run `npm run build`, and deploy with `npx wrangler deploy`.
- [ ] Production-smoke all required URLs and report commit hashes, deployment version, results, and real limitations.

