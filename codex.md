You are working in:

`C:\QiLabs\60_QiApps\61_QiLife`

## Objective

Evolve the existing QiLife application into a modular Life OS architecture and implement Journal as the first properly registered module.

This is an incremental refactor of the active application, not a rewrite.

Journal entries must remain part of QiLife’s shared record model. Do not create an isolated journaling application or a parallel data universe.

## Start by inspecting the repository

Before changing code:

1. Inspect the active root application under:

   * `src/`
   * `public/`
   * `supabase/`
   * root configuration files

2. Review the existing architecture and contracts, especially:

   * `docs/ARCHITECTURE.md`
   * `docs/architecture/qilife_markdown_entity_contract.md`
   * existing entity, navigation, and workspace registries
   * `src/features/qilife/services/qilifeStore.ts`
   * `src/lib/qiApiClient.ts`
   * `src/lib/supabaseClient.ts`
   * existing Supabase migrations

3. Treat the following as legacy or reference material unless the active application explicitly imports from it:

   * `docs/legacy.qilife/`
   * `docs/reference/`
   * `docs/prototypes/`
   * `gemini-timelineapp/`

Do not edit legacy or reference copies as though they were the production application.

Report any ambiguity about which files are active before modifying them.

## Architecture decision

Move incrementally toward this conceptual structure:

```text
src/
├── app/
│   ├── AppShell.tsx
│   ├── routes.tsx
│   ├── moduleRegistry.ts
│   ├── CommandMenu.tsx
│   └── providers.tsx
├── core/
│   ├── api/
│   ├── auth/
│   ├── components/ui/
│   ├── db/
│   ├── hooks/
│   ├── records/
│   ├── services/
│   ├── store/
│   └── types/
├── modules/
│   ├── journal/
│   ├── capture/
│   ├── timeline/
│   ├── actions/
│   ├── people/
│   ├── threads/
│   └── knowledge/
├── styles/
├── App.tsx
└── main.tsx
```

This is a target architecture, not an instruction to move every existing file immediately.

Only move or refactor files required for the Journal module and module-registration foundation. Avoid broad cosmetic restructuring.

## Module contract

Create a typed module contract that allows modules to register their capabilities without hard-coding them throughout the shell.

The contract should support, where applicable:

* Module key and display name
* Routes
* Navigation items
* Global command-menu actions
* Dashboard widgets
* Supported record types
* Optional initialization or lifecycle hooks only when genuinely needed

A reasonable starting shape is:

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

Adapt this to existing QiLife types instead of duplicating compatible definitions.

Create a central module registry and make the shell derive module routes, navigation, commands, or widgets from it where practical.

Do not over-engineer a plugin runtime, dynamic package loader, dependency injection container, or remote module system.

## Journal module

Create:

```text
src/modules/journal/
├── components/
│   ├── JournalEditor.tsx
│   ├── JournalList.tsx
│   ├── JournalCalendar.tsx
│   └── JournalFilters.tsx
├── hooks/
├── services/
│   ├── journalRepository.ts
│   ├── journalSearch.ts
│   └── markdownExport.ts
├── store/
├── widgets/
├── manifest.ts
├── routes.tsx
└── types.ts
```

Adjust filenames when existing conventions provide a stronger fit.

The initial Journal module should support:

* Journal index/list route
* Individual journal-entry route
* New-entry route
* Raw Markdown editing
* Title
* Event or journal date
* Tags using the shared QiLife tagging model
* Favorite or pinned state only if it maps cleanly to the shared record model
* Search and basic filtering
* Auto-save with sensible debouncing
* Markdown-file export
* A quick-journal command or widget registered with the OS shell

Do not add streak gamification, mood analytics, AI summaries, elaborate templates, or advanced calendar behavior in this phase.

## Shared data model

Journal entries must use the existing QiLife record/QiBit model.

Do not create independent tables such as:

* `journal_entries`
* `journal_tags`
* `journal_people`
* `journal_attachments`
* `journal_timeline`

Use the existing shared record, link, tag, people, thread, timeline, and attachment systems.

Journal should be represented by an appropriate shared record type such as:

* `journal`
* `reflection`
* `observation`
* `decision`

Inspect the existing record schema and naming conventions before choosing exact identifiers.

Preserve these semantic distinctions:

