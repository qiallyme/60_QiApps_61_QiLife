# QiCode, Object Registry, and Mobile QiLife Design

**Date:** 2026-07-29  
**Status:** Approved design  
**Repository:** `qiallyme/60_QiApps_61_QiLife`  
**Production:** `https://qilife.qilife.workers.dev`

## Purpose

This milestone aligns QiLife with canonical QiCode doctrine, adds a universal
Object Registry and a complete Software & Services module, and replaces the
current dark, desktop-derived interface with a calm, light-first, genuinely
mobile-first application experience.

The work preserves QiLife's established architectural constraints:

- direct implementation on `main`;
- one React/TypeScript application;
- one shared `qilife.records` persistence model;
- one Supabase client and authenticated Qi API path;
- URL-first modules registered before the compatibility catch-all;
- explicit local mode with no silent cloud-to-local fallback;
- complete, reviewed recovery export and restore;
- owner isolation enforced by the API and PostgreSQL RLS.

## Repository Safeguards

Before this design was written:

- `main` was pulled with `--ff-only`;
- `HEAD` and `origin/main` both resolved to
  `5912fbeab576d4f556197886b0c5665c37785173`;
- the worktree contained no changes;
- annotated rollback tag
  `qilife-before-object-registry-mobile-redesign` was created and pushed.

No branch, worktree, or pull request will be created.

## Canonical QiCode Source

The canonical editable source is:

`C:\QiLabs\40_QiVault\00_QiCode`

Evidence:

- `_index.md` declares `status: active` and defines the citation model.
- The directory contains the current decomposed title/article structure and
  active front matter.
- `C:\QiLabs\10_QiSpark\dist\docs\00_QiCode` is generated output whose
  timestamps and HTML form identify it as a build artifact.
- `C:\QiLabs\60_QiApps\67_QiCodex` is an agent-control/drop-in utility, not a
  doctrine source.
- `sources/qicodex_master_imports` and `sources/legacy_monoliths` are imported
  source history, not co-equal active doctrine.
- `C:\QiLabs\90_QiArchive` and template-rebuild reports are historical or
  recovery evidence.

The current active index exposes a conflict: it correctly identifies Titles
1–8 as personal doctrine and Title 9 as the QiSpark bridge, but also presents
Titles 10–18 as active QiCode system doctrine. This milestone will reconcile
that conflict without renumbering stable human provisions:

- Titles 1–8 remain active human doctrine and personal governance.
- Title 9 remains the active bridge from doctrine to implementation.
- Current Titles 10–18 are preserved and explicitly classified as superseded
  QiCode structure / historical system doctrine.
- Imported monoliths remain legacy reference material.
- Generated QiSpark output is rebuilt from the canonical source after changes.

## QiCode Doctrine Design

New or reconciled provisions will use stable, machine-readable identifiers
stored in front matter. Existing stable citation numbers will not change.
Provision status will be one of `active`, `superseded`, `historical`, or
`legacy_reference`.

Title 9 will define implementation-facing doctrine for:

- human final authority and explicit authorization for consequential actions;
- current state, desired state, gap, next meaningful move, verified result,
  and learning;
- preservation of original evidence and separation of interpretation;
- deterministic domain rules before AI assistance;
- working, episodic, semantic, and procedural memory governance;
- visible actions, rationale, evidence, success, and incomplete work;
- public/private separation, owner scope, sensitivity, and secret handling;
- universal internal object identity, provider identifiers, relationships,
  evidence history, and secret references.

Stable doctrine will not contain volatile application status.

## QiCode Conformance Contract

The canonical QiCode source will gain:

```text
conformance/
  contract.schema.yaml
  provisions.yaml
  systems/
    qilife.yaml
    qifi.yaml
    qispark.yaml
  README.md
scripts/
  validate-conformance.mjs
```

`provisions.yaml` is the stable machine index for doctrine identifiers,
citations, status, and contradiction groups. Each system document contains
rows with:

```yaml
system_id:
provision_id:
status:
evidence:
verified_at:
verified_by:
notes:
```

Allowed conformance statuses are `aligned`, `partial`, `missing`,
`superseded`, `deferred`, `not_applicable`, and `unverified`.

Validation rejects:

- unknown provision identifiers;
- invalid statuses;
- duplicate system/provision pairs;
- `aligned` rows without evidence;
- alignment claims against superseded provisions;
- more than one active provision in a contradiction group;
- missing QiLife repository evidence paths;
- accidental removal or renumbering of protected provision identifiers.

QiLife will keep a repository-local conformance declaration or validation
adapter that points to the canonical contract and can be run in normal CI.

## Object Registry Domain

The Object Registry uses five first-class QiRecord entity keys:

```text
object
object_identifier
object_relationship
object_record
secret_reference
```

No new database, Supabase client, or per-object table is introduced.

### Object

An object is the persistent thing being documented. Its QiRecord `id` is the
only canonical internal identity. `data` carries:

- `object_type`
- `description`
- `sensitivity`
- `schema_version`
- `primary_identifier_id`
- `last_verified_at`
- `archived_at`

Supported types are `software_account`, `organization`, `device`, `vehicle`,
`property`, `policy`, `legal_case`, `membership`,
`financial_account_reference`, `government_account`, and `other`.

Only `software_account` receives a specialized interface in this milestone.
Other types receive validated schemas and safe generic rendering.

### Object Identifier

Identifiers are child QiRecords. They retain their own stable record IDs and
refer to the parent through `data.object_id`. Normalized uniqueness is scoped
to owner, object, provider, identifier type, and value. An identical value
under an unrelated provider remains valid.

Sensitive values are masked by default. Raw values are excluded from ordinary
AI context, logs, analytics, snapshots, and public fixtures.

### Object Relationship

Relationships are QiRecords with stable `from_object_id` and `to_object_id`
references. UI resolution displays titles while persistence retains IDs.
Validity periods and source record IDs remain optional metadata.

### Object Record

Object history stores events, facts, observations, and document references.
`raw_capture` remains separate from editable `structured_data` and summaries.
Corrections add or supersede interpretations without deleting source evidence.

### Secret Reference

A secret reference stores only a vault or physical-location pointer. The
domain model rejects plaintext password/token/key/recovery/MFA fields.
This milestone includes no secret reveal interface.

## Object Registry Services and Persistence

`src/modules/objects/` owns domain types, validation, normalization, masking,
repositories, relationship queries, generic rendering, and tests.

The repository layer calls the existing `qilifeStore`, which selects either:

```text
Module UI -> module repository -> qilifeStore -> authenticated Qi API
          -> owner-scoped qilife.records
```

or explicit local development storage.

Cloud failures remain errors. They never switch to local storage.

The recovery envelope version will increase only if validation needs a
distinguishable contract. Export includes all five entity types, archived
objects, stable IDs, child identifiers, relationships, raw capture, and secret
references. Restore preview and restore preserve those records without
adopting imported owner IDs.

Existing RLS already scopes all entity types because they share
`qilife.records`. New SQL validation/index support may be added narrowly for
object identifier uniqueness, but no new domain table is allowed.

## Software & Services Module

`src/modules/software/` is a URL-first dedicated module registered before the
compatibility route:

```text
/software
/software/new
/software/:id
/software/:id/edit
/software/:id/history
```

### List

The list uses responsive cards/stacked rows at every width. It provides search,
provider and status filters, renewal state, recently verified, needs
verification, and an archived toggle. Desktop gains density but not a wide
table dependency.

### Create and Edit

The editor covers provider, title, description, status, login identity, URLs,
plan and billing, renewal, ownership/workspace, support, notes, sensitivity,
and verification date.

Identifiers are child-record editors with controlled common types plus a custom
provider type. The parent object is saved first when necessary; child writes
then reference its stable ID. Partial child-write failure remains visible and
retryable rather than rolling back or hiding the persisted parent.

### Detail and History

The detail dashboard shows identity, status, masked identifiers, People,
Projects, related objects, Documents, history, renewal/verification attention,
secret-storage references, source evidence, and verification date.

Quick actions add identifiers, relationships, and records; mark verified; edit;
and archive. History is independently deep-linkable.

## Cross-Module Object Relationships

Shared relationship helpers normalize:

```text
data.object_id
data.object_ids
```

Projects, Actions, People, Journal, and retained Documents screens gain object
pickers and resolved object links without changing existing Project, Person,
Thread, or owner relations. Archived objects resolve for historical reading
but are excluded from normal creation selectors.

Today remains a projection over QiRecords. It does not persist a second model.
It groups:

- software renewals approaching;
- objects needing verification;
- unresolved support records;
- objects with stale or expired identifiers.

## Visual System

The current production theme is dark-first, highly saturated, and contains
small controls. The production audit also found compatibility URLs that return
the Home workspace, 36–42 px navigation/actions at mobile widths, and no true
five-module bottom navigation.

The replacement is neutral, light-first, soft, high-clarity, and low-noise.
Dark mode is deferred unless the final token architecture supports it without
duplicated component colors.

Token groups cover:

- background and surface levels;
- borders;
- primary, secondary, and muted text;
- accent, success, warning, and danger;
- focus;
- shadows;
- radii;
- spacing;
- safe-area insets.

Component styles consume semantic tokens. Focus is visible, normal text and
interactive states meet WCAG AA, and reduced-motion preferences disable
nonessential transitions.

## Cadence Styling Disposition

Every selector in `src/features/qilife/styles/cadence.css` will be checked
against rendered production markup and source references.

- Active generic rules move into neutrally named visual-system or component
  files.
- Active module-specific rules move beside their owning module.
- Dead rules are deleted.
- Imports and tests are updated.
- No active production file, selector, or architecture document retains
  Cadence branding.

The migration is behavioral, not a blind file deletion.

## Responsive Application Shell

### Mobile

At widths below the desktop breakpoint:

- desktop sidebar is absent;
- a compact top bar shows the page title, storage state, and More access;
- fixed bottom navigation shows Today, Actions, Projects, People, and Journal;
- More exposes Inbox, Calendar, Threads, Software & Services, Timeline,
  Documents, Knowledge, Decisions, Reports, Apps, Automations, and Settings;
- bottom padding includes navigation height and
  `env(safe-area-inset-bottom)`;
- sheets become full-screen on narrow phones;
- navigation remains URL-first.

### Desktop

Desktop retains grouped navigation with a narrower sidebar. Content uses a
readable maximum width unless a specialized information view benefits from
more space.

### Shared Primitives

Small focused primitives provide the consistent contract:

`AppShell`, `MobileBottomNav`, `PageHeader`, `PageActions`, `SectionCard`,
`RecordCard`, `RecordList`, `StatusBadge`, `FilterBar`,
`ResponsiveFormGrid`, `EmptyState`, `LoadingState`, `ErrorState`,
`DetailSection`, `RelationshipPicker`, and `IdentifierList`.

These are composable pieces, not a generic component framework.

All interactive targets are at least 44 by 44 CSS pixels. Mobile inputs use
at least 16 px text. Pages cannot scroll horizontally. Long IDs wrap or
truncate with explicit copy controls.

## Screen Composition

- **Today:** grouped attention, due, upcoming, waiting, blocked projects,
  follow-ups, software attention, recent changes, and Inbox sections.
- **Actions:** mobile record cards with large completion controls and a filter
  sheet.
- **Projects:** outcome/current state, next move, action summary, blockers,
  People, and objects lead the screen.
- **People:** contact identity, follow-up state, interactions, Projects, and
  objects use stacked mobile sections.
- **Journal:** constrained writing width, non-overflowing toolbar, visible
  autosave state, and protected raw capture.
- **Software & Services:** reference-quality implementation of the new tokens,
  primitives, cards, forms, sheets, and detail sections.

## Compatibility Route Disposition

The compatibility shell remains during this milestone. Each compatibility URL
will be placed in exactly one category:

- permanent generic infrastructure;
- migrate to a dedicated module;
- temporary compatibility route;
- retire because unused.

The classification is recorded in
`docs/architecture/COMPATIBILITY_ROUTE_DISPOSITION.md`.

Current dedicated modules—Today, Actions, Projects, People, Journal, and the
new Software module—must never route through compatibility state. Existing
compatibility URLs that currently render Home will be either given an explicit
retained destination or recorded and retired; they will not masquerade as
working modules.

## Testing and Verification

Implementation follows red-green-refactor cycles. Tests cover:

- all twelve requested Object Registry behaviors;
- QiCode identifiers, statuses, evidence, duplicates, supersession,
  contradictions, path existence, and citation stability;
- module manifests and deep routes;
- masking and secret-reference validation;
- recovery/export relationship preservation;
- owner-isolation SQL policies for all five entity keys;
- object links across Projects, Actions, People, Journal, and Documents;
- Today object projections;
- mobile navigation and desktop sidebar exclusivity;
- full-screen mobile sheets and minimum target sizes;
- focus, labels, modal focus management, long IDs, forms, and Journal editing.

Production and the local build are inspected at:

```text
360 x 800
375 x 812
390 x 844
430 x 932
768 x 1024
1440 x 900
```

Before-and-after screenshots remain uncommitted development artifacts unless a
maintained visual-regression workflow is established.

Release verification runs:

```powershell
npm ci
npm run test:ci
npm run build
git diff --check
```

It also runs QiCode validation and browser smoke coverage for all active routes,
Software & Services deep routes, refresh, Back/Forward, local persistence,
cloud persistence, export, restore preview/restore, relationship display,
masking, navigation, mobile forms, Journal editing, and retained compatibility
routes.

Deployment occurs only after those gates pass. Production is then rechecked at
mobile and desktop sizes. The milestone is incomplete if 360 px has horizontal
page scrolling, covered controls, or desktop-only workflows.

## Delivery Sequence

The approved umbrella design is implemented through independently reviewable
sub-projects in this order:

1. QiCode reconciliation and conformance contract.
2. Object Registry domain, persistence, privacy, and recovery.
3. Software & Services URL-first module.
4. Cross-module object relationships and Today projections.
5. Visual tokens, responsive primitives, and Cadence migration.
6. Mobile/desktop application shell and active screen migrations.
7. Compatibility disposition and retained-route repair.
8. End-to-end accessibility, browser verification, documentation, deployment,
   and production smoke.

Each sub-project ends in a focused direct-to-main commit. A failing gate stops
deployment and is reported accurately.

## Explicit Deferrals

This milestone does not implement:

- autonomous or externally consequential AI operation;
- semantic-memory inference pipelines;
- secret reveal or vault retrieval;
- specialized interfaces for non-software object types;
- real-time multi-client synchronization;
- automatic conflict merging;
- a replacement for the existing Qi API;
- a second persistence model.

Documentation will distinguish delivered, partial, planned, and deferred work.
