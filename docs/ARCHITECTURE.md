# QiLife architecture

QiLife is one React/TypeScript application deployed as a Cloudflare Worker with
static SPA assets. Root configuration is authoritative.

## Startup and routing

`src/main.tsx` creates the browser router and mounts the shared `AuthProvider` and
`AuthenticationBoundary`. `src/app/AppRouter.tsx` renders routes aggregated by
`src/app/moduleRegistry.ts` before the temporary compatibility catch-all.

Registered modules own declarative manifests and URL-first routes. Manifests may
declare routes, navigation, commands, widgets, and supported record types; they
do not contain persistence logic or instantiate stateful services.

Current modules:

- Today: `/today`
- Actions: `/actions`, `/actions/new`, `/actions/:id`
- Projects: `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit`
- People: `/people`, `/people/new`, `/people/:id`, `/people/:id/edit`, `/people/:id/sync`
- Journal: `/journal`, `/journal/new`, `/journal/:id`

The compatibility route is explicitly temporary. It remains only for specific
working screens that have not migrated. New modules must not add state-only
navigation.

## Authentication

`AuthenticationBoundary` is the single enforcement boundary for both module and
compatibility routes. QiLife only requests same-origin internal return paths and
includes pathname, search parameters, and hash without rewriting callback
parameters. Local fallback mode is explicit and session-scoped.

The production Supabase email template currently ignores that requested
destination and emits a link with `redirect_to=https://qially.com/`. This is an
external authentication configuration blocker: normal magic-link completion
does not yet return to QiLife or prove automatic deep-link restoration.

## Shared records and relationships

The canonical persisted model is `qilife.records`. Module repositories map
domain-specific drafts to shared QiRecords and call
`src/features/qilife/services/qilifeStore.ts`.

Authenticated persistence flows through `src/lib/qiApiClient.ts`. When cloud
configuration exists, a missing session or failed cloud operation is an explicit
error and never selects local storage. Development without Supabase
configuration, or a user-selected session-scoped local mode, uses browser
storage. Modules must not create their own Supabase clients, tables, databases,
queues, or sync engines.

`src/features/qilife/reliability/` owns the app-wide storage condition and the
versioned recovery contract. Complete export includes active and archived
QiRecords. Restore validates and previews before writing, updates only from a
newer import, never deletes omitted records, and uses the same shared store and
owner-scoped Qi API path as normal module writes. See
`docs/architecture/DATA_RECOVERY.md`.

Canonical relationship fields store stable record IDs in QiRecord `data`.
`src/features/qilife/relations/relationshipFields.ts` normalizes current and
legacy values; `relationResolver.ts` supplies shared contextual queries used by
Projects and People.

## Database and deployment

The only migration location is `supabase/migrations/`. The only Cloudflare
configuration is root `wrangler.jsonc`; its SPA asset fallback serves
`index.html` for application deep links.

## Documentation boundary

Current documentation lives in `README.md`, this file, `docs/architecture/`,
`docs/decisions/`, and `docs/superpowers/`. Runnable copies of external projects,
historical application trees, generated databases, and experiments do not belong
in documentation directories.
