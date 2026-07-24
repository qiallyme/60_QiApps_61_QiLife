# QiLife Journal Module

## Module boundary

Journal is registered through `src/modules/journal/manifest.ts`. The manifest
declares three URL-first routes, one navigation entry, one quick-journal
command, one dashboard widget, and the `journal_entry` record type. It does
not instantiate persistence or hold runtime state.

The central registry flattens module capabilities deterministically and
rejects duplicate module keys and route IDs. `AppRouter` renders these routes
before `CompatibilityShellRoute`. The compatibility route is temporary and
exists only for screens that predate the module foundation.

## Shared record mapping

Journal entries are ordinary `QiRecord` values:

| Journal value | Shared record location |
| --- | --- |
| identity | `id` |
| record type | `entity_key: "journal_entry"` |
| title | `title` |
| journal date | `data.entry_date` |
| current Markdown | `data.body_markdown` |
| original capture | `data.raw_capture` |
| tags | `data.tags` |
| pinned state | `data.pinned` |
| deadline | `due_date: null` |

`due_date` is never used for Journal because a Journal date is not an
obligation or deadline.

For a new entry, the first successful create stores the initial Markdown in
both `body_markdown` and `raw_capture`. Later edits update
`body_markdown` and editable metadata without changing `raw_capture`.

Legacy records may supply `data.body` when `body_markdown` is absent.
Normalization preserves an existing `raw_capture` but never fabricates one
when the historical original is unknown. Journal updates merge their fields
into existing JSON so unrelated shared metadata survives.

## Persistence and authorization

Components call an injected `JournalRepository`. Its production instance
delegates to the existing `qilifeStore`, which selects the authenticated Qi
API or the existing localStorage fallback. Direct Supabase queries are not
allowed in Journal components or services.

Authenticated API access remains owner-scoped by the existing backend and
RLS policies. No schema migration was required because Journal metadata fits
the existing `data jsonb` field.

Sign-in return URLs are derived from the current browser pathname, search,
and hash. The helper rejects cross-origin, protocol-relative external, and
malformed destinations. Supabase callback parameters are passed through
without early removal or rewriting.

## Save and navigation behavior

Existing entries use a debounced serialized save hook:

1. edits mark the current-session draft dirty;
2. one timer schedules the latest snapshot;
3. only one persistence write runs at a time;
4. edits during a write coalesce into the next latest snapshot;
5. the UI reports saved only after persistence confirms;
6. failures keep the draft mounted and expose retry.

Router navigation is blocked while content is dirty, saving, or failed.
Users can stay, retry failed persistence, or explicitly leave. Browser unload
is not treated as a reliable save mechanism.

## Commands, widgets, and search

The module registry contributes a single quick-journal action and Journal
widget. Existing Ctrl/Cmd+K quick capture remains unchanged.

`AssistantPage` already emits shared `QiRecord` values through
`onOpenEntity`. The compatibility shell handles only the `journal_entry`
branch by navigating to `/journal/:id`; the Assistant implementation and
search architecture were not expanded.

## Current sync limitation

QiLife still uses its shared authenticated API/localStorage selection. This
phase does not add durable cross-refresh recovery for a failed unsaved edit.
Future local-first work belongs in a shared OS persistence layer:

```txt
Editor
  -> shared local persistence
  -> shared mutation queue
  -> OS sync coordinator
  -> authenticated Qi API
  -> Postgres/Supabase
```

Journal must remain unaware of the eventual backend choice.

## Files intentionally left in place

The existing shell, entity registry, auth provider, record types, store, and
generic QiLife components remain under `src/features/qilife/`. Moving them
was not required to establish the module contract and would have expanded
this incremental refactor unnecessarily.
