# QiLife People / Personal CRM Module

A privacy-centric, evidence-backed relationship management module integrated with the core QiLife record engine.

## 📌 Module Responsibilities

1. **Personal Contact Management**: Names, multi-method communication details (emails, phones, addresses, social profiles), organizations, and job titles.
2. **Relationship & Cadence Tracking**: Communication target frequencies, boundaries, promises, owed items, and automated cadence pulse (`healthy`, `due`, `overdue`, `dormant`).
3. **Interaction Timeline**: Chronological stream of communication events with direction (`inbound`, `outbound`, `mutual`, `internal_note`) and meaningful-contact filtering.
4. **Evidence-Backed Insights**: System-derived relationship observations linked directly to source records and interactions with confidence scores and user status (`active`, `dismissed`, `confirmed`).
5. **Cross-Module Link References**: Unified cross-module record views (`RelatedRecordReference`) linking contacts to Journal entries, Tasks, Projects, Threads, Documents, and Financial records.
6. **Reviewable Google Contacts Sync Engine**: Pure mapping and field-level diff engine (`GoogleContactFieldDiff`) with explicit user resolution policies (`keep_qilife`, `use_google`, `merge`, `skip`).

---

## 🏗 Directory Structure

```text
src/modules/people/
├── components/                 # UI components
│   ├── ContactMethodsPanel.tsx
│   ├── FollowUpsPanel.tsx
│   ├── GoogleContactSyncPanel.tsx
│   ├── InsightsPanel.tsx
│   ├── InteractionTimeline.tsx
│   ├── PeopleFilters.tsx
│   ├── PeopleList.tsx
│   ├── PersonDashboard.tsx
│   ├── PersonEditor.tsx
│   ├── RelatedRecordsPanel.tsx
│   └── RelationshipSummary.tsx
├── hooks/                      # React custom hooks
│   ├── useGoogleContactSync.ts
│   ├── usePeople.ts
│   ├── usePerson.ts
│   └── usePersonInteractions.ts
├── services/                   # Pure domain logic & mapping services
│   ├── googleContactDiff.ts
│   ├── googleContactMapper.ts
│   ├── googleContactsGateway.ts
│   ├── insightService.ts
│   ├── interactionService.ts
│   ├── peopleRepository.ts
│   ├── personRecordMapper.ts
│   └── relationshipService.ts
├── store/
│   └── peopleStore.ts
├── widgets/                    # Dashboard widgets
│   ├── FollowUpsWidget.tsx
│   ├── RecentContactsWidget.tsx
│   └── RelationshipPulseWidget.tsx
├── fixtures.ts                 # Development fixtures
├── manifest.ts                 # Local module manifest seam
├── routes.tsx                  # URL-first route declarations
└── types.ts                    # Core TypeScript domain contracts
```

---

## 🛡 Security & Privacy Rules

- **No OAuth Tokens**: OAuth tokens and API secrets must never be placed in local storage, source code, or frontend environment variables.
- **Privacy Boundaries**: Journal links, private notes, relationship insights, promises, financial, or health items are **never** synced to Google Contacts.
- **Unknown JSON Field Preservation**: `personRecordMapper` preserves all unmapped JSON fields (`_unknownFields`) when editing records to prevent data loss across QiLife modules.

---

## 🧪 Pure Service Unit Testing Strategy

When unit tests are executed:
- **`personRecordMapper.ts`**: Test `toPerson` and `toQiUpdateRecordInput` to verify roundtrip fidelity and unknown-field preservation.
- **`relationshipService.ts`**: Test `calculateLastContact` to ensure non-meaningful interactions (`isMeaningful = false`) do not reset the relationship clock.
- **`googleContactDiff.ts`**: Test `generateGoogleContactDiff` against snapshots with matching, missing, and conflicting fields.
- **`insightService.ts`**: Test `generateDerivedInsights` to ensure evidence arrays properly reference source interaction IDs.

---

## 🔄 Post-Journal Branch Integration Checklist

After the Journal / router foundation branch is merged into `main`:
1. Rebase `feature/qilife-people-crm` onto `main`.
2. Replace local `manifest.ts` shape with canonical `QiLifeModule` type.
3. Export and register the People module in the global `moduleRegistry`.
4. Wire routes from `routes.tsx` into the shared router.
5. Register `RecentContactsWidget`, `FollowUpsWidget`, and `RelationshipPulseWidget` in the global dashboard registry.
6. Verify cross-module linking between Journal records and People records.
