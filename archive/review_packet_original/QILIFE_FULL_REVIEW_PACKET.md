# QiLife Build Specs Review Packet



---

# 00_qilife_master_build_spec.md

# QiLife Master Build Spec

## Working Product Name

**QiLife**

## Operating Model

**Personal LifeDesk**

QiLife is a private, single-agent helpdesk for life. The company is Cody's life. Cody is the agent. Cody is also the primary customer. Everyone else is a related person, vendor, stakeholder, agency, court, client, household member, requester, or external party.

## Product Sentence

QiLife turns life chaos into **QiBits** that can be captured, triaged, routed, acted on, documented, resolved, reflected on, and retrieved with AI.

## Core Unit

### QiBit

A **QiBit** is one captured unit of life data.

A QiBit can become or relate to:

- task
- note
- transaction
- obligation
- calendar event
- document
- knowledge item
- thread update
- reflection
- future reminder
- daily log entry

## Core Pain Points Solved

1. No central task ledger.
2. No central "what happened today" record.
3. No central knowledge base.
4. No central note-taking/capture place.
5. No AI directly connected to the above.
6. Knowledge is separated from tools.
7. Life data is scattered across apps, memory, texts, files, calendars, docs, and panic.

## Core Doctrine

Every important item should either:

1. Start as a QiBit, or
2. Link back to a QiBit.

This preserves provenance:

- Why does this task exist?
- What triggered this obligation?
- Who/what is involved?
- What happened before and after?
- What evidence or knowledge supports this?
- What was resolved?
- What should be retrievable later?

## Lifecycle

A QiBit moves through this lifecycle:

1. Capture — what happened?
2. Bucket — where does it belong?
3. Interpret — what does it mean?
4. Relate — who/what is connected?
5. Slot — when does it matter?
6. Breakdown — how do we act?
7. Enrich — what context matters?
8. Act — what needs doing?
9. Resolve — what happened after action?
10. Reflect — what did we learn?
11. Retrieve — how do we find/use it later?

## Helpdesk Mapping

| Helpdesk Concept | QiLife Concept |
|---|---|
| Ticket | QiBit |
| Queue | Bucket |
| Department | Bucket/domain |
| Case | Thread |
| Task/work order | Action |
| Subtask | Step |
| Customer/requester | Related person/entity |
| Agent | Cody |
| SLA | due date / urgency / consequence |
| Internal note | private note / reflection |
| Knowledge article | contextual knowledge item |
| Resolution | outcome / done log |
| Related tickets | linked QiBits |
| Helpdesk sidebar | Context Dock |

## App Spine

Timeline is the spine.

The core structure is:

QiBit → Timeline → Bucket → Thread → Action → Steps → Context Dock → Resolution → Reflection → Retrieval

## Primary Views

1. Today
2. Timeline
3. Inbox
4. Threads
5. Actions
6. Calendar
7. People
8. Money
9. Knowledge
10. Documents
11. Ask QiLife
12. Settings/About

## Main UX Pattern

QiLife should use an agent-console layout:

- Left: navigation and queues/buckets
- Center: current workspace
- Right: Context Dock
- Top or bottom: persistent "What happened?" quick capture

## Knowledge Doctrine

QiLife should not depend on a separate wiki service for v1.

Knowledge should live inside QiLife and appear next to the tool/item it explains through the **Context Dock**.

Repo docs should be canonical during build and indexed/imported into the in-app knowledge layer later.

Doctrine:

**Write once in Markdown, index everywhere.**

## Build Approach

Build the spine first.

Do not start with:

- multiuser
- public sharing
- bank sync
- calendar sync
- complex permissions
- graph database
- full wiki engine
- full mobile native app
- overbuilt automations

## Initial Stack Recommendation

Frontend:

- React
- Vite
- TypeScript
- Tailwind
- TanStack Router or React Router
- TanStack Query
- Markdown renderer

Backend:

- FastAPI
- SQLite for v1
- SQLModel or SQLAlchemy
- Pydantic schemas
- REST API first

Future:

- Postgres on QiServer
- Docker Compose
- local AI / OpenAI / hybrid AI service
- embeddings and semantic search
- QiNexus Markdown exports


---

# 01_information_architecture.md

# QiLife Information Architecture

## Core Structure

QiLife is organized around QiBits, timeline, buckets, threads, actions, knowledge, and AI retrieval.

