# ADR 0001: QiBit Universal Core Primitive

* **Status**: Accepted
* **Date**: 2026-08-11
* **Deciders**: Qi Architecture Team & AI Reconciliation Engine

## Context

Current QiLife relies on a generic `QiRecord` model (`id`, `owner_id`, `type`, `data` JSON blob). As QiLife evolves into a life OS (QiLife 2.0), domain entities (thoughts, journal entries, quick captures, derived actions, contacts, podcasts, notebooks) require a unified primitive that supports:

1. **Universal Taxonomy & Addressing**: `QiDecimal` classification system alongside stable UUIDs.
2. **Multi-Modal Payloads**: Structured data, raw text/markdown, vector embeddings, and media attachments.
3. **Graph Relations**: First-class directional links between any two primitives (e.g., Action $\rightarrow$ originating Thought QiBit).
4. **Provenance & Auditability**: System of record for who created/modified a QiBit (Human vs. AI Agent).

## Decision

We replace the informal `QiRecord.data` bag pattern with the **QiBit** core primitive:

```typescript
export interface QiBit {
  id: string; // Stable UUID
  qiDecimal?: string; // e.g. "10.20.100"
  type: QiBitType; // 'thought' | 'action' | 'note' | 'person' | 'project' | 'journal' | 'output'
  title: string;
  body?: string;
  metadata: Record<string, unknown>;
  provenance: {
    creator: 'user' | 'agent' | 'ingest';
    sourceSystem?: string;
    originatingQiBitIds?: string[];
    createdAt: string;
    updatedAt: string;
  };
  embedding?: number[];
}
```

## Consequences

* **Backward Compatibility**: `qilifeStore` will normalize existing `QiRecord` instances into `QiBit` structures seamlessly.
* **Database Schema**: A new migration will extend `qilife.records` with `qi_decimal`, `provenance`, and optional vector columns in Supabase.
