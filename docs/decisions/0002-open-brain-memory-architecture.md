# ADR 0002: Open Brain Memory Architecture

* **Status**: Accepted
* **Date**: 2026-08-11
* **Deciders**: Qi Architecture Team & AI Reconciliation Engine

## Context

QiLife 1.0 treated persistence as key-value domain record lookup. QiLife 2.0 requires an **Open Brain** memory architecture that provides semantic memory across all stored QiBits, open loops, relationships, and historical reflections.

## Decision

We adopt the **Open Brain** memory architecture layered on top of Supabase and local storage:

1. **Semantic Search & Embeddings**: QiBits generate embeddings during capture or background ingest.
2. **Graph Context Engine**: Cross-bit relationship traversal via normalization of target `QiBit` IDs.
3. **Open Loop Detector**: Automatic derivation of active open loops across captured QiBits without requiring manual tagging.
4. **Local & Edge Querying**: High-frequency memory lookups executed in-memory or at Cloudflare Worker edge; deep semantic queries delegated to Supabase/QiRunner.

## Consequences

* Enables instant contextual retrieval for AI assistant capabilities.
* Decouples raw input capture from structured synthesis.
