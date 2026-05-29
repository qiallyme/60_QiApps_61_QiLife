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
