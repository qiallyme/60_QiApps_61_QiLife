# QiLife Architecture and UX Pass — Management Report

## Executive summary

The first production milestone of the QiLife information-architecture redesign is live on the existing production Worker:

https://qilife.qilife.workers.dev

The release establishes the structural foundation for QiLife to behave as a connected Life OS rather than a collection of duplicated record screens. It introduces first-class Actions and Projects, real record relationships, contextual Project dashboards, grouped navigation, and the initial light-first Qi Soft Surface design system.

Journal and People/Personal CRM remain operational. No new database, module-specific Supabase client, or separate Actions/Projects data silo was introduced.

Production Cloudflare version:

`dd1ed5a3-9c97-4184-be6e-6c7197af8e1c`

Current `main` commit:

`bb95c73 style(qilife): add light soft-surface application shell`

## Delivered

### Repository protection and integration

- Updated and worked directly on `main` as directed.
- Created and pushed rollback tag:

  `qilife-before-ia-actions-projects-redesign`

- Audited local branches, remote branches, and worktrees.
- Confirmed the Journal and People branches represented historical work already released through squash commits.
- Did not merge those historical branches again.
- Integrated only the unique Actions, Projects, navigation, relationship, and visual-system work.
- Preserved existing worktrees and branches.

### Information architecture

The sidebar now uses the approved operating hierarchy:

- Home
- Planner: Today, Inbox, Actions, Calendar
- Organize: Projects, Threads, People
- Record: Journal, Timeline, Documents, Knowledge
- Review: Decisions, Reports
- System: Apps, Automations, Settings

Group names are non-clickable organizational labels. Planner is no longer presented as a duplicate destination.

Navigation uses router-native links. First-class module routes render inside a shared application frame with the sidebar, topbar, quick journal action, and Ctrl/Cmd+K capture behavior.

### Relationship foundation

A shared relationship contract and resolver now support contextual records across modules.

Canonical fields:

- `data.project_id` for a singular Project
- `data.people_ids` for linked People
- `data.thread_id` for a singular Thread
- `data.owner_id` for a Project owner

The implementation also reads legacy fields such as:

- `project`
- `person`
- `people`
- `thread`
- `owner`
- Scalar or array variants

Legacy values are not bulk-migrated or silently discarded.

The reusable relation selector:

- Loads active records for the declared entity type.
- Displays human-readable titles.
- Persists stable IDs.
- Supports empty values.
- Displays loading and error states.
- Preserves unresolved legacy values.
- Produces an explicit configuration error instead of degrading into a free-text field.

### Actions module

New URL-first routes:

- `/actions`
- `/actions/new`
- `/actions/:id`

Actions continue to use the shared `task` QiRecord type.

Supported behavior includes:

- Title
- Status
- Priority
- Due date
- Project
- Person
- Thread
- Context
- Notes
- Search
- Status filtering
- Project filtering
- Person filtering
- Due-today and overdue filtering
- Links to related Project, Person, and Thread routes
- Module-level missing-record handling

People-related records now link Actions through `/actions/:id` instead of the previous nonexistent `/tasks/:id` route.

### Projects module

New URL-first routes:

- `/projects`
- `/projects/new`
- `/projects/:id`
- `/projects/:id/edit`

Project dashboards now include:

- Name and desired outcome
- Status
- Priority
- Due date
- Owner
- Area
- Tags
- Brief
- Open Action count
- Blocked Action count
- Completed Action count
- Next due Action
- An actual contextual Action list
- Related People
- Related Journal entries
- Threads
- Timeline events
- Decisions
- Documents
- Knowledge items

Quick links are provided for:

- Add Action
- Add Journal entry
- Add Event
- Link Person
- Link Document

Action and Journal quick creation carry the current Project ID. Actions link back to `/projects/:id`, and Project Actions link to `/actions/:id`.

### Journal and People preservation

Journal retains:

- `/journal`
- `/journal/new`
- `/journal/:id`
- Existing editing and navigation protection
- Raw-capture preservation
- People linking
- Shared QiRecord persistence

Journal received additive Project-link support. A focused integration test caught a potential regression where editing a historical Journal entry could add `project_id: null`. That behavior was corrected so records without an existing or explicitly selected Project remain unchanged.

People retains:

- `/people`
- `/people/new`
- `/people/:id`
- `/people/:id/edit`
- `/people/:id/sync`
- Existing CRM mapping and dashboards
- Existing Journal-to-Person relationships

People’s related-record query now delegates to the shared relationship resolver rather than maintaining an independent relationship implementation.

### Qi Soft Surface design system

The first light-first production styling pass is live.

The token system now defines:

- Icy-cool application canvas
- White raised surfaces
- Interactive surfaces
- Overlay surfaces
- Primary and strong borders
- Soft and medium shadows
- Visible focus ring
- Electric-blue primary accent
- Restrained plasma purple
- Teal informational color
- Soft-gold attention color
- Restrained red
- Navy/graphite text
- Midnight-navy sidebar
- Shared radius values

The initial release also adds:

