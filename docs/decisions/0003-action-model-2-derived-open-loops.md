# ADR 0003: Action Model 2.0 — Derived Open Loops & Execution Boundaries

* **Status**: Accepted
* **Date**: 2026-08-11
* **Deciders**: Qi Architecture Team & AI Reconciliation Engine

## Context

In QiLife 1.0, actions were static items created manually by filling out forms. In QiLife 2.0, actions can be detected automatically from captured QiBits (emails, transcriptions, quick notes, meeting records). 

However, AI agents must not execute consequential tasks without explicit human authorization.

## Decision

We establish **Action Model 2.0**:

1. **Lifecycle Progression**: `Raw Capture` $\rightarrow$ `Intent / Open Loop` $\rightarrow$ `Candidate Action` $\rightarrow$ `Authorized Action` $\rightarrow$ `Execution`.
2. **AI Generation**: AI agents can detect open loops and propose candidate actions with pre-filled parameters.
3. **Authorization Boundary**: Any action that causes external side-effects (sending emails, modifying records, external APIs) remains in `Candidate` status until explicitly confirmed by the user.
4. **Provenance Linkage**: Every action maintains an immutable link back to its originating `QiBit` IDs (`originatingQiBitIds`).

## Consequences

* Eliminates manual task entry overhead while safeguarding against unprompted side effects.
* Keeps human-in-the-loop governance explicit.
