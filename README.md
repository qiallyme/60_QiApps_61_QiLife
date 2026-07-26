# QiLife

QiLife is a modular personal Life OS: one navigation system and one shared record
model for planning work, managing projects and relationships, recording a
journal, and projecting what needs attention today.

Production: https://qilife.qilife.workers.dev

## Implementation status

### Working today

- URL-first Today, Actions, Projects, People/Personal CRM, and Journal modules
- Shared application shell, grouped navigation, command capture, and responsive
  Qi Soft Surface design tokens
- Supabase authentication with same-origin deep-route return paths
- Explicit session-scoped local development fallback
- Shared QiRecord persistence through the Qi API or browser local storage
- Persistent Cloud, Local, Offline, or Sync error status throughout the app
- Versioned complete JSON export and preview-first, conflict-aware restore
- Stable cross-module Project, Person, Thread, and owner relationships
- Project dashboards with contextual Actions and related records
- Journal editing, debounced persistence, raw-capture protection, navigation
  protection, search, filters, and Markdown export
- People dashboards, interactions, related records, follow-ups, and a
  review-before-sync Google Contacts scaffold
- Cloudflare Worker SPA fallback for direct navigation and refreshes

### Partially implemented

- The compatibility shell still serves working screens that are not URL-first.
- Calendar, Threads, Timeline, Documents, Knowledge, Decisions, Reports, Apps,
  Automations, and Settings are not all first-class modules yet.
- Project activity and some legacy screen styling remain basic.
- Local mode is a development fallback, not a full offline-first sync engine.
- Google Contacts synchronization remains manual and review-first.

### Planned next

- Reliability hardening, production observability, performance, and code splitting
- AI assistance grounded in shared QiRecords with explicit user control
- Semantic memory and retrieval across relationships, journal entries, projects,
  and activity
- Calendar, contacts, documents, and communication integrations
- Reviewable automation workflows, scheduling, and notifications

### Experimental or deferred

- Full local-first mutation queues and multi-device conflict resolution
- Advanced calendar synchronization
- Autonomous AI actions and relationship scoring
- Production notification delivery
- Broad finance redesign

These deferred capabilities are not complete and are not represented as current
production behavior.

## Technology stack

- React 19 and TypeScript
- Vite and Vitest
- React Router
- Testing Library and jsdom
- Supabase JavaScript client for authentication
- Qi API for authenticated application records
- PostgreSQL/Supabase `qilife.records`
- Cloudflare Workers static assets and SPA routing
- npm with a committed lockfile

## Navigation

```text
Home

PLANNER
  Today
  Inbox
  Actions
  Calendar

ORGANIZE
  Projects
  Threads
  People

RECORD
  Journal
  Timeline
  Documents
  Knowledge

REVIEW
  Decisions
  Reports

SYSTEM
  Apps
  Automations
  Settings
```

Group headings are organizational labels, not duplicate destinations. Today,
follow-ups, Project Actions, and Timeline are projections of shared records rather
than separate storage systems.

## URL-first modules

| Module | Routes | Current behavior |
| --- | --- | --- |
| Today | `/today` | Overdue, due today, upcoming, waiting and blocked Actions; at-risk Projects; follow-ups; activity; Inbox |
| Actions | `/actions`, `/actions/new`, `/actions/:id` | Search, filters, status, priority, due date, Project, People, Thread, context, and notes |
| Projects | `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit` | Project identity, outcomes, Action summary/list, relationships, and Project-aware quick creation |
| People | `/people`, `/people/new`, `/people/:id`, `/people/:id/edit`, `/people/:id/sync` | Personal CRM, contact methods, interactions, insights, follow-ups, and related records |
| Journal | `/journal`, `/journal/new`, `/journal/:id` | Markdown entries, search/filter, dates, tags, pinning, autosave, export, and safe navigation |

Projects also register focused linking and creation routes for People, Documents,
and Events. Module routes are registered before the explicitly temporary
compatibility catch-all.

## Shared QiRecord model

All modules use `qilife.records`; no active module has its own database or
Supabase client.

```text
id
owner_id
entity_key
title
status
priority
due_date
data jsonb
source
created_at
updated_at
archived_at
```

Domain-specific fields live in `data` while common sortable fields remain
top-level. Journal preserves `raw_capture` independently from editable
`body_markdown`.

### Canonical relationship fields

- `data.project_id` — one related Project
- `data.people_ids` — zero or more related People
- `data.thread_id` — one related Thread
- `data.owner_id` — a Project owner/Person
- `data.lead_person_id` — a lead Person where a field declares that role

Relation controls display titles but persist stable IDs. The relationship layer
reads legacy scalar and array aliases without destructively migrating or dropping
unresolved values.

## Authentication and persistence