## Main Objects

```text
QiLife Data
├── QiBits
├── Buckets
├── Threads
├── Actions
├── Action Steps
├── People
├── Transactions
├── Obligations
├── Knowledge Items
├── Notes
├── Documents
├── Events
├── Reflections
├── Links
└── AI Outputs
```

## Buckets

Buckets match the real QiNexus/QiAccess folder hierarchy.

| Code | Bucket | Purpose |
|---:|---|---|
| 00 | Inbox | raw capture / unprocessed QiBits |
| 10 | Workbench | active staging and current work |
| 20 | Timeline | chronological life ledger |
| 30 | Life | personal life, routines, household, identity |
| 40 | People | people, relationships, entities |
| 50 | Business | freelance, QiAlly, ventures |
| 60 | Finance | money, transactions, obligations, accounts |
| 70 | Legal | court, filings, evidence, housing, disputes |
| 80 | Tech | QiServer, apps, repos, tools, automation |
| 90 | Assets | media, designs, brand, reusable resources |
| 100 | Data | schemas, exports, structured datasets |
| 110 | Reference | durable knowledge, rules, templates |
| 900 | Archive | inactive/historical retained material |
| 990 | System | app config, indexes, manifests, build docs |

## Operational Views vs Structural Views

### Operational Views

These are for daily use:

```text
Today
Timeline
Inbox
Threads
Actions
Calendar
People
Money
Knowledge
Documents
Ask QiLife
```

### Structural Views

These are for organizing and filtering:

```text
00 Inbox
10 Workbench
20 Timeline
30 Life
40 People
50 Business
60 Finance
70 Legal
80 Tech
90 Assets
100 Data
110 Reference
900 Archive
990 System
```

## Timeline

Timeline is both:

1. A global chronological view.
2. A bucket for pure daily-log/chonological records.

Every QiBit appears on the timeline, even if its primary bucket is Finance, Legal, People, Tech, etc.

## Threads

Threads are ongoing cases, projects, storylines, or situations.

Examples:

- Surplus Check Recovery
- Lyft Income Sprint
- QiLife Build
- Family Hub
- QiFinance Intake
- Jeep / Vehicle
- Zai Lease
- Household Ops
- QiServer Cleanup

Threads are broader than projects. A thread can be:

- case
- project
- issue
- relationship storyline
- ongoing obligation
- recurring situation

## Links

Links create exact relationships between records.

Examples:

- QiBit created Action
- Knowledge Item explains Thread
- Document supports QiBit
- Person is involved in Action
- Transaction resolves Obligation

Tags are for loose retrieval. Links are for known structure.

## Tags

Tags support flexible search and AI retrieval.

Examples:

- gas
- lyft
- surplus-check
- court
- family-ops
- qiserver
- receipt
- waiting-on

Tags should not replace links.


---

# 02_qibit_lifecycle.md

# QiBit Lifecycle

## Definition

A QiBit is one captured unit of life data.

It begins with:

**What happened?**

It may become a task, note, action, thread update, transaction, obligation, document reference, knowledge item, event, reminder, reflection, or no-action log.

## Lifecycle Questions

| Question | Function | Output |
|---|---|---|
| What? | Capture | raw capture, title, summary |
| Where? | Bucket | area/domain |
| Why? | Interpret | meaning, importance, consequence |
| Who? | Relate | people/entities |
| When? | Slot | date, schedule, future slot |
| How? | Breakdown | action, steps, process |
| Because? | Enrich | knowledge, documents, evidence |
| Then? | Act | action/task/work item |
| Done? | Resolve | outcome/completion |
| So what? | Reflect | lesson/pattern/decision |
| Find later? | Retrieve | tags, links, AI memory |

## QiBit Statuses

```text
new
triaged
open
in_progress
waiting_on
scheduled
resolved
closed
reference
ignored
archived
```

## Priority

Priority should be consequence-based.

| Priority | Meaning |
|---|---|
| critical | money/legal/safety/deadline risk |
| high | meaningful consequence soon |
| normal | needs handling but not on fire |
| low | useful but not required |
| someday | parking lot |

## Future Slots

```text
today
this_week
scheduled
waiting_on
someday
knowledge_base
archive
ignore
```

## QiBit Detail Page Sections

