# ADR 0005: QiDecimal Identity Format & Universal QiBit Envelope Standard

* **Status**: Accepted
* **Date**: 2026-08-14
* **Deciders**: Qi Architecture Team & AI Reconciliation Engine

## Context

QiCode Title 00 (§ 00.01.006) and Title 01 (§ 1.10.002) establish that all entities in the Qi ecosystem must carry a globally unique `QiDecimal` identifier to preserve realm, category, and entry identity across migrations, reorganizations, and storage engines. 

Historical documentation contains slight variations in formatting (e.g. `1.21.1`, `00.01.002`, and `10.20.100`). QiLife requires a precise runtime QiDecimal format for `qilife.bits` that cleanly maps to `qilife` application domains while supporting UUID v4 primary keys for relational engine performance.

## Decision

1. **Format Standardization**: Runtime QiDecimal identifiers for `qilife.bits` follow the 3-segment dot notation:
   `[Realm: 2 digits].[Category: 2 digits].[EntrySequence: 3+ digits]`
   - **Realm 61**: QiLife Application Space (e.g. `61.xx.xxx`)
   - **Categories**:
     - `61.10`: Ingest & Raw Captures (`qibit`, `capture`)
     - `61.20`: Actions & Commitments (`task`, `action`)
     - `61.30`: Projects & Operating Spaces (`project`)
     - `61.40`: People & Personal CRM (`person`)
     - `61.50`: Journal & Reflections (`journal`)
     - `61.60`: Finance & Accounts (`expense`, `account`, `bill`)
     - `61.70`: Knowledge, Notebooks & Outputs (`notebook`, `document`, `podcast`, `output`)
   - **Example**: `61.20.101` represents a QiLife Action.

2. **Universal QiBit Envelope**: Every persisted item MUST conform to the Universal `QiBit` Envelope:
   - `id`: UUID v4 primary key
   - `qi_decimal`: Structured QiDecimal string (e.g., `61.20.101`)
   - `type`: `QiBitType`
   - `title` & `body`: Primary textual content
   - `metadata`: Domain-specific attributes
   - `provenance`: Originating system, creator (`user` | `agent` | `ingest`), timestamps, and parent `originating_qibit_ids`
   - `memory_state`: `transient` | `promoted` | `archived` | `superseded`

## Consequences

* Provides immutable namespace addressing across all stored objects in Supabase `qilife.bits`.
* Resolves identity discrepancies between legacy `QiRecord` JSON bags and structured QiCode standards.
