# ADR 0006: Event-Driven Open Brain Ingestion & Open Loop Engine

* **Status**: Accepted
* **Date**: 2026-08-14
* **Deciders**: Qi Architecture Team & AI Reconciliation Engine

## Context

Current QiLife persistence mutated domain records directly in `qilifeStore.ts`. Intelligence services (`OpenBrainService`, `OpenLoopDetector`) operated as ad-hoc in-memory helpers instantiated by UI components. This violated the Open-Brain-First requirement where raw captures automatically trigger background classification, vector indexing, relationship extraction, and open loop derivation.

## Decision

1. **Persistent Event Log (`qilife.events`)**: All application operations (captures, updates, completions, links) emit an immutable event payload into `qilife.events`.
2. **Integrated Ingestion Lifecycle**:
   $$\text{CAPTURE} \rightarrow \text{INGEST} \rightarrow \text{QIBIT} \rightarrow \text{RELATIONSHIPS} \rightarrow \text{MEMORY} \rightarrow \text{OPERATIONAL STATE} \rightarrow \text{OPEN LOOPS} \rightarrow \text{RECOMMENDATION} \rightarrow \text{CAPABILITY} \rightarrow \text{ACTION}$$
3. **Derived Open Loops**: Open loops (`action`, `waiting`, `decision`, `blocker`) are automatically derived from captured text and events. Candidate actions maintain provenance links back to originating QiBits.
4. **Vector Memory & Search**: Embeddings are generated during ingestion and stored in Supabase `qilife.bits`, enabling vector semantic context retrieval via `251_QiApi`.

## Consequences

* Replaces direct key-value state mutations with an event-driven intelligence pipeline.
* Guarantees that no captured information or open loop falls through the cracks.
