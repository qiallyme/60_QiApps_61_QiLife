# ADR-0001: Cadence as QiLife Workbench Reference

> **Status**: Proposed
> **Date**: 2026-06-16
> **Decision makers**: QiLife team
> **Branch**: `alpha/qicadence`

---

## Context

QiLife is a personal life-management web application built with React/TypeScript (Vite)
and a FastAPI/Supabase backend. It currently supports QiBits (atomic captures),
Threads (projects/topics), Actions (tasks), and People (contacts).

We evaluated [Cadence](https://github.com/wesswart77/obsidian-cadence) (v0.15.0),
an Obsidian plugin by Wesley Swart that provides a unified workspace for CRM, PRM,
project management, and daily planning — all on top of plain markdown.

The evaluation was conducted on branch `alpha/qicadence` with a read-only copy of
Cadence's source at `reference/QiCadence/`.

---

## Decision

**We will use Cadence as a UI/data-pattern reference for QiLife's workbench views,
but we will NOT fork, embed, or directly wire Cadence code into the production app.**

Specifically:

### ADOPT

1. **Entity Registry Pattern** — Cadence's `ENTITIES` object provides a single source
   of truth for entity schemas, columns, labels, and field types. We will implement an
   equivalent `ENTITY_REGISTRY` in TypeScript (see `qilife_markdown_entity_contract.md`).

2. **oklch Color Band System** — The 5-band color system
   (emerald/mint/sky/warn/rose using oklch) is perceptually uniform and well-suited
   for status-driven UIs. We will port these as CSS custom properties.

3. **Stat Card Dashboard Pattern** — The dashboard stat grid layout
   (accent-banded cards with label/value/sub) is clean and data-dense.
   We will adapt the CSS for QiLife's home and thread dashboards.

4. **Status/Priority Pill Components** — The `.cad-pill` CSS pattern maps directly to
   QiLife's existing pill components and improves them with better color semantics.

### EVALUATE (Deferred)

5. **Kanban Board** — Cadence's kanban has CSS patterns worth porting, but the
   drag-and-drop logic is Obsidian-imperative. We should evaluate using `@dnd-kit`
   for React and only port the visual CSS.

6. **Entity Create Modal Pattern** — Cadence's two-column modal with type-aware
   widgets is well-designed. Worth prototyping for QiLife's capture flow.

7. **CSV Import** — Useful for onboarding users migrating from spreadsheets.
   Low priority but good reference implementation.

### DO NOT ADOPT

8. **File-based Data Layer** — Cadence uses vault files as the database. QiLife
   uses Supabase with proper relational schema. No code overlap possible.

9. **Imperative DOM Rendering** — Cadence builds UI via `el.createDiv()`. QiLife
   uses React TSX. Port design patterns and CSS, not rendering code.

10. **Obsidian Plugin Lifecycle** — `obsidian.Plugin`, `obsidian.ItemView`, etc.
    are platform-specific. No relevance to web app architecture.

11. **Bidirectional Frontmatter Sync** — Cadence's loop-safe sync is clever but
    relies on file-level mutations. QiLife will use Supabase foreign keys and
    cascading updates instead.

12. **Daily Note Integration** — Obsidian-specific. QiLife may implement its own
    daily capture pattern but not via markdown files.

---

## Consequences

### Positive

- QiLife gains proven UI patterns without taking on Cadence's technical debt
- Entity registry pattern enforces consistency across all views
- oklch color system provides accessible, perceptually-uniform status indicators
- Clear boundary: CSS and data patterns are portable; rendering and I/O are not

### Negative

- Engineering effort to translate imperative patterns to React components
- Cadence's entity types (CRM/PRM) expand QiLife's scope — need to decide which
  entity types to actually implement vs. defer

### Risks

- **Scope creep**: Cadence has ~30 surfaces. QiLife must be selective about which
  patterns to adopt and when
- **Design divergence**: As QiLife evolves, the Cadence reference will become less
  relevant. This ADR should be revisited in 3 months

---

## Compliance

### License Attribution

Cadence is licensed under MIT. Any code excerpts, CSS patterns, or design elements
adapted from Cadence must include attribution per the MIT license:

> Portions of this design inspired by [Cadence](https://github.com/wesswart77/obsidian-cadence)
> by Wesley Swart, licensed under MIT. © 2026 Wesley Swart.

The full MIT license text is preserved at `reference/QiCadence/LICENSE`.

---

## References

- Cadence README: `reference/QiCadence/README.md`
- Technical analysis: `docs/architecture/cadence_reference_analysis.md`
- Entity contract: `docs/architecture/qilife_markdown_entity_contract.md`
- Prototype mapping: `prototypes/cadence_qilife_mapping/`