`AuthenticationBoundary` wraps both module and compatibility routes. When
Supabase is configured, unauthenticated users see one login experience. QiLife
constructs only same-origin internal callback destinations and includes the
current pathname, query parameters, and hash in the requested redirect.

The production Supabase magic-link email template currently hardcodes
`https://qially.com/` instead of using the requested QiLife redirect. As a
result, normal email sign-in does not yet return automatically to the requested
QiLife deep route. The persistence proof used a manual callback transfer after
the email link established a valid session. Fixing and retesting that external
template is required before the authentication return flow is considered
production-ready.

Persistence follows one path:

```text
Module UI
  -> module repository
  -> qilifeStore
  -> authenticated Qi API
  -> qilife.records
```

If Supabase is not configured, or a developer explicitly chooses local mode,
`qilifeStore` uses browser local storage. Local mode is session-scoped and is not
an offline sync implementation. Authenticated cloud failures never silently
fall back to local storage.

### Storage status and recovery

The top bar always identifies the active condition:

- **Cloud** means an authenticated, owner-scoped Qi API operation succeeded.
- **Local** means data exists only in the current browser.
- **Offline** means a cloud account is available but the browser is disconnected.
- **Sync error** means synchronization could not be confirmed or a write may
  not have reached storage.

Select the indicator to download a complete, versioned JSON recovery export or
review a restore file. Restore validates the file before any write, previews
counts by entity and conflict outcome, creates missing records, updates only
when the import is newer, skips equal/newer records, and never deletes records
omitted by the file. Stable IDs, relationships, archive state, Journal Markdown,
and `raw_capture` are preserved.

See [DATA_RECOVERY.md](docs/architecture/DATA_RECOVERY.md) for the schema,
workflow, cloud/local guarantees, and failure behavior.

### Controlled trial boundary

Owner-scoped cloud records, refresh persistence, reauthentication, isolated
browser retrieval, cross-session editing, complete export, and reviewed restore
were verified with the production account on 2026-07-26. The normal email
magic-link return is still blocked by the external template configuration, so
the controlled trial remains limited to noncritical Projects, Actions, limited
People details, and replaceable Journal entries. Do not use QiLife as the sole
record for legal deadlines, medical appointments, credentials, financial
evidence, irreplaceable evidence, or other consequential obligations.

## Local development

Requirements: Node `>=22.12 <25` and npm `>=11`.

```bash
npm ci
npm run dev
```

Vite normally serves the application at `http://localhost:5173`.

Create `.env` from `.env.example`:

```env
VITE_QI_API_URL=https://api.qially.com
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

`VITE_SUPABASE_ANON_KEY` is accepted as a compatibility fallback. Never commit
local secrets or service-role credentials.

## Tests, build, and deployment

```bash
npm run test:ci
npm run build
git diff --check
```

`npm run check` runs the test suite and production build. Deploy the current
production Worker only after a successful build:

```bash
npm run build
npx wrangler deploy
```

Root `wrangler.jsonc` is authoritative and serves `dist/` with
`not_found_handling: "single-page-application"`.

## Active source-code map

- `src/features/qilife/reliability/` - storage state, export, restore, and recovery UI

- `src/main.tsx` — application entry point and global providers
- `src/app/` — router, module contract, registry, route frame, compatibility route
- `src/features/qilife/auth/` — shared authentication boundary and return paths
- `src/features/qilife/components/` — shared shell and compatibility components
- `src/features/qilife/data/` — navigation and generic entity definitions
- `src/features/qilife/relations/` — canonical relationship fields and resolver
- `src/features/qilife/services/qilifeStore.ts` — shared QiRecord persistence
- `src/modules/` — Today, Actions, Projects, People, and Journal
- `src/lib/qiApiClient.ts` — authenticated Qi API client
- `src/lib/supabaseClient.ts` — the single Supabase client
- `src/test/` and colocated `*.test.*` files — test setup and focused tests
- `public/` — active manifest, service worker, and icons
- `supabase/migrations/` — the only database migration directory

See [ACTIVE_CODE_MAP.md](docs/architecture/ACTIVE_CODE_MAP.md) for the concise
architecture index.

## Supabase migrations

- `0001_qilife_records.sql` — creates the `qilife.records` shared-record table,
  indexes, and updated-at trigger
- `0002_qilife_auth_rls.sql` — adds record ownership, enables RLS, and defines
  authenticated owner policies
- `0003_qilife_authenticated_grants.sql` - grants the authenticated API client
  the minimum table access required for PostgreSQL to enforce those RLS policies

No migration in a documentation, reference, or module directory is authoritative.

## Repository boundary

Production implementation exists only in the root application directories.
Historical implementations, copied reference applications, generated databases,
and runnable prototypes are not retained. Git history and rollback tags provide
historical recovery.
