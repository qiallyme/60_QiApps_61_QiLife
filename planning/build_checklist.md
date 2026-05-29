# QiLife Build Checklist

This checklist is the canonical v1 implementation list. It follows the corrected documentation set and should be safe to build from directly.

## Phase 1: Spine

Goal: establish the canonical local-first backend and the core app shell.

- `[ ]` Create `backend/` with FastAPI, SQLModel/SQLAlchemy, Alembic, and SQLite at `data/db/qilife.sqlite`.
- `[ ]` Create canonical tables: `qibits`, `buckets`, `threads`, `actions`, `action_steps`, `people`, `transactions`, `obligations`, `knowledge_items`, `documents`, `events`, `links`, `activity_log`, `ai_outputs`, `daily_summaries`.
- `[ ]` Seed the canonical bucket set and minimal linked sample data.
- `[ ]` Enforce SQLite pragmas: WAL, foreign keys, synchronous normal.
- `[ ]` Build REST routes for:
  - QiBit capture/list/detail/update/triage
  - Threads list/detail
  - Actions list/detail/create/update
  - People list/detail
  - Timeline feed
- `[ ]` Create `frontend/` with React, Vite, TypeScript, and a three-pane app shell.
- `[ ]` Implement left navigation, center workspace routing, and right Context Dock shell.
- `[ ]` Implement persistent Quick Capture.
- `[ ]` Implement Inbox for `status = new`.
- `[ ]` Implement Timeline feed from projection rules, not from a timeline table.

## Phase 2: Daily Command Layer

Goal: make the app usable for daily life operations.

- `[ ]` Build the Today view with:
  - due and scheduled actions
  - open loops (`waiting_on` actions and unresolved obligations)
  - today's projected QiBits
  - daily summary panel
- `[ ]` Add action rescheduling controls.
- `[ ]` Add end-of-day review flow.
- `[ ]` Save reflection text as QiBit type `reflection`.
- `[ ]` Store day-level summaries in `daily_summaries`.

## Phase 3: Context Layer

Goal: embed relevant knowledge beside work.

- `[ ]` Implement knowledge item CRUD.
- `[ ]` Render Markdown in the workspace and Context Dock.
- `[ ]` Implement Context Dock retrieval order:
  - direct links
  - same thread
  - same bucket
  - same person/entity
  - shared tags
- `[ ]` Support read-only imported repo docs.

## Phase 4: Money Layer

Goal: track movement and obligations with provenance.

- `[ ]` Build transactions ledger using `amount_cents`.
- `[ ]` Build obligations ledger using `amount_cents`.
- `[ ]` Show `who owes me` and `who I owe`.
- `[ ]` Link money records back to QiBits and threads.
- `[ ]` Surface money context in Context Dock.

## Phase 5: AI Layer

Goal: make AI useful without breaking provenance.

- `[ ]` Implement mock AI services that match the canonical contracts.
- `[ ]` Store AI suggestions in `ai_outputs`.
- `[ ]` Build UI review and acceptance flows.
- `[ ]` Prevent silent writes to primary tables.
- `[ ]` Build Ask QiLife query surface with cited supporting records.

## Phase 6: Repo Docs Import and Export

Goal: preserve canonical docs and expose them in-app.

- `[ ]` Implement importer for repo `docs/` into `knowledge_items` with `source_type = repo_doc`.
- `[ ]` Mark imported repo docs read-only in-app.
- `[ ]` Add markdown/json export routines for app data.
- `[ ]` Defer any reverse sync to external knowledge folders until after v1.
