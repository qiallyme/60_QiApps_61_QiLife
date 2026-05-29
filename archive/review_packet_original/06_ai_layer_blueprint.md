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
