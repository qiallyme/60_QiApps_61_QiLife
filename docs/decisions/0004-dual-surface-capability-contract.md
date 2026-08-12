# ADR 0004: Dual-Surface Capability Contract

* **Status**: Accepted
* **Date**: 2026-08-11
* **Deciders**: Qi Architecture Team & AI Reconciliation Engine

## Context

In QiLife 1.0, UI components (`LoginPage`, `Actions`, `Projects`) directly mutated state or invoked store functions. AI capabilities were separate or purely textual. In QiLife 2.0, the UI and AI agents must share identical capability definitions.

## Decision

We adopt the **Dual-Surface Capability Contract**:

1. **Unified Capability Definition**: Every module registers its capabilities (e.g., `create_action`, `link_contact`, `summarize_journal`) with both:
   - A **UI Surface** (React components, forms, views).
   - An **Agent Tool Surface** (JSON Schema tool definitions for LLMs / AI agents).
2. **Identical Authorization**: Agent tool calls execute through the exact same permission and validation boundaries as UI form submissions.
3. **Module Registry Integration**: `src/app/moduleRegistry.ts` is updated to aggregate both route components and tool declarations.

## Consequences

* Ensures parity between what a user can click in the UI and what an AI agent can perform on their behalf.
* Simplifies security auditing and testing.
