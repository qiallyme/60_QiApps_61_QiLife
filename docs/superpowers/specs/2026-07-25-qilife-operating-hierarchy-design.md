# QiLife Operating Hierarchy and Soft Surface Design

## Outcome

QiLife will expose one URL-first destination for each operating concern, backed by shared `QiRecord` records and shared relationship queries. Planner becomes a non-clickable navigation group. Actions and Projects become first-class modules. Existing Journal and People routes and persistence behavior remain unchanged except that their presentation adopts shared visual tokens and their relationship panels consume the shared resolver.

## Confirmed repository findings

- `task` records are currently repeated without contextual filtering in Today, Planner, Projects, and People workspaces.
- Planner is a clickable state workspace that duplicates Projects, Actions, Calendar, and Decisions.
- `QiField` declares `type: "relation"` and `relationEntity`, but `EntityFormModal` renders relation fields as text inputs.
- Projects have no URL-first module, detail dashboard, or contextual action list.
- Generic record cards and tables display relationship IDs or legacy values without resolving titles or routes.
- People has a module-local related-record query based on `data.people_ids`; Journal already persists `people_ids`.
- The shell uses dark canvas, panel, border, and neon-accent values across three style sheets, with additional inline dark colors in People.
- No destructive data migration is required. Relationship metadata is stored in `QiRecord.data` and can be normalized additively.

## Operating hierarchy

The sidebar contains non-clickable labels and router-native destination links:

- Home
- Planner: Today, Inbox, Actions, Calendar
- Organize: Projects, Threads, People
- Record: Journal, Timeline, Documents, Knowledge
- Review: Decisions, Reports
- System: Apps, Automations, Settings

Released module routes are registered before temporary compatibility routes. New Actions and Projects routes are module-owned. Destinations not migrated in this pass use explicit compatibility URLs that render the existing entity/workspace UI. There is no clickable Planner workspace and no duplicate Follow-ups or Next Actions navigation item.

Today is a projection over shared records: overdue and due Actions, waiting Actions, recent changes, person follow-ups, and blocked Projects. Timeline remains a projection over records and activity; it does not gain a new persistence model.

## Canonical relationship contract

Relationships are stable record IDs stored in `QiRecord.data`:

```ts
interface QiRelationshipData {
  project_id?: string | null;
  people_ids?: string[];
  thread_id?: string | null;
}
```

- Singular Project links use `data.project_id`.
- Multi-person links use `data.people_ids`.
- Singular Thread links use `data.thread_id`.
- A Project owner is a person relationship and is persisted as `data.owner_id`.
- Empty singular values are `null` or absent; empty multi-values are `[]`.
- UI labels are resolved from the target record and are never persisted in place of IDs.
- Existing `project`, `person`, `people`, `thread`, `owner`, and scalar/array relationship values remain readable.
- Editing preserves an unresolved legacy value unless the user explicitly changes or clears it.
- New and explicitly edited values use the canonical keys.
- No bulk migration is performed.

`RelationSelector` receives the field definition and current stored value, loads active records through the shared record service, displays record titles, and emits IDs. It shows explicit loading, empty, error, unresolved-legacy, and disabled states. A relation field without `relationEntity` renders an error instead of a text input.

## Shared relation resolver

One service owns relationship normalization and contextual queries. It exposes:

```ts
getRelatedRecords(recordId: string): Promise<QiRecord[]>
getActionsForProject(projectId: string): Promise<QiRecord[]>
getPeopleForProject(projectId: string): Promise<QiRecord[]>
getJournalForProject(projectId: string): Promise<QiRecord[]>
getRecordsForPerson(personId: string): Promise<QiRecord[]>
```

The resolver uses `listAllRecords()` and pure relationship predicates. People delegates its related-record lookup to this service. Actions and Projects do not create their own query implementations.

## Actions module

Routes:

- `/actions`
- `/actions/new`
- `/actions/:id`

Actions use `entity_key: "task"` and the shared record store. Core fields map to top-level `title`, `status`, `priority`, and `due_date`; relationship, context, and notes fields remain in `data`. The index supports text, status, project, person, and due-state filtering. Detail links resolve Project, People, and Thread routes. New Action URLs accept internal prefill parameters for Project or Person IDs; these are validated against loaded records and saved as IDs.

## Projects module

Routes:

- `/projects`
- `/projects/new`
- `/projects/:id`
- `/projects/:id/edit`

Projects use `entity_key: "project"`. The detail dashboard combines project identity, outcome/brief, action counts, next due Action, recent activity, and related record sections from the shared resolver. Quick-create links prefill the current project. Action and Project detail links are reciprocal.

## Soft Surface design system

The default theme is light. Shared tokens define canvas, raised, interactive, and overlay surfaces; primary and strong borders; soft and medium shadows; focus ring; text; muted text; electric-blue primary; restrained purple, teal, gold, and red semantic accents. The sidebar remains midnight navy. Content cards are white with visible borders. Radius values use 10, 12, and 14 pixels.

Shared shell, buttons, form controls, tables, cards, overlays, and navigation consume tokens first. Feature styles then remove one-off dark colors. Journal and People retain their component behavior and adopt the shared variables. Focus visibility, minimum 40-pixel controls, disabled states, contrast, responsive layouts, and `prefers-reduced-motion` are required.

## Error handling and preservation

- Missing or inaccessible Action and Project records render module-level not-found/error states.
- Relationship load failures remain visible and do not degrade to text inputs.
- Failed saves leave form state available and do not claim success.
- Existing Journal navigation guards, raw-capture preservation, and People repository mapping remain intact.
- No module-specific database, Supabase client, queue, or sync engine is introduced.

## Verification

Automated tests cover navigation grouping, relation selector states and ID persistence, legacy relation normalization, shared resolver queries, Actions filtering/routes, Projects dashboard relationships and pre-linking, People delegation, Journal-Person regression behavior, and module registration.

Release verification includes `npm run test:ci`, `npm run build`, `git diff --check`, responsive browser smoke checks, browser console inspection, refresh and Back/Forward checks for all new routes, CI, Wrangler deployment, and production smoke checks for the required URLs.

