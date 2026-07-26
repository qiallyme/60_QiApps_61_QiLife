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
compatibility routes. Internal return paths are same-origin and preserve
pathname, search parameters, and hash without prematurely rewriting Supabase
callback parameters. Local fallback mode is explicit and session-scoped.

## Shared records and relationships

The canonical persisted model is `qilife.records`. Module repositories map
domain-specific drafts to shared QiRecords and call
`src/features/qilife/services/qilifeStore.ts`.

Authenticated persistence flows through `src/lib/qiApiClient.ts`. Development
without an authenticated Supabase session uses the existing local-storage
fallback. Modules must not create their own Supabase clients, tables, databases,
queues, or sync engines.

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
