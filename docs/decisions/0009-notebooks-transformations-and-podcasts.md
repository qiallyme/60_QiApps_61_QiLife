# ADR 0009: Open Notebooks, Multi-Modal Transformations & Podcast Engine

* **Status**: Accepted
* **Date**: 2026-08-14
* **Deciders**: Qi Architecture Team & AI Reconciliation Engine

## Context

QiLife 2.0 requires native knowledge research tools (**Open Notebooks**) and multi-modal output generation (summaries, briefs, audio podcasts). Generated outputs must remain connected as first-class QiBits to their originating source material.

## Decision

1. **Open Notebook Workspaces**: Notebooks function as curated workspaces over QiBits and source documents, enabling synthesis without duplicating underlying data.
2. **Transformation Outputs**: Generated summaries, briefings, outlines, and audio podcasts are stored as first-class `podcast` / `output` QiBits in `qilife.bits`.
3. **Source Provenance**: Every generated output preserves immutable links to its source material in `provenance.originatingQiBitIds`.

## Consequences

* Enables Open Notebook knowledge workflows and automated audio briefings.
* Ensures strict provenance tracking for AI-derived outputs.
