# QiCode, Object Registry, and Mobile QiLife Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align canonical QiCode, add the universal QiRecord-based Object Registry and Software & Services module, and deploy a verified mobile-first QiLife interface.

**Architecture:** Canonical doctrine remains in `C:\QiLabs\40_QiVault\00_QiCode`; volatile conformance lives in machine-readable records validated by a Node script. QiLife adds object domain repositories and one URL-first Software module over the existing `qilifeStore`, then migrates the application shell and active screens onto semantic light-first tokens and focused responsive primitives.

**Tech Stack:** React 19, TypeScript, React Router 7, Vitest, Testing Library, Supabase/PostgreSQL RLS, Vite, Cloudflare Workers/Wrangler, YAML contracts validated by Node.

## Global Constraints

- Work directly on `main`; do not create branches, worktrees, or pull requests.
- Preserve Titles 1–8 as human doctrine and Title 9 as the implementation bridge.
- Preserve stable citations; classify conflicting material explicitly.
- Keep `qilife.records`, the existing Qi API, and the single Supabase client.
- Never silently fall back from authenticated cloud persistence to local storage.
- Never store plaintext secrets or expose sensitive identifiers by default.
- Every new interactive control is at least 44 by 44 CSS pixels.
- Mobile inputs use at least 16 px text and pages never scroll horizontally.
- Implement production behavior test-first and commit focused changes directly to `main`.
- Do not deploy until tests, build, QiCode validation, browser checks, and `git diff --check` pass.

---

### Task 1: Reconcile Canonical QiCode and Add the Conformance Contract

**Files:**
- Modify: `C:\QiLabs\40_QiVault\00_QiCode\_index.md`
- Modify: `C:\QiLabs\40_QiVault\00_QiCode\title_09_qispark_bridge\_index.md`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\title_09_qispark_bridge\article_04_human_authority.md`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\title_09_qispark_bridge\article_05_state_and_verification.md`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\title_09_qispark_bridge\article_06_evidence_memory_and_ai.md`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\title_09_qispark_bridge\article_07_privacy_and_object_identity.md`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\conformance\contract.schema.yaml`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\conformance\provisions.yaml`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\conformance\systems\qilife.yaml`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\conformance\systems\qifi.yaml`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\conformance\systems\qispark.yaml`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\conformance\README.md`
- Create: `C:\QiLabs\40_QiVault\00_QiCode\scripts\validate-conformance.mjs`
- Create: `scripts\validate-qicode-conformance.mjs`
- Test: `src\test\qicodeConformance.test.ts`

**Interfaces:**
- Produces: active provision IDs `QIC-09-04-001` through `QIC-09-07-004`.
- Produces: `node scripts/validate-qicode-conformance.mjs`.
- Produces: conformance status enum `aligned | partial | missing | superseded | deferred | not_applicable | unverified`.

- [ ] **Step 1: Write failing conformance tests**

```ts
it("rejects duplicate, unknown, superseded, and evidence-free aligned rows", () => {
  expect(validateContract(invalidFixture)).toEqual(expect.arrayContaining([
    expect.stringContaining("duplicate"),
    expect.stringContaining("unknown provision"),
    expect.stringContaining("superseded"),
    expect.stringContaining("aligned requires evidence"),
  ]));
});

it("keeps protected QiCode provision IDs and citations stable", () => {
  expect(activeProvisions).toContainEqual(
    expect.objectContaining({ id: "QIC-09-04-001", citation: "QiCode Sec. 9.04.010" }),
  );
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/test/qicodeConformance.test.ts`  
Expected: FAIL because the contract reader and canonical files do not exist.

- [ ] **Step 3: Add doctrine and explicit hierarchy status**

Add active front matter with stable IDs and citations to the four Title 9
articles. Update `_index.md` so Titles 10–18 are linked only under a
`superseded_system_structure` section and cannot be interpreted as co-active
QiCode doctrine.

- [ ] **Step 4: Implement the validator**

```js
export function validateConformance({ provisions, systems, repositoryRoot }) {
  const allowed = new Set(["aligned", "partial", "missing", "superseded",
    "deferred", "not_applicable", "unverified"]);
  const active = new Map(provisions.filter(p => p.status === "active").map(p => [p.id, p]));
  const errors = [];
  const rows = new Set();
  for (const system of systems) for (const row of system.conformance) {
    const key = `${system.system_id}:${row.provision_id}`;
    if (rows.has(key)) errors.push(`duplicate ${key}`);
    rows.add(key);
    if (!allowed.has(row.status)) errors.push(`invalid status ${row.status}`);
    if (!active.has(row.provision_id)) errors.push(`unknown or superseded provision ${row.provision_id}`);
    if (row.status === "aligned" && !row.evidence?.length) errors.push(`${key}: aligned requires evidence`);
  }
  return errors;
}
```