```text
QiBit Detail
├── What Happened
├── What It Means
├── Bucket / Queue
├── Thread / Case
├── Related People / Entities
├── Related Documents
├── Related Money
├── Action Required
├── Actions
├── Steps
├── Future Slot
├── Resolution
├── Reflection
└── Retrieval Tags / Links
```

## Example QiBit

Raw capture:

"Zai owes me $40 for gas."

Interpreted:

- What happened: Cody fronted or tracked gas involving Zai.
- Meaning: open reimbursement obligation.
- Bucket: 60 Finance.
- Related person: Zai.
- Action required: yes.
- Action: confirm/collect repayment.
- Future slot: waiting_on.
- Related money: obligation for $40.
- Retrieval: who owes me money, gas, Zai, reimbursement.


---

# 03_app_flow_and_screens.md

# QiLife App Flow and Screens

## Main System Flow

```text
REAL LIFE
  ↓
What Happened?
  ↓
QiBit Capture
  ↓
Triage / Interpret
  ↓
Bucket + Thread + People + Meaning
  ↓
Action Required?
  ├── No → Save as Knowledge / Log / Reference
  └── Yes → Create Action → Add Steps → Slot in Time
  ↓
Work / Waiting / Done
  ↓
Resolution
  ↓
Reflection
  ↓
Retrieval through Timeline / Search / AI
```

## App Shell

```text
┌────────────────────────────────────────────────────────────────────┐
│ Top Bar: Search | Quick Capture | Ask QiLife | Notifications      │
├───────────────┬───────────────────────────────────┬────────────────┤
│ Left Nav      │ Center Workspace                  │ Right Panel    │
│               │                                   │ Context Dock   │
│ - Today       │ Selected View                     │ - Knowledge    │
│ - Timeline    │                                   │ - Related bits │
│ - Inbox       │                                   │ - People       │
│ - Threads     │                                   │ - Docs         │
│ - Actions     │                                   │ - Money        │
│ - Calendar    │                                   │ - AI summary   │
│ - People      │                                   │ - Reflection   │
│ - Money       │                                   │                │
│ - Knowledge   │                                   │                │
│ - Documents   │                                   │                │
│ - Ask QiLife  │                                   │                │
└───────────────┴───────────────────────────────────┴────────────────┘
```

## Today

Purpose: command center.

Sections:

```text
Today
├── Quick Capture
├── AI Focus Summary
├── Due / Scheduled Actions
├── Open Loops
├── Waiting On
├── Today's QiBits
├── Money Today
├── People Touched Today
├── Thread Updates
└── Reflection Prompt
```

Question answered:

**What matters right now?**

## Timeline

Purpose: chronological truth.

Sections:

```text
Timeline
├── Filter Bar
│   ├── Date
│   ├── Bucket
│   ├── Thread
│   ├── Person
│   ├── Type
│   └── Status
├── Timeline Feed
│   ├── QiBit cards
│   ├── Actions
│   ├── Transactions
│   ├── Notes
│   ├── Documents
│   └── Resolutions
└── Timeline Detail Drawer
```

Question answered:

**What happened?**

## Inbox

Purpose: chaos catcher.

Sections:

```text
Inbox
├── Quick capture input
├── Voice / text / file import placeholder
├── Unprocessed QiBits
├── AI Triage Suggestions placeholder
└── Bulk Process / Review
```

Question answered:

**What have I not processed yet?**

## Threads

Purpose: ongoing cases/projects/storylines.

Sections:

```text
Threads
├── Thread List
├── Thread Status
├── Related QiBits
├── Related Actions
├── Related People
├── Related Money
├── Related Documents
├── AI Summary
└── Context Dock
```

Question answered:

**What is going on with this whole situation?**

## Actions

Purpose: execution/task ledger.

Sections:

```text
Actions
├── Today
├── Next
├── Waiting
├── Scheduled
├── Done
├── By Bucket
├── By Thread
├── By Person
└── By Context
```

Question answered:

**What do I need to do?**

## Calendar

Purpose: time placement.

Sections:

```text
Calendar
├── Day view
├── Week view
├── Month view
├── Scheduled actions
├── Events
├── Time blocks / timetables
└── Map-linked errands placeholder
```

Question answered:

**When does this happen?**

## People

Purpose: lightweight context for humans/entities.

Sections:

```text
People
├── Person list
└── Person detail
    ├── Notes
    ├── Related QiBits
    ├── Threads
    ├── Actions
    ├── Money
    ├── Documents
    └── Activity log
```

Question answered:

**Who is involved and what is the history?**

## Money

Purpose: transactions and obligations.

Sections:

```text
Money
├── Transactions
├── Obligations
├── Who owes me
├── Who I owe
├── Budget buckets
├── Recurring items
└── Money-related threads
```

Question answered:

**What moved, what is owed, and what is unresolved?**

## Knowledge

Purpose: contextual knowledge, not separate wiki-land.

Sections:

```text
Knowledge
├── Global knowledge items
├── Bucket knowledge
├── Thread knowledge
├── Rules / procedures / notes
├── Search
└── Linked contextual usage
```

Question answered:

**What do I know that matters here?**

## Ask QiLife

Purpose: AI-connected retrieval and guidance.

Sections:

```text
Ask QiLife
├── Ask anything box
├── Suggested prompts
├── AI answer
├── Supporting records
├── Suggested next actions
└── Save answer as note / knowledge / action
```

Question answered:

**Help me cut through the noise.**


---

# 04_context_dock_and_knowledge_model.md

# Context Dock and Knowledge Model

## Core Doctrine

QiLife does not separate doing from knowing.

Every major tool view should have a **Context Dock** showing the knowledge, notes, documents, history, related QiBits, people, money, and AI interpretation relevant to the current item.

## Why Not a Separate Wiki

A separate wiki creates separation:

- task over here
- note over there
- doc somewhere else
- knowledge in a wiki
- AI floating beside everything

QiLife should embed knowledge next to the work.

## Context Dock

The Context Dock is the right-side panel in the app shell.

It can show:

```text
Context Dock
├── AI Summary
├── Relevant Knowledge
├── Related QiBits
├── Related Actions
├── Related People / Entities
├── Related Documents
├── Related Transactions / Obligations
├── Related Notes
├── Prior Resolutions
├── Reflection Prompts
└── Retrieval Tags / Links
```

## Work Modes

Each major screen should support:

```text
Work Mode
Context Mode
Deep Knowledge Mode
```

### Work Mode

Knowledge dock collapsed/minimal.

### Context Mode

Tool and knowledge side by side.

### Deep Knowledge Mode

Full-screen reading/editing of knowledge.

## Knowledge Source Doctrine

Repo docs are canonical during build.

In-app knowledge mirrors/imports/indexes them.

Doctrine:

**Write once in Markdown, index everywhere.**

## Knowledge Types

```text
rule
procedure
reference
decision
note
summary
explanation
template
runbook
doctrine
```

## Knowledge Item Fields

```text
knowledge_items
├── id
├── title
├── body_markdown
├── bucket_code
├── module_key
├── knowledge_type
├── source_type
├── source_path
├── confidence
├── visibility
├── tags
├── last_synced_at
├── sync_hash
├── created_at
└── updated_at
```

## Source Types

```text
manual
ai
imported
document
repo_doc
qibits_summary
```

## Confidence

```text
confirmed
inferred
draft
outdated
```

## Visibility

```text
private
shareable
archived
system
```

## Links vs Tags

### Links

Use links for known relationships.

Examples:

- Knowledge item explains Thread.
- Document supports QiBit.
- Action came from QiBit.
- Person is involved in Obligation.

### Tags

Use tags for loose retrieval.

Examples:

- gas
- lyft
- court
- qiserver
- receipt
- family-ops

Tags alone are not enough. Links give structure.

## Knowledge Retrieval Order

When opening an object, the Context Dock should retrieve context in this order:

1. Directly linked knowledge.
2. Knowledge linked to same thread.
3. Knowledge linked to same bucket.
4. Knowledge linked to same person/entity.
5. Knowledge with shared tags.
6. AI semantic similarity later.

## Repo Docs in App

Repo docs live in:

```text
qilife/docs/
```

QiLife imports/indexes them into in-app knowledge:

```text
Repo Markdown Docs
        ↓
Knowledge Importer / Indexer
        ↓
In-App Knowledge Items
        ↓
Context Dock / Search / Ask QiLife
```

This keeps build docs useful for Codex while still making them viewable inside QiLife.


---

# 05_data_model_spine.md

# QiLife Data Model Spine

## Core Tables for V1