- Visible borders on cards and form controls
- Soft surface separation
- Clear primary buttons
- Hover and focus states
- Disabled states
- Minimum 40-pixel form/button targets
- Responsive grids
- Reduced-motion handling
- Shared styling for cards, panels, tables, forms, modals, and drawers

Legacy variable names such as `--qi-green` remain only as documented compatibility aliases while released components transition to the correctly named tokens.

## Production verification

### Automated verification

Relevant verification completed before deployment:

- Navigation and relation-control tests: 33 tests passed.
- Project, Action, Journal, and routing integration: 44 tests passed.
- Shared shell and released-module regression selection: 36 tests passed.
- TypeScript and Vite production build passed.
- `git diff --check` passed.
- Working tree was clean after deployment.

The build continues to emit a non-blocking bundle-size advisory because the main JavaScript chunk exceeds Vite’s default 500 kB warning threshold. This is not a compile or runtime failure.

### Production smoke verification

Verified in the deployed Worker:

- `/`
- `/today`
- `/actions`
- `/actions/new`
- `/actions/:id`
- `/projects`
- `/projects/new`
- `/projects/:id`
- `/people`
- `/journal`

Verified production workflow:

1. Created a Project.
2. Opened its Project dashboard.
3. Used “Add Action.”
4. Confirmed the new Action form displayed the real Project title.
5. Created the Action.
6. Confirmed the Action detail linked back to the Project.
7. Returned to the Project dashboard.
8. Confirmed the same Action appeared in the Project’s Action list.
9. Confirmed the dashboard’s open-Action count updated.

Also verified:

- Direct route refreshes load through the Worker’s SPA fallback.
- Browser Back and Forward operate correctly.
- Ctrl/Cmd+K opens the existing quick-capture interface on module routes.
- People loads.
- Journal loads.
- No browser runtime errors were observed.

The browser reported minor accessibility notices for form controls without `id` or `name` attributes. These are real cleanup items but did not block the release.

## Commit history for this milestone

- `84db9e9` — Architecture specification and implementation plan
- `3b20ab2` — Grouped operating-hierarchy navigation
- `e801926` — Shared relation controls
- `4c9b6f6` — Shared record relationship resolver
- `e776588` — URL-first Actions module
- `e56f955` — Project dashboards and linked work
- `bb95c73` — Light soft-surface application shell

## Current limitations

### Today is not yet the intended operational projection

`/today` currently reaches the temporary compatibility/auth shell. It does not yet provide the approved contextual breakdown of:

- Overdue Actions
- Actions due today
- Waiting Actions
- Recent changes
- People requiring follow-up
- Blocked Projects

This is the most important remaining architecture item.

### Action People selection is currently single-person in the form

The stored contract supports `people_ids`, but the initial Action form selects one Person at a time. True multi-person selection remains to be completed.

### Remaining legacy routes use compatibility behavior

Threads, Timeline, Documents, Knowledge, Decisions, Reports, Apps, Automations, and Settings have navigation URLs, but several still resolve through the temporary state-based compatibility shell rather than dedicated URL-first screens.

### Visual migration is incomplete

The shared shell and primary surfaces are light-first. However:

- Several People components retain inline dark-era colors.
- Some module-specific states need conversion to shared classes.
- Journal and People need a deliberate visual integration pass.
- Remaining older workspace components may still expose inconsistent surface styling.

### Recent activity is basic

Project dashboards provide related-record sections and Action summaries, but “recent activity” is not yet a unified, chronological cross-record projection.

### Quick-create coverage is uneven

Action and Journal pre-linking is implemented. Event, Person, and Document links currently lead to their owning compatibility destinations with the Project parameter, but those legacy screens do not yet provide the same complete pre-link creation workflow.

### Authentication boundary remains inconsistent

The released module routes predate the new shared frame and currently render outside the legacy compatibility shell’s login gate. The production smoke used local fallback storage. Authentication behavior should be unified without changing the approved same-origin return-path protections.

## Risk assessment

Overall delivery risk is moderate but controlled.

Low-risk areas:

- No destructive data migration.
- No new persistence silo.
- No schema change.
- No duplicated Supabase client.
- Journal raw-capture behavior remains protected.
- A rollback tag exists remotely.

Primary remaining risks:

- Authentication enforcement is inconsistent between module and compatibility routes.
- Inline People styling could reduce contrast under the light theme.
- Legacy relationship aliases require continued preservation until records are explicitly normalized.
- Today and several sidebar routes do not yet meet their final operating semantics.
- The current module bundle should eventually be code-split, although it is functioning correctly.

## Recommended next milestone

The next production milestone should remain narrow:

1. Implement `/today` as a real shared-record projection.
2. Add true multi-person Action selection.
3. Complete Project-aware Event, Person, and Document quick creation.
4. Finish People and Journal soft-surface integration.
5. Add missing `id` and `name` attributes to form controls.
6. Unify authentication enforcement across module and compatibility routes.
7. Production-smoke authenticated persistence as well as local fallback.

No new module should be introduced until those integration seams are complete.