- [ ] **Step 5: Add repository-local adapter and evidence paths**

The QiLife adapter reads the canonical source from
`QICODE_ROOT` when set and defaults to `C:\QiLabs\40_QiVault\00_QiCode`.
QiLife evidence rows name existing repository-relative paths only.

- [ ] **Step 6: Verify GREEN**

Run: `npm test -- src/test/qicodeConformance.test.ts`  
Run: `node scripts/validate-qicode-conformance.mjs`  
Expected: PASS and `QiCode conformance valid`.

- [ ] **Step 7: Commit focused doctrine changes**

Commit canonical QiCode in its owning repository if it is Git-controlled.
Commit QiLife adapter/tests:

```powershell
git add scripts/validate-qicode-conformance.mjs src/test/qicodeConformance.test.ts
git commit -m "docs(qicode): align doctrine and add conformance contracts"
```

### Task 2: Define and Validate the Object Registry Domain

**Files:**
- Create: `src/modules/objects/types.ts`
- Create: `src/modules/objects/objectSchema.ts`
- Create: `src/modules/objects/objectSchema.test.ts`
- Create: `src/modules/objects/identifierPolicy.ts`
- Create: `src/modules/objects/identifierPolicy.test.ts`
- Create: `src/modules/objects/secretPolicy.ts`
- Create: `src/modules/objects/secretPolicy.test.ts`

**Interfaces:**
- Produces: `OBJECT_ENTITY_KEYS`, `OBJECT_TYPES`, `IDENTIFIER_TYPES`.
- Produces: `normalizeIdentifier(value: string): string`.
- Produces: `maskIdentifier(value: string): string`.
- Produces: `assertSafeSecretReference(input): void`.
- Produces: typed drafts and records for all five entity keys.

- [ ] **Step 1: Write failing domain tests**

```ts
it("normalizes identifier uniqueness within object, provider, and type", () => {
  expect(identifierUniquenessKey({
    objectId: "obj-1", provider: " Cloudflare ", type: "account_id", value: " ABC-123 ",
  })).toBe("obj-1|cloudflare|account_id|abc-123");
});

it("masks a sensitive identifier without logging its value", () => {
  expect(maskIdentifier("fake-account-123456")).toBe("••••3456");
});

it("rejects plaintext secret material", () => {
  expect(() => assertSafeSecretReference({ password: "fake-secret" })).toThrow("plaintext");
});
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- src/modules/objects/objectSchema.test.ts src/modules/objects/identifierPolicy.test.ts src/modules/objects/secretPolicy.test.ts`  
Expected: FAIL with missing modules.

- [ ] **Step 3: Implement minimal typed schemas and policies**

```ts
export const OBJECT_ENTITY_KEYS = [
  "object", "object_identifier", "object_relationship", "object_record", "secret_reference",
] as const;

export function maskIdentifier(value: string) {
  const suffix = value.trim().slice(-4);
  return suffix ? `••••${suffix}` : "••••";
}
```

Validation requires stable parent IDs, supported enum values, raw capture
separation, and no secret-material keys.

- [ ] **Step 4: Verify GREEN and commit**

Run the focused tests, then:

```powershell
git add src/modules/objects
git commit -m "feat(objects): define universal object registry records"
```

### Task 3: Add Object Repositories, Uniqueness, Archive, and Recovery

**Files:**
- Create: `src/modules/objects/services/objectRepository.ts`
- Create: `src/modules/objects/services/objectRepository.test.ts`
- Create: `src/modules/objects/services/objectIdentifierRepository.ts`
- Create: `src/modules/objects/services/objectIdentifierRepository.test.ts`
- Create: `src/modules/objects/services/objectRelationshipRepository.ts`
- Create: `src/modules/objects/services/objectHistoryRepository.ts`
- Create: `src/modules/objects/services/secretReferenceRepository.ts`
- Modify: `src/features/qilife/services/qilifeStore.ts`
- Modify: `src/features/qilife/reliability/recoveryService.ts`
- Modify: `src/features/qilife/reliability/recoveryService.test.ts`
- Create: `supabase/migrations/0004_object_registry_constraints.sql`
- Create: `supabase/migrations/0004_object_registry_constraints.test.ts`

