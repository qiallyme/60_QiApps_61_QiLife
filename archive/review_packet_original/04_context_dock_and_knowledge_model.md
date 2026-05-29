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
