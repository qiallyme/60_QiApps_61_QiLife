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