**Interfaces:**
- Consumes: object domain policies from Task 2.
- Produces: repositories with `list`, `get`, `create`, `update`, and `archive`.
- Produces: `listRecords(entityKey, { includeArchived })`.
- Produces: recovery support for all five object entity keys.

- [ ] **Step 1: Write failing repository behavior tests**

Cover multiple child identifiers, internal ID preservation, normalized
duplicate rejection, same value across providers, history raw capture,
reference-only secrets, and archived-selector exclusion.

```ts
expect(created.id).not.toBe(created.data.primary_identifier_id);
await expect(identifierRepository.create(duplicate)).rejects.toThrow("already exists");
expect(await objectRepository.listSelectable()).not.toContainEqual(
  expect.objectContaining({ id: archived.id }),
);
expect(await objectRepository.get(archived.id)).toBeTruthy();
```

- [ ] **Step 2: Run and verify RED**

Run: `npm test -- src/modules/objects/services src/features/qilife/reliability/recoveryService.test.ts`  
Expected: FAIL because repositories and archive-aware reads are missing.

- [ ] **Step 3: Implement repositories over `qilifeStore`**

```ts
export const objectRepository = {
  list: (includeArchived = false) => listRecords("object", { includeArchived }),
  get: async (id: string) => (await listAllRecords({ includeArchived: true }))
    .find(r => r.entity_key === "object" && r.id === id) ?? null,
  create: (draft: ObjectDraft) => createRecord(toObjectInput(draft)),
  update: (id: string, draft: ObjectDraft) => updateRecord(id, toObjectPatch(draft)),
  archive: archiveRecord,
};
```

The identifier repository checks owner-local scope by reading the current
object's children before write. The SQL migration adds a partial expression
unique index for cloud race protection using normalized JSON values, scoped by
`owner_id`, object ID, provider, and identifier type.

- [ ] **Step 4: Extend recovery validation**

Recovery continues to serialize complete QiRecords. Add entity-specific
validation ensuring child and relationship IDs are strings while preserving
`raw_capture`, masked display metadata, and archive state.

- [ ] **Step 5: Add RLS policy proof**

The migration test asserts RLS remains enabled and all five entity keys are
covered by the existing `owner_id = auth.uid()` policies because policies apply
to rows rather than entity-specific tables.

- [ ] **Step 6: Verify GREEN and commit**

Run focused tests and:

```powershell
git add src/modules/objects src/features/qilife/services/qilifeStore.ts src/features/qilife/reliability supabase/migrations/0004_object_registry_constraints.sql
git commit -m "feat(objects): persist object registry through QiRecords"
```

### Task 4: Extend Shared Relationships and Existing Module Editors

**Files:**
- Modify: `src/features/qilife/relations/relationshipFields.ts`
- Modify: `src/features/qilife/relations/relationshipFields.test.ts`
- Modify: `src/features/qilife/relations/relationResolver.ts`
- Modify: `src/features/qilife/relations/relationResolver.test.ts`
- Create: `src/features/qilife/components/RelationshipPicker.tsx`
- Create: `src/features/qilife/components/RelationshipPicker.test.tsx`
- Modify: `src/modules/projects/types.ts`
- Modify: `src/modules/projects/components/ProjectForm.tsx`
- Modify: `src/modules/actions/types.ts`
- Modify: `src/modules/actions/components/ActionForm.tsx`
- Modify: `src/modules/people/types.ts`
- Modify: `src/modules/people/components/PersonEditor.tsx`
- Modify: `src/modules/journal/types.ts`
- Modify: `src/modules/journal/components/JournalEditor.tsx`
- Modify: active Documents compatibility form if retained by Task 10.

**Interfaces:**
- Produces: canonical `data.object_id` for singular and `data.object_ids` for plural relations.
- Produces: `relationResolver.getObjectsForRecord(recordId)`.
- Produces: selector behavior that excludes archived objects.

- [ ] **Step 1: Write failing relationship tests**

```ts
expect(readRelationIds({ object_ids: ["o1", "o2"] }, "object", "object"))
  .toEqual(["o1", "o2"]);
expect(await resolver.getObjectsForRecord("project-1"))
  .toEqual([expect.objectContaining({ id: "o1", title: "Cloudflare" })]);
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/features/qilife/relations`.