```text
qibits
buckets
threads
actions
action_steps
people
transactions
obligations
knowledge_items
notes
documents
events
reflections
links
ai_outputs
activity_log
```

## qibits

```text
qibits
├── id
├── title
├── raw_capture
├── summary
├── meaning
├── qibit_type
├── bucket_code
├── thread_id
├── importance
├── priority
├── emotional_load
├── action_required
├── suggested_action
├── future_slot
├── status
├── happened_at
├── captured_at
├── resolved_at
├── retrieval_summary
├── reflection
├── created_at
└── updated_at
```

Types:

```text
event
note
message
call
problem
idea
decision
task_seed
transaction_seed
obligation_seed
document_seed
appointment
receipt
knowledge
reflection
other
```

Statuses:

```text
new
triaged
open
in_progress
waiting_on
scheduled
resolved
closed
reference
ignored
archived
```

## buckets

```text
buckets
├── code
├── name
├── slug
├── folder_path
├── sort_order
├── description
├── created_at
└── updated_at
```

Seed buckets:

```text
00 Inbox
10 Workbench
20 Timeline
30 Life
40 People
50 Business
60 Finance
70 Legal
80 Tech
90 Assets
100 Data
110 Reference
900 Archive
990 System
```

## threads

```text
threads
├── id
├── title
├── description
├── bucket_code
├── status
├── priority
├── next_action
├── due_date
├── started_at
├── closed_at
├── created_at
└── updated_at
```

Statuses:

```text
active
waiting
paused
resolved
archived
```

## actions

```text
actions
├── id
├── title
├── description
├── source_qibit_id
├── bucket_code
├── thread_id
├── status
├── priority
├── energy
├── context
├── due_date
├── scheduled_for
├── completed_at
├── created_at
└── updated_at
```

Statuses:

```text
inbox
open
next
in_progress
waiting
blocked
scheduled
done
archived
```

Contexts:

```text
phone
home
computer
errands
car
anywhere
```

## action_steps

```text
action_steps
├── id
├── action_id
├── title
├── description
├── status
├── sort_order
├── completed_at
├── created_at
└── updated_at
```

## people

```text
people
├── id
├── display_name
├── legal_name
├── type
├── relationship
├── email
├── phone
├── address
├── notes
├── created_at
└── updated_at
```

Types:

```text
person
company
agency
vendor
court
client
household
platform
app_service
other
```

## transactions

```text
transactions
├── id
├── date
├── amount
├── currency
├── direction
├── from_label
├── to_label
├── category
├── bucket_code
├── thread_id
├── status
├── notes
├── evidence_document_id
├── created_at
└── updated_at
```

Directions:

```text
in
out
transfer
```

Statuses:

```text
pending
cleared
disputed
canceled
```

## obligations

```text
obligations
├── id
├── owed_by_label
├── owed_to_label
├── obligation_type
├── amount
├── currency
├── reason
├── status
├── due_date
├── related_transaction_id
├── source_qibit_id
├── created_at
└── updated_at
```

Types:

```text
money
document
task
response
decision
other
```

Statuses:

```text
open
partial
resolved
canceled
disputed
```

## knowledge_items

```text
knowledge_items
├── id
├── title
├── body_markdown
├── bucket_code
├── module_key
├── knowledge_type
├── source_type
├── source_path
├── confidence
├── visibility
├── tags
├── last_synced_at
├── sync_hash
├── created_at
└── updated_at
```

## links

```text
links
├── id
├── source_type
├── source_id
├── target_type
├── target_id
├── relationship
├── created_at
└── updated_at
```

Relationship examples:

```text
created_from
relates_to
explains
supports
blocks
resolves
mentions
belongs_to
waiting_on
caused_by
evidence_for
```

## ai_outputs

```text
ai_outputs
├── id
├── source_type
├── source_id
├── ai_task
├── prompt_snapshot
├── output_json
├── confidence
├── accepted
├── created_at
└── updated_at
```

AI tasks:

```text
interpret_qibit
extract_entities
suggest_actions
generate_steps
summarize_day
summarize_thread
find_relevant_knowledge
suggest_future_slot
answer_life_query
generate_reflection
```


---

# 06_ai_layer_blueprint.md

# QiLife AI Layer Blueprint

## Principle

AI should be directly connected to the life ledger.

It should not be a chatbot floating beside the app.

AI should read, summarize, classify, retrieve, and eventually update:

