# ADR 0008: QiFi Subsystem Reconciliation & Relational Linking

* **Status**: Accepted
* **Date**: 2026-08-14
* **Deciders**: Qi Architecture Team & AI Reconciliation Engine

## Context

QiFi (`64_QiFi`) handles private finance, double-entry ledgers, bills, and receipts. Previous attempts integrated QiFi merely as an isolated UI iframe/view within QiLife, without establishing relational links to QiLife Projects, Actions, and People at the database tier.

## Decision

1. **Native Subsystem Embedding**: QiFi views (`LedgerView`, `ReceiptInboxView`, `ReconciliationView`) are embedded natively under the `/finance` route group in QiLife.
2. **Bi-Directional Relational Linking**: Financial transactions, bills, and receipts link to QiLife Projects, Tasks, and People via the universal `qilife.entity_links` table in Supabase.
3. **API Routing**: Finance API calls execute through `251_QiApi` (`/api/finance/*`) using the signed-in user's Supabase JWT.

## Consequences

* Reconciles financial data directly into QiLife operating spaces (e.g., project dashboards showing real-time ledger expenses).
* Prevents data duplication between QiFi and QiLife stores.
