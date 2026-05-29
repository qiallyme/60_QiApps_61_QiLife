# QiLife Build Phases

## Phase 0 — Review Docs

Goal:

Create reviewable product and architecture docs before coding.

Deliverables:

- master build spec
- information architecture
- QiBit lifecycle
- app flow
- Context Dock knowledge model
- data model spine
- AI layer blueprint
- module map
- build phases
- Codex build prompt

## Phase 1 — Spine

Goal:

Build the core nervous system.

Build:

```text
Phase 1
├── App shell
├── Left nav
├── Center workspace
├── Context Dock shell
├── QiBit model
├── Buckets
├── Threads
├── Actions
├── Timeline
├── Inbox
└── Ask QiLife placeholder
```

Success criteria:

- User can capture QiBit.
- QiBit appears on timeline.
- QiBit can be assigned bucket/thread.
- QiBit can create action.
- Action can have steps.
- Context Dock can show placeholder context.
- Ask QiLife page exists with placeholder response.

## Phase 2 — Daily Command Layer

Goal:

Make the app useful every day.

Build:

```text
Phase 2
├── Today dashboard
├── due/scheduled action views
├── open loops
├── waiting items
├── today's QiBits
├── daily summary placeholder
├── basic calendar/week view
└── reflection prompt
```

Success criteria:

- User can see what matters today.
- User can see open loops/waiting.
- User can see what happened today.

## Phase 3 — Context Layer

Goal:

Bring knowledge beside the work.

Build:

```text
Phase 3
├── Knowledge item CRUD
├── Markdown rendering
├── linked notes
├── documents metadata
├── person pages
├── thread summaries
└── Context Dock enrichment
```

Success criteria:

- Knowledge can be attached to buckets/threads/actions/QiBits/people.
- Context Dock displays relevant linked knowledge.
- Central Knowledge page is navigable.

## Phase 4 — Money Layer

Goal:

Track transactions and obligations.

Build:

```text
Phase 4
├── transactions
├── obligations
├── who owes me
├── who I owe
├── money context on threads
└── money context in Context Dock
```

Success criteria:

- User can log money movement.
- User can log obligations.
- User can see unresolved money.
- Money items can link to QiBits/people/threads.

## Phase 5 — AI Layer

Goal:

Make AI useful and connected.

Build:

```text
Phase 5
├── AI triage
├── AI summarization
├── AI action suggestions
├── entity extraction
├── relevant knowledge retrieval
├── Ask QiLife answers
├── daily brief
└── reflection helper
```

Success criteria:

- User can paste messy input and receive suggested QiBit interpretation.
- AI can suggest actions/steps.
- AI can summarize day/thread.
- AI answer includes supporting records.

## Phase 6 — Import/Export and QiNexus Alignment

Goal:

Make data portable and aligned with the folder hierarchy.

Build:

```text
Phase 6
├── Markdown export
├── bucket-aligned paths
├── repo docs importer
├── QiNexus export mapping
├── backup/export routines
└── optional NocoDB/admin export
```

Success criteria:

- Knowledge can export to Markdown.
- QiBits can export to timeline logs.
- Repo docs can be indexed into in-app knowledge.