- QiBits
- timeline
- buckets
- threads
- actions
- people
- transactions
- obligations
- documents
- knowledge
- notes
- reflections

## V1 AI Behavior

V1 can use placeholders and mock responses, but the service boundaries should exist from the beginning.

## AI Service Functions

```text
interpret_qibit
extract_related_entities
suggest_actions
generate_action_steps
find_relevant_knowledge
suggest_future_slot
summarize_day
summarize_thread
extract_transaction_from_text
extract_obligation_from_text
answer_life_query
generate_reflection_prompt
```

## AI Workflow

```text
Raw Capture
  ↓
interpret_qibit
  ↓
extract_related_entities
  ↓
suggest_actions
  ↓
generate_action_steps
  ↓
find_relevant_knowledge
  ↓
suggest_future_slot
  ↓
user review/approval
  ↓
records created/updated
```

## Human Review Required

AI should suggest. Cody approves.

For v1, AI should not silently create or modify important records without a review step.

## Ask QiLife

Ask QiLife is the query interface.

Example questions:

- What happened today?
- What matters right now?
- What am I waiting on?
- Who owes me money?
- What tasks involve Zai?
- What legal items are open?
- What is the next action on the surplus check?
- What did I spend on gas this week?
- Turn this rant into QiBits, actions, and notes.
- What is real, what is noise, and what do I do next?

## AI Response Shape

AI answers should include:

```text
answer
supporting_records
suggested_actions
related_people
related_threads
confidence
save_options
```

## Save Options

AI output should be savable as:

- note
- knowledge item
- action
- QiBit
- thread summary
- reflection
- daily log summary

## Retrieval Sources

AI retrieval should search:

1. Direct links.
2. Same thread.
3. Same bucket.
4. Same person/entity.
5. Tags.
6. Text search.
7. Embeddings later.

## Future AI Enhancements

- embeddings
- semantic search
- local Ollama integration
- OpenAI API option
- voice capture parsing
- document parsing/OCR integration
- periodic daily summaries
- weekly reviews
- contradiction detection
- unresolved-loop detection


---

# 07_module_map.md

# QiLife Module Map

## Module List

```text
QiLife Modules
├── App Shell
├── Quick Capture
├── QiBits
├── Timeline
├── Inbox
├── Buckets
├── Threads
├── Actions
├── Calendar
├── People
├── Money
├── Knowledge
├── Documents
├── Context Dock
├── Ask QiLife
├── Settings/About
└── Import/Export
```

## App Shell

Responsibilities:

- global layout
- left navigation
- top search/capture
- center workspace
- Context Dock
- responsive behavior

## Quick Capture

Responsibilities:

- "What happened?" input
- create raw QiBit
- capture source
- optional voice/file placeholders
- send to AI triage placeholder

## QiBits

Responsibilities:

- central life item/ticket model
- detail page
- lifecycle status
- triage fields
- links to all related records

## Timeline

Responsibilities:

- chronological feed
- daily log
- filters
- timeline detail drawer
- "what happened today" view

## Inbox

Responsibilities:

- unprocessed QiBits
- bulk triage
- AI suggestions placeholder
- route to bucket/thread/action/knowledge

## Buckets

Responsibilities:

- top-level structure
- filter by domain
- match QiNexus hierarchy
- support bucket-specific knowledge

## Threads

Responsibilities:

- ongoing cases/projects/storylines
- group related QiBits/actions/money/docs
- thread status and summary
- Context Dock

## Actions

Responsibilities:

- task ledger
- action detail
- steps/subtasks
- status, priority, due/scheduled fields
- views by today, waiting, scheduled, done, bucket, thread, person

## Calendar

Responsibilities:

- scheduled actions
- events
- day/week/month views
- future slotting
- timetables/routines later

## People

Responsibilities:

- lightweight person/entity records
- relationship context
- linked QiBits/actions/threads/money/docs
- no CRM pipeline

## Money

Responsibilities:

- transactions
- obligations
- who owes me
- who I owe
- budget buckets later
- recurring items later

## Knowledge

Responsibilities:

- central navigable knowledge base
- Markdown display/edit
- bucket/module/entity links
- repo docs importer later
- Context Dock source

## Documents

Responsibilities:

- document metadata
- file path/source tracking
- link docs to QiBits/threads/actions/people/money
- no full OCR in v1