- [ ] **Step 3: Implement plural object normalization and resolver**

Add `object: "object_ids"` to canonical relation fields and preserve both
singular and plural reads. Resolve stable IDs to object titles.

- [ ] **Step 4: Add the reusable picker to four dedicated module editors**

`RelationshipPicker` receives selectable active objects, selected stable IDs,
and `onChange(ids)`. It displays titles and never persists provider IDs.

- [ ] **Step 5: Verify GREEN and commit**

```powershell
git add src/features/qilife/relations src/features/qilife/components/RelationshipPicker* src/modules
git commit -m "feat(objects): link objects across QiLife records"
```

### Task 5: Build the Software & Services URL-First Module

**Files:**
- Create: `src/modules/software/manifest.ts`
- Create: `src/modules/software/manifest.test.ts`
- Create: `src/modules/software/routes.tsx`
- Create: `src/modules/software/routes.test.tsx`
- Create: `src/modules/software/types.ts`
- Create: `src/modules/software/services/softwareRepository.ts`
- Create: `src/modules/software/services/softwareFilters.ts`
- Create: `src/modules/software/services/softwareFilters.test.ts`
- Create: `src/modules/software/components/SoftwareList.tsx`
- Create: `src/modules/software/components/SoftwareForm.tsx`
- Create: `src/modules/software/components/SoftwareDetail.tsx`
- Create: `src/modules/software/components/SoftwareHistory.tsx`
- Create: `src/modules/software/components/IdentifierList.tsx`
- Create: `src/modules/software/components/IdentifierEditor.tsx`
- Modify: `src/app/moduleRegistry.ts`
- Modify: `src/app/moduleRegistry.test.ts`
- Modify: `src/app/AppRouter.test.tsx`

**Interfaces:**
- Consumes: Object Registry repositories and relationship resolver.
- Produces: `/software`, `/software/new`, `/software/:id`,
  `/software/:id/edit`, `/software/:id/history`.
- Produces: filters for query, provider, status, renewal, verification, archive.

- [ ] **Step 1: Write failing manifest, deep-route, and filter tests**

```ts
expect(softwareModule.routes.map(r => r.path)).toEqual([
  "/software", "/software/new", "/software/:id",
  "/software/:id/edit", "/software/:id/history",
]);
expect(screen.getByRole("heading", { name: "Software & Services" })).toBeVisible();
expect(filterSoftware(records, { needsVerification: true })).toEqual([stale]);
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/modules/software src/app`.

- [ ] **Step 3: Implement manifest, routes, repository mapper, and filters**

Register `softwareModule` before compatibility catch-all through the existing
module registry. Map Software fields into `object.data`; keep login email,
username, account IDs, and provider IDs in child identifier records.

- [ ] **Step 4: Implement list and editor**

The list uses stacked responsive rows/cards. The editor persists the object,
then child identifiers referencing its stable ID. Errors identify which child
write failed and leave the saved parent usable.

- [ ] **Step 5: Implement detail and history**

Load object, identifiers, relationships, records, secret references, Projects,
People, and Documents concurrently. Mask sensitive values before render.
Implement all requested quick actions except secret reveal.

- [ ] **Step 6: Verify refresh/copied route behavior**

Use a memory router test initialized at `/software/fake-object-1` and a browser
deep-route request against the local preview server.

- [ ] **Step 7: Verify GREEN and commit**

```powershell
git add src/modules/software src/app
git commit -m "feat(software): add Software and Services module"
```

### Task 6: Add Object Attention to Today

**Files:**
- Modify: `src/modules/today/services/todayProjection.ts`
- Modify: `src/modules/today/services/todayProjection.test.ts`
- Modify: `src/modules/today/routes.tsx`
- Modify: `src/modules/today/routes.test.tsx`

**Interfaces:**
- Produces projection groups `needsAttention`, `softwareAttention`,
  `staleIdentifiers`, and `unresolvedSupport`.

- [ ] **Step 1: Write failing projection tests**

```ts
expect(projectToday(records, "2026-07-29").softwareAttention.map(r => r.id))
  .toEqual(["renewal-soon", "needs-verification"]);
expect(projectToday(records, "2026-07-29").unresolvedSupport)
  .toContainEqual(expect.objectContaining({ entity_key: "object_record" }));
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/modules/today`.

- [ ] **Step 3: Implement deterministic projections and grouped rendering**