* `raw_capture`: original input that should remain unmodified
* `body_markdown`: the current editable Markdown document
* derived summaries, interpretations, or reflections: separate fields or records, not replacements for raw capture

If the existing schema lacks a suitable Markdown body field, design the smallest compatible migration. Do not apply speculative schema changes.

## Repository boundary

Journal UI code must not directly scatter Supabase queries across React components.

Use this flow:

```text
Journal component
    → journal hook or repository
    → shared QiLife record/data service
    → centralized Qi API or approved backend client
    → database
```

Reuse `qiApiClient`, the existing store, and established API boundaries where possible.

Do not expose service-role credentials or introduce a second Supabase client.

## Local-first and sync boundary

Do not build a complete production sync engine in this phase unless a working shared local database and mutation queue already exist.

Instead:

1. Define a clean shared persistence interface that can later support local-first writes.
2. Keep Journal unaware of whether persistence uses Supabase, a Qi API, IndexedDB, or another backend.
3. If an existing offline system exists, integrate with it.
4. If it does not exist, document the required shared sync contract and leave implementation for a separate phase.

Do not create a Journal-specific Dexie database or Journal-specific sync engine.

The eventual shared flow should be:

```text
Editor
    → local persistence
    → shared mutation queue
    → OS sync coordinator
    → authenticated Qi API
    → Postgres/Supabase
```

## Migration strategy

Do not perform a large one-shot folder migration.

Use this order:

1. Establish shared module types and module registry.
2. Register existing shell capabilities without breaking current navigation.
3. Add the Journal module manifest and routes.
4. Add Journal repository and record mapping.
5. Implement the minimum Journal UI.
6. Integrate commands and widgets.
7. Add or update tests.
8. Document the resulting architecture.
9. Identify later migrations without implementing unrelated modules.

Preserve working existing routes and components.

Do not delete old code until you have verified it is unused and the replacement works.

## Supabase and security

For any schema or policy work:

* Review existing migrations first.
* Use migrations rather than editing production state manually.
* Enable RLS on exposed tables.
* Use explicit ownership checks based on authenticated user IDs.
* For update policies, include both `USING` and `WITH CHECK`.
* Do not use frontend-supplied user IDs as trusted authorization.
* Do not expose a service-role key.
* Avoid broad `FOR ALL` policies when separate operation policies provide clearer security.
* Verify that existing policies continue to work.

Do not modify Supabase schema merely to match a generic journal tutorial.

## Documentation

Create or update documentation covering:

* QiLife module contract
* Module registry behavior
* Journal-to-QiBit mapping
* Persistence boundary
* Current sync limitations
* Future local-first sync design
* Files moved or intentionally left in their current locations

Place architectural decisions in the repository’s established documentation structure.

## Tests and verification

Add proportionate tests for:

* Module registration
* Route registration
* Journal record mapping
* Creating and editing journal records
* Markdown preservation
* Search/filter behavior
* Authorization-sensitive repository behavior where test infrastructure supports it

Run the project’s existing verification commands.

At minimum verify:

* TypeScript compilation
* Production build
* Existing tests
* New tests
* Existing routes still render
* Journal routes render
* No active imports point into legacy/reference folders accidentally
* No duplicate Supabase clients or Journal-specific databases were introduced

Use the commands defined by the repository rather than guessing them. Inspect `package.json` and the existing CI workflow first.

## Required working behavior

The work is complete when:

1. QiLife has a typed central module registry.
2. Journal is registered through a module manifest.
3. Journal routes appear through the module system.
4. A user can create, view, edit, search, and export a Markdown journal entry.
5. Journal entries persist through the shared QiLife record layer.
6. The original raw capture is not silently overwritten.
7. Existing QiLife features still build and function.
8. No separate journal data silo or sync engine exists.
9. Relevant tests pass.
10. Architecture documentation reflects the implementation.

## Working rules

* Preserve unrelated user changes.
* Do not rewrite the entire application.
* Do not change visual styling beyond what is necessary to integrate Journal consistently.
* Reuse existing types and components before introducing duplicates.
* Keep files focused and module boundaries explicit.
* Do not claim something works unless you ran the relevant verification.
* When an architectural assumption is contradicted by the actual code, follow the actual code and document the adjustment.

Begin with a concise repository audit and implementation plan. Then implement the work in safe phases. Stop and report before making destructive changes, replacing the existing data model, or introducing a major new dependency.