## Context Dock

Responsibilities:

- show side-by-side knowledge/context
- related QiBits
- related actions
- people
- docs
- money
- AI summary
- reflection prompts

## Ask QiLife

Responsibilities:

- AI chat/query interface
- retrieval over app data
- suggested actions
- save AI response as record

## Settings/About

Responsibilities:

- app metadata
- source/inspiration notes
- import/export settings
- local data location
- future AI settings

About text should include:

QiLife is Cody's personal local-first LifeOps / Personal LifeDesk system. It is inspired by helpdesk workflows and the visual planning feel of Will Be Done. Will Be Done source: https://github.com/will-be-done/will-be-done


---

# 08_build_phases.md

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


---

# 09_codex_research_prompt_will_be_done.md

# Codex Prompt — Will Be Done Research Pass

Research and inspect the Will Be Done repository at:

https://github.com/will-be-done/will-be-done

Do not fork, copy code, or modify files yet.

Goal:

Evaluate Will Be Done as a UX and architecture reference for QiLife.

QiLife is Cody's personal local-first LifeOps / Personal LifeDesk app. It is inspired by helpdesk workflows and Will Be Done's weekly planning feel, but QiLife has a broader data model: QiBits, timeline, buckets, threads, actions, people, money, obligations, notes, documents, knowledge, Context Dock, and AI-assisted triage/retrieval.

Investigate:

1. Frontend stack and component organization.
2. Weekly timeline implementation.
3. Task drag/drop implementation.
4. Project/board model.
5. Quick capture/stash implementation.
6. Local-first/offline data layer.
7. Docker/self-hosted deployment.
8. API/MCP possibilities.
9. AGPL/source attribution implications.
10. What ideas can be emulated without copying code.
11. Whether a personal fork would be safe/useful, or whether QiLife should be a clean separate build.

Deliver:

- repo structure summary
- stack summary
- data model summary if discoverable
- UX patterns to emulate
- code areas not to touch/copy yet
- license notes
- recommendation: fork, reference only, or clean-room rebuild
- QiLife implementation implications

Do not modify files.


---

# 10_codex_build_prompt_v1.md

# Codex Prompt — QiLife V1 Build

Create a local-first personal LifeOps app called **QiLife**.

QiLife is not a generic todo app, CRM, finance app, or wiki. It is Cody's private **Personal LifeDesk**: a single-agent helpdesk for life.

Core metaphor:

- QiBit = ticket / captured life item
- Bucket = queue / department
- Thread = case / project / storyline
- Action = task / work order
- Step = subtask
- Context Dock = side knowledge panel
- Resolution = outcome
- Reflection = lesson/pattern
- Ask QiLife = AI assistant connected to the app data

Core product sentence:

QiLife turns life chaos into QiBits that can be captured, triaged, routed, acted on, documented, resolved, reflected on, and retrieved with AI.

Primary pain points:

1. No central task ledger.
2. No central "what happened today" log.
3. No central knowledge base.
4. No central note-taking/capture place.
5. No AI directly connected to all of the above.
6. Knowledge is separated from tools.

Tech stack:

- Frontend: React + Vite + TypeScript
- Styling: Tailwind
- Backend: FastAPI
- Database: SQLite for v1
- ORM: SQLModel or SQLAlchemy
- API: REST
- Markdown rendering for knowledge
- No auth for v1
- No bank sync
- No external calendar sync
- No real AI API key required yet
- AI functions can be placeholders/mocks in v1
- Prepare for future Docker deployment
- Prepare for future Postgres migration

Core V1 modules:

1. App Shell
2. Quick Capture
3. QiBits
4. Timeline
5. Inbox
6. Buckets
7. Threads
8. Actions
9. Action Steps
10. People
11. Money
12. Knowledge
13. Documents
14. Context Dock
15. Ask QiLife
16. Settings/About

Main app layout:

- Left nav
- Center workspace
- Right Context Dock
- Persistent quick capture for "What happened?"

Primary nav:

- Today
- Timeline
- Inbox
- Threads
- Actions
- Calendar
- People
- Money
- Knowledge
- Documents
- Ask QiLife
- Settings

Bucket seeds:

- 00 Inbox
- 10 Workbench
- 20 Timeline
- 30 Life
- 40 People
- 50 Business
- 60 Finance
- 70 Legal
- 80 Tech
- 90 Assets
- 100 Data
- 110 Reference
- 900 Archive
- 990 System