Calculate renewal and staleness from persisted QiRecords only. Do not persist
Today rows. Render the exact steering groups in the approved design.

- [ ] **Step 4: Verify GREEN and commit**

```powershell
git add src/modules/today
git commit -m "feat(today): surface object registry attention"
```

### Task 7: Establish Semantic Light-First Tokens and Responsive Primitives

**Files:**
- Create: `src/features/qilife/styles/tokens.css`
- Create: `src/features/qilife/styles/base.css`
- Create: `src/features/qilife/styles/components.css`
- Create: `src/features/qilife/styles/responsive.css`
- Create: `src/features/qilife/components/ui/PageHeader.tsx`
- Create: `src/features/qilife/components/ui/SectionCard.tsx`
- Create: `src/features/qilife/components/ui/StatusBadge.tsx`
- Create: `src/features/qilife/components/ui/FilterBar.tsx`
- Create: `src/features/qilife/components/ui/ResponsiveFormGrid.tsx`
- Create: `src/features/qilife/components/ui/AsyncState.tsx`
- Create: `src/features/qilife/components/ui/DetailSection.tsx`
- Create: `src/features/qilife/components/ui/primitives.test.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces semantic CSS tokens named in the design.
- Produces focused primitives with `className` extension points.

- [ ] **Step 1: Write failing primitive/accessibility tests**

Assert headings, labels, status semantics, error roles, filter expansion, and
class contracts for mobile sheets.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/features/qilife/components/ui`.

- [ ] **Step 3: Implement tokens**

```css
:root {
  --qi-background: #f6f7f9;
  --qi-surface: #ffffff;
  --qi-surface-raised: #ffffff;
  --qi-surface-muted: #eef1f4;
  --qi-border: #d7dce2;
  --qi-text-primary: #18212b;
  --qi-text-secondary: #44505d;
  --qi-text-muted: #667382;
  --qi-accent: #356f67;
  --qi-focus: #2563eb;
  --qi-target-min: 44px;
}
```

Complete tokens include success, warning, danger, shadows, radii, spacing, and
safe-area values. Add `prefers-reduced-motion`.

- [ ] **Step 4: Implement primitives and verify GREEN**

Run focused tests and `npm run build`.

- [ ] **Step 5: Commit**

```powershell
git add src/features/qilife/styles src/features/qilife/components/ui src/main.tsx
git commit -m "refactor(ui): establish mobile-first visual primitives"
```

### Task 8: Audit and Replace Cadence Styling

**Files:**
- Create: `docs/architecture/CADENCE_STYLE_AUDIT.md`
- Modify: `src/features/qilife/styles/qilife.css`
- Delete: `src/features/qilife/styles/cadence.css`
- Modify: `src/main.tsx`
- Modify: affected component tests.

**Interfaces:**
- Consumes: semantic tokens and primitives from Task 7.
- Produces: zero current `cadence` imports, filenames, selectors, or docs.

- [ ] **Step 1: Generate the selector-use audit**

For each selector in `cadence.css`, record source references and a disposition:
`move-general`, `move-module`, or `dead`. Verify active selectors in the browser
before changing them.

- [ ] **Step 2: Write a failing branding/import test**

```ts
expect(activeSourceFiles.filter(file => /cadence/i.test(file.contents))).toEqual([]);
```

Run and confirm it fails on the current import/file.

- [ ] **Step 3: Move active rules and remove dead rules**

Move behavior into `components.css`, `responsive.css`, or the owning module.
Replace hard-coded dark values with semantic tokens.

- [ ] **Step 4: Delete the obsolete file and verify**

Run the branding test, focused UI tests, build, and `rg -n -i "cadence" src docs/architecture`.

- [ ] **Step 5: Commit**

```powershell
git add src docs/architecture/CADENCE_STYLE_AUDIT.md
git commit -m "refactor(ui): replace active cadence styling"
```

### Task 9: Build the Mobile and Desktop Application Shell

**Files:**
- Create: `src/features/qilife/components/AppShell.tsx`
- Create: `src/features/qilife/components/AppShell.test.tsx`
- Create: `src/features/qilife/components/MobileBottomNav.tsx`
- Create: `src/features/qilife/components/MobileBottomNav.test.tsx`
- Create: `src/features/qilife/components/MoreNavigationSheet.tsx`
- Create: `src/features/qilife/components/MoreNavigationSheet.test.tsx`
- Modify: `src/app/ModuleRouteFrame.tsx`
- Modify: `src/features/qilife/components/QiLifeShell.tsx`
- Modify: `src/features/qilife/components/Topbar.tsx`
- Modify: `src/features/qilife/components/SidebarNav.tsx`
- Modify: `src/features/qilife/components/QiLifeShell.test.tsx`
- Modify: `src/features/qilife/components/SidebarNav.test.tsx`

