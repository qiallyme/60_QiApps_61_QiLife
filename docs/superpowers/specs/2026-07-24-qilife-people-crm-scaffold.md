# QiLife People / Personal CRM Module Specification

**Date**: 2026-07-24  
**Branch**: `feature/qilife-people-crm`  
**Worktree**: `C:\QiLabs\60_QiApps\61_QiLife\.worktrees\people-crm`  
**Status**: Scaffold & Domain Model Phase  

---

## 1. Executive Summary

The **QiLife People / Personal CRM** module provides a privacy-centric, evidence-backed relationship management surface integrated with the core QiLife record engine. It allows users to track personal contacts, log communication history, manage follow-ups and promises, derive actionable insights with supporting evidence, and perform reviewable manual Google Contacts synchronization.

---

## 2. Core Architectural Principles

### 2.1 Shared QiLife Record Engine
- Person records are backed by `QiRecord` with `entity_key: "person"`.
- All custom or extended person fields are stored inside `QiRecord.data`.
- Unknown or third-party JSON properties present in `QiRecord.data` are preserved during mapping (`_unknownFields`) to prevent data loss across modules.

### 2.2 Cross-Module Link References
The Person CRM is **not** an isolated data silo. Related entities are referenced using generic `RelatedRecordReference` objects:
- **Journal Entries**: Daily notes mentioning or linked to a person.
- **Tasks & Follow-ups**: Action items assigned to or involving the contact.
- **Projects**: Co-owned or related project records.
- **Threads & Communications**: Direct messages, email threads, or notes.
- **Documents & Knowledge**: Files, legal docs, or shared assets.
- **Financial Records**: Expenses, invoices, or transactions.

### 2.3 Facts vs. Notes vs. Interactions vs. Insights
1. **Facts**: Verifiable identity & contact data (legal/preferred name, email, phone numbers, postal addresses, employer, job title, birthday).
2. **User Notes**: Freeform personal context, boundaries, preferences, background, and important reminders.
3. **Interactions**: Chronological records representing communication events (`call`, `text`, `email`, `meeting`, `visit`, `favor`, `conflict`, `check_in`, `shared_event`) with direction (`inbound`, `outbound`, `mutual`, `internal_note`).
4. **Derived Insights**: System-suggested observations (e.g. "No meaningful contact in 45 days"). **Crucial**: Insights are never treated as facts. Every insight includes an `evidence` array linking back to source interactions or records, confidence scores, and user status (`active`, `dismissed`, `confirmed`).

---

## 3. Last-Contact & Relationship Calculation Logic

- `last_contact_at` is derived dynamically from qualifying interaction records where `isMeaningful === true`.
- Automated pings, marketing pings, or transactional interactions marked `isMeaningful = false` will **not** reset the last-contact relationship clock.
- Communication cadence (target frequency in days) is compared against `last_contact_at` to compute attention urgency and relationship pulse state.

---

## 4. Manual Google Contacts Sync Engine

### 4.1 Sync Scope & Privacy Boundaries
Google Contacts is treated as a portable address book target. Only portable address-book fields are candidates for synchronization:
- Names (given, family, formatted)
- Phone numbers & email addresses
- Postal addresses & birthday
- Employer & job title
- Public websites

**Strictly Excluded** from Google Sync:
- Journal entry links
- Derived relationship insights & confidence scores
- Private boundaries & personal notes
- Owed items & promises
- Financial, legal, or health records
- Cross-module links & internal tags

### 4.2 Field-Level Diff & Resolution Engine
- Pure function mapping yields `GoogleContactFieldDiff[]`.
- Field conflicts present 4 resolution strategies:
  - `keep_qilife`: Keep existing QiLife value.
  - `use_google`: Overwrite with Google Contacts value.
  - `merge`: Append or combine multi-value items (e.g. phones, emails).
  - `skip`: Ignore change for this sync pass.
- No OAuth tokens or API credentials are ever stored in client local storage, source code, or frontend environment variables.

---

## 5. UI Architecture & Components

The module lives under `src/modules/people/`:
- **Components**:
  - `PeopleList`: Tabular & card grid view with filter bar.
  - `PeopleFilters`: Category, tag, and relationship status filters.
  - `PersonDashboard`: Comprehensive tabbed profile (Overview, Interactions, Follow-ups, Related Records, Insights, Sync).
  - `PersonEditor`: Form editor for identity, contact methods, and relationship context.
  - `ContactMethodsPanel`: Multi-phone, email, address, and messaging editor.
  - `RelationshipSummary`: Cadence indicator, status, boundaries, and promised items.
  - `InteractionTimeline`: Chronological stream with filters for meaningful contact.
  - `FollowUpsPanel`: Promises owed to/by the contact.
  - `RelatedRecordsPanel`: Unified cross-module record references.
  - `InsightsPanel`: Evidence-backed insight cards with confirm/dismiss actions.
  - `GoogleContactSyncPanel`: Reviewable diff viewer and conflict resolver.
- **Widgets**:
  - `RecentContactsWidget`
  - `FollowUpsWidget`
  - `RelationshipPulseWidget`

---

## 6. Post-Journal Branch Rebase & Integration Checklist

When the Journal foundation branch is merged to `main`:
1. Rebase `feature/qilife-people-crm` onto `main`.
2. Replace local `manifest.ts` shape with shared `QiLifeModule` type.
3. Export and register People module in the global `moduleRegistry`.
4. Connect routes from `src/modules/people/routes.tsx` to the global application router.
5. Register dashboard widgets (`RecentContactsWidget`, `FollowUpsWidget`, `RelationshipPulseWidget`).
6. Run full workspace test suite to verify shared record link interoperability between Journal and People.
