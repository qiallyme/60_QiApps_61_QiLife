# ADR 0007: Dual-Surface Capability Contract & Execution Parity

* **Status**: Accepted
* **Date**: 2026-08-14
* **Deciders**: Qi Architecture Team & AI Reconciliation Engine

## Context

In previous iterations, React UI components directly called repository classes (`actionRepository`, `projectRepository`), bypassing `CapabilityEngine`. This caused behavioral and security drift between manual UI form submissions and AI subagent tool calls.

## Decision

1. **Single Capability Execution Pipeline**: All application mutations MUST execute through `CapabilityEngine.executeCapability()`.
2. **Dual-Surface Registration**: Modules register capabilities with both a UI form/view and a JSON Schema tool definition for AI agents.
3. **Consequential Action Guardrails**: Capabilities flagged with `consequential: true` (modifying database state, sending external communications, deleting data) require explicit human authorization flags before execution.

## Consequences

* Enforces 1:1 parity between UI actions and AI agent capability executions.
* Centralizes authorization checks, validation, and audit logging into a single backend layer.