**Interfaces:**
- Produces one shared shell for modules and compatibility screens.
- Produces primary bottom routes Today, Actions, Projects, People, Journal.
- Produces More destinations including Software & Services.

- [ ] **Step 1: Write failing shell tests**

```ts
expect(screen.getByRole("navigation", { name: "Primary" })).toHaveTextContent("Today");
expect(screen.getByRole("navigation", { name: "Primary" })).toHaveTextContent("Journal");
expect(screen.getByRole("dialog", { name: "More QiLife destinations" }))
  .toHaveTextContent("Software & Services");
```

Add CSS contract assertions that mobile hides the sidebar and desktop hides
bottom navigation, with safe-area bottom padding.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/features/qilife/components`.

- [ ] **Step 3: Implement shared shell and URL-first navigation**

Use `NavLink` for every destination. More is a focus-managed sheet, closes on
Escape/navigation, and restores focus to its trigger.

- [ ] **Step 4: Verify GREEN and commit**

```powershell
git add src/features/qilife/components src/app/ModuleRouteFrame.tsx
git commit -m "feat(ui): add responsive application shell"
```

### Task 10: Migrate Active Screens and Classify Compatibility Routes

**Files:**
- Modify: `src/modules/today/routes.tsx`
- Modify: `src/modules/actions/routes.tsx`
- Modify: `src/modules/projects/routes.tsx`
- Modify: `src/modules/people/components/PeopleList.tsx`
- Modify: `src/modules/people/components/PersonDashboard.tsx`
- Modify: `src/modules/journal/components/JournalEditor.tsx`
- Modify: `src/features/qilife/components/EntityTable.tsx`
- Modify: `src/features/qilife/components/EntityFormModal.tsx`
- Create: `docs/architecture/COMPATIBILITY_ROUTE_DISPOSITION.md`
- Modify: `src/app/CompatibilityShellRoute.tsx`
- Modify: `src/app/AppRouter.test.tsx`

**Interfaces:**
- Produces mobile cards, one-column forms, full-screen sheets, and explicit
  compatibility behavior.

- [ ] **Step 1: Classify every compatibility route**

Record Inbox, Calendar, Threads, Timeline, Documents, Knowledge, Decisions,
Reports, Apps, Automations, Settings, Home, and Ask QiLife as permanent,
dedicated migration, temporary, or retired. Record current production behavior
and intended milestone behavior.

- [ ] **Step 2: Write failing responsive screen tests**

Test mobile Actions cards and completion target, Project outcome-first order,
People stacked panels, Journal toolbar containment/autosave, full-screen generic
forms, and explicit compatibility route headings.

- [ ] **Step 3: Verify RED**

Run focused module and compatibility tests.

- [ ] **Step 4: Migrate dedicated screens to shared primitives**

Keep domain-specific components. Replace duplicated page headers, filter rows,
async states, panels, badges, and form grids with focused shared primitives.

- [ ] **Step 5: Repair retained compatibility behavior**

Retained routes must identify their actual workspace after refresh. Retired
routes show an intentional destination/retirement message instead of silently
rendering Home.

- [ ] **Step 6: Verify GREEN and commit**

```powershell
git add src docs/architecture/COMPATIBILITY_ROUTE_DISPOSITION.md
git commit -m "refactor(ui): migrate active QiLife screens to mobile layouts"
```

### Task 11: Add Responsive, Accessibility, Privacy, and RLS Coverage

**Files:**
- Create: `src/test/responsiveContracts.test.tsx`
- Create: `src/test/accessibilityContracts.test.tsx`
- Create: `src/test/objectPrivacy.test.ts`
- Create: `scripts/audit-responsive-browser.mjs`
- Create: `scripts/smoke-qilife-routes.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run test:responsive`.
- Produces: browser audit output for all required viewports and active routes.
- Produces: deterministic checks for overflow, target size, shell visibility,
  focus, safe area, long IDs, and form completion.

- [ ] **Step 1: Write failing contract tests and browser audit**

The browser script records viewport, route, scroll width, offending elements,
small interactive targets, visible sidebar/bottom nav, modal bounds, and page
heading. It exits nonzero on violations.

- [ ] **Step 2: Verify RED against the pre-migration or intentionally broken fixture**

Run: `npm run test:responsive`  
Expected: FAIL on at least the current 36–42 px controls.

- [ ] **Step 3: Fix each failing contract without weakening thresholds**

Do not exclude active controls. Fix layout, semantics, or focus ownership in
production components.

- [ ] **Step 4: Verify local browser behavior**

Run the local production build/preview and audit:

```text
360x800, 375x812, 390x844, 430x932, 768x1024, 1440x900
```

Exercise Software create/edit/detail, relationship selection, masked IDs,
Journal editing, More sheet, Back/Forward, and deep refresh.

- [ ] **Step 5: Commit**

```powershell
git add src/test scripts package.json package-lock.json
git commit -m "test(qilife): cover object persistence and mobile behavior"
```

### Task 12: Update Architecture, Recovery, and Operator Documentation

**Files:**
- Modify: `README.md`
- Modify: `codex.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/architecture/ACTIVE_CODE_MAP.md`
- Modify: `docs/architecture/DATA_RECOVERY.md`
- Create: `docs/architecture/OBJECT_REGISTRY.md`
- Create: `docs/architecture/QICODE_CONFORMANCE.md`
- Create: `docs/architecture/MOBILE_VISUAL_SYSTEM.md`

**Interfaces:**
- Produces accurate working/partial/planned/deferred documentation.

- [ ] **Step 1: Update documents from verified implementation evidence**

Document the five entity keys, routes, repository flow, RLS, recovery version,
masking, secret-reference boundary, token system, shell breakpoints,
compatibility disposition, QiCode source and validator.

- [ ] **Step 2: State limitations explicitly**

Record specialized non-software interfaces, secret retrieval, semantic memory,
autonomous operation, real-time sync, and conflict merge as deferred.

- [ ] **Step 3: Validate links and evidence paths**

Run `rg` checks and QiCode conformance validation.

- [ ] **Step 4: Commit**

```powershell
git add README.md codex.md docs
git commit -m "docs(qilife): document objects and responsive architecture"
```

### Task 13: Full Verification, Deployment, and Production Smoke

**Files:**
- Modify only files required by a reproduced failing gate, using a regression
  test before each fix.

**Interfaces:**
- Produces a deployed Cloudflare Worker version and evidence-backed final report.

- [ ] **Step 1: Install exactly locked dependencies**

Run: `npm ci`  
Expected: exit 0.

- [ ] **Step 2: Run all automated gates**

```powershell
npm run test:ci
npm run build
node scripts/validate-qicode-conformance.mjs
git diff --check
```

Expected: all exit 0 with zero test failures.

- [ ] **Step 3: Verify local persistence and recovery**

In explicit local mode create a software object with multiple identifiers,
relationships, history, and a secret reference; export; preview restore;
restore; refresh the detail route; and verify archive-selector behavior.

- [ ] **Step 4: Verify authenticated cloud persistence and owner isolation**

Create and mutate each entity type through the authenticated Qi API. Verify a
second authenticated owner cannot read, update, archive, relate, or restore
the first owner's records.

- [ ] **Step 5: Run local browser audits**

Smoke every dedicated and retained compatibility route at mobile and desktop
sizes. Capture uncommitted before/after artifacts. Confirm 360 px has no
horizontal scroll, covered controls, or desktop-only workflow.

- [ ] **Step 6: Deploy**

Run: `npx wrangler deploy`  
Record the deployment version from Wrangler output.

- [ ] **Step 7: Run production smoke**

Run the route and responsive scripts against
`https://qilife.qilife.workers.dev`. Verify Software deep routes, refresh,
Back/Forward, masking, mobile navigation/forms, Journal editing, and retained
compatibility routes.

- [ ] **Step 8: Confirm repository state and push**

```powershell
git status -sb
git log --oneline qilife-before-object-registry-mobile-redesign..HEAD
git push origin main
```

Expected: clean worktree and synchronized `main`.

- [ ] **Step 9: Produce the final report**

Report canonical QiCode evidence, conflicts, provisions, contract format,
Object Registry architecture, Software routes, persistence/API changes,
compatibility disposition, Cadence audit, widths, accessibility findings,
test totals, commit hashes, deployment version, production results,
limitations, and clean-worktree evidence.