Core tables:

- qibits
- buckets
- threads
- actions
- action_steps
- people
- transactions
- obligations
- knowledge_items
- notes
- documents
- events
- reflections
- links
- ai_outputs
- activity_log

Implement CRUD APIs for the core records.

Implement the `links` table to connect any record to any other record.

QiBit fields:

- id
- title
- raw_capture
- summary
- meaning
- qibit_type
- bucket_code
- thread_id
- importance
- priority
- emotional_load
- action_required
- suggested_action
- future_slot
- status
- happened_at
- captured_at
- resolved_at
- retrieval_summary
- reflection
- created_at
- updated_at

QiBit statuses:

- new
- triaged
- open
- in_progress
- waiting_on
- scheduled
- resolved
- closed
- reference
- ignored
- archived

Action fields:

- id
- title
- description
- source_qibit_id
- bucket_code
- thread_id
- status
- priority
- energy
- context
- due_date
- scheduled_for
- completed_at
- created_at
- updated_at

Knowledge fields:

- id
- title
- body_markdown
- bucket_code
- module_key
- knowledge_type
- source_type
- source_path
- confidence
- visibility
- tags
- last_synced_at
- sync_hash
- created_at
- updated_at

Context Dock:

Every major object detail page should include or support the Context Dock. The dock should show placeholders or real linked records for:

- AI summary
- relevant knowledge
- related QiBits
- related actions
- related people/entities
- related documents
- related transactions/obligations
- notes
- reflection prompts

AI placeholder service:

Create service functions with mock outputs:

- interpret_qibit
- extract_related_entities
- suggest_actions
- generate_action_steps
- find_relevant_knowledge
- suggest_future_slot
- summarize_day
- summarize_thread
- extract_transaction_from_text
- extract_obligation_from_text
- answer_life_query
- generate_reflection_prompt

Frontend pages:

1. Today
   - quick capture
   - AI focus summary placeholder
   - due/scheduled actions
   - open loops
   - waiting on
   - today's QiBits
   - money today
   - thread updates
   - reflection prompt

2. Timeline
   - chronological QiBit feed
   - filters by date, bucket, thread, person, type, status

3. Inbox
   - unprocessed QiBits
   - quick capture
   - process with AI placeholder

4. Threads
   - list/detail
   - related QiBits/actions/people/money/docs
   - Context Dock

5. Actions
   - today, next, waiting, scheduled, done, by bucket, by thread, by person

6. Calendar
   - basic day/week/month placeholder
   - scheduled actions/events

7. People
   - lightweight person/entity records
   - no CRM pipeline
   - related QiBits/actions/threads/money/docs

8. Money
   - transactions
   - obligations
   - who owes me
   - who I owe

9. Knowledge
   - central searchable/navigable Markdown knowledge items
   - bucket/module filters

10. Documents
   - metadata table and list/detail
   - no OCR required in v1

11. Ask QiLife
   - question box
   - mock answer
   - supporting records placeholder
   - save answer as note/knowledge/action placeholder

12. Settings/About
   - explain QiLife purpose
   - mention Will Be Done as visual planning inspiration
   - include source link: https://github.com/will-be-done/will-be-done
   - include local-first/personal-use note

Seed data:

- Person: Cody
- Person: Zaituallah Jan Khebarkhil
- Project/thread: Lyft Income Sprint
- Project/thread: Surplus Check Recovery
- Project/thread: QiLife Build
- Project/thread: QiFinance Intake
- Action: Finish 11 Lyft rides
- Action: Check mail for surplus check
- QiBit: QiLife needs one central place for tasks, daily log, knowledge, notes, and AI
- Obligation: Zai owes Cody $40 for gas
- Transaction: Cody paid gas for Lyft
- Knowledge item: QiBit lifecycle doctrine

Design requirements:

- dark mode first
- clean cards with depth
- agent-console feel
- visual timeline
- low cognitive clutter
- mobile usable
- quick capture always visible
- Context Dock collapsible
- no ugly plain white cards
- no enterprise clutter

Deliver:

- working local dev app
- README with setup commands
- docs folder with architecture notes
- seeded SQLite database
- clear dev commands
- no real AI key required
- no auth required
- do not overbuild beyond the spine
