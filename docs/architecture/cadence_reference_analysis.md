# Cadence Reference Analysis

> **Plugin**: Cadence v0.15.0 — "A workspace for working life"
> **Author**: Wesley Swart (`wesswart77`)
> **License**: MIT © 2026 Wesley Swart
> **Source**: `reference/QiCadence/`
> **Analysed**: 2026-06-16 on branch `alpha/qicadence`

---

## 1. Plugin Overview

Cadence is a monolithic Obsidian plugin (528 KB `main.js`, 70 KB `styles.css`, no build step)
that turns a markdown vault into a **unified workspace** spanning:

| Module    | Surfaces                                                    |
| --------- | ----------------------------------------------------------- |
| Home      | Two-column command centre dashboard                         |
| Planner   | Today (daily note), Calendar (week grid), Inbox (reminders) |
| Projects  | Dashboard + Kanban board                                    |
| CRM       | Dashboard, Pipeline (kanban), Contacts, Companies, Activities |
| PRM       | Partners, Registrations, Commissions, Leads, Certifications, Analytics |
| Workflow  | Sequences (placeholder)                                     |
| Reports   | Pipeline, Sales, Partners, Activity, Productivity, Graph View |
| Admin     | Team, Templates, Settings                                   |

Cadence is **not** a note editor — it provides **rich lenses** over plain markdown files
whose YAML frontmatter holds all entity data. Every UI mutation writes back to frontmatter.

---

## 2. Architectural Patterns

### 2.1 Single-File Architecture

The entire plugin is one `main.js` file (~12,123 lines). No build step, no framework.
Key classes registered with Obsidian's API:

| Class                        | Extends                    | Line    | Role                                     |
| ---------------------------- | -------------------------- | ------- | ---------------------------------------- |
| `CadenceAppView`            | `obsidian.ItemView`        | L2541   | Main view — all surfaces rendered here   |
| `CadencePlugin`             | `obsidian.Plugin`          | L11248  | Plugin lifecycle, commands, settings      |
| `CadenceSettingTab`         | `obsidian.PluginSettingTab`| L10173  | Settings UI                              |
| `CadenceEntityCreateModal`  | `obsidian.Modal`           | L1865   | Entity creation modal                    |
| `CadenceCaptureModal`       | `obsidian.Modal`           | L1209   | Quick capture (Cmd+Shift+I)             |
| `CadenceImportModal`        | `obsidian.Modal`           | L1591   | CSV import wizard                        |

### 2.2 Entity Registry Pattern (KEY — Portable to QiLife)

Cadence defines entities as a JSON registry (`ENTITIES` object, L95–L238).
Each entity is:

```js
{
  folder: 'Cadence/Contacts',      // Vault folder
  label: 'Contact',                // Singular display name
  plural: 'Contacts',             // Plural display name
  fields: [                        // Schema definition
    { key: 'name', label: 'Name', primary: true },
    { key: 'email', label: 'Email', type: 'email', isList: true },
    { key: 'company', label: 'Company', isList: true },
    // ...
  ],
  columns: ['name', 'company', 'email', 'phone', 'role', 'lastContact'],
}
```

**10 entity types defined**: contact, company, partner, registration, commission,
lead, certification, activity, sequence, project, deal.

### 2.3 Data Storage Model

```
vault/
  daily/2026-05-05.md          ← daily notes (user's existing setup)
  Cadence/
    Contacts/Jane Smith.md     ← frontmatter = entity data
    Pipeline/Acme — FTTH.md   ← deal entity
    Projects/Q3 launch.md     ← project entity + H2 sections (Brief, Scope, etc.)
    Templates/project.md       ← entity creation templates
```

Every entity file uses YAML frontmatter as its schema:
```yaml
---
type: contact
name: Jane Smith
email: [jane@example.com]
phone: []
company: ["[[Acme Corp]]"]
role: [Engineering]
lastContact: 2026-05-01
tags: [vip, partner]
---
```

### 2.4 Navigation Architecture

Navigation is driven by `NAV_GROUPS` (L17–L85) — a static array of groups/items
that maps 1:1 to left-rail nav items. Each has:

- `id` — unique surface identifier (e.g., `crm.pipeline`)
- `label` — display name
- `icon` — Lucide icon name
- `module` — optional module gate (surfaces hidden when module disabled)
- `desc` — description (used for "coming soon" placeholder)

The `BUILT_SURFACES` set (L258–L267) tracks which surfaces have actual render functions
vs. falling back to a placeholder.

### 2.5 Rendering Pattern

`CadenceAppView.render()` dispatches to surface-specific render functions:
- `renderHome()`, `renderToday()`, `renderCalendar()`, `renderInbox()`
- `renderPipeline()` — full kanban with drag-and-drop
- `renderEntityList()` — generic table view for any entity type
- `renderProjectDetail()` — rich PM surface with milestones/tasks/sections
- `renderEntityDetail()` — generic detail view with inline editing
- `renderDashboard()` — stat grid + chart widgets

All rendering is **imperative DOM manipulation** via `el.createDiv()`, `el.createSpan()`, etc.
No virtual DOM, no React, no templating.

### 2.6 Frontmatter I/O

Cadence reads/writes frontmatter through Obsidian's API:

| Operation                  | Method                                           |
| -------------------------- | ------------------------------------------------ |
| Read entity                | `app.metadataCache.getFileCache(file).frontmatter` |
| Write frontmatter          | `app.fileManager.processFrontMatter(file, fn)`     |
| Create entity              | `app.vault.create(path, templateContent)`          |
| Resolve entity type        | `entityKeyFromFile(app, file)` — checks `type` frontmatter then path prefix |
| List entities in a folder  | `listEntityFiles(app, entityKey)` — walks vault folder tree |

### 2.7 Bi-directional Relationship Sync

Cadence implements **loop-safe bidirectional sync** between Contact ↔ Project:
- Modifying a project's `owner` auto-updates the contact's `project` field
- Deleting a project auto-removes references from all contacts' frontmatter
- Uses `[[wikilink]]` format for inter-entity references
- Sync guard: `_syncInProgress` flag prevents infinite loops

### 2.8 Custom Entity Properties (Settings-Driven)

`DEFAULT_SETTINGS.customEntities` (L301–L390) mirrors the `ENTITIES` registry but is
**user-editable** via Settings. Field types supported:

| Type         | Widget                                                    |
| ------------ | --------------------------------------------------------- |
| `text`       | Standard text input                                       |
| `multitext`  | Chip-based multi-select with autocomplete                 |
| `enum`       | Dropdown with defined options                             |
| `date`       | Native date picker                                        |
| `tags`       | Tag chips synced with Obsidian's global tag index         |
| `currency`   | Number input formatted with locale currency               |
| `number`     | Plain number input                                        |

Autocomplete suggestion sources:
- `folder:Cadence/Contacts` — scan folder for note basenames
- `history` — scan existing notes for previously-entered values
- `tags` — pull from Obsidian's global tag cache
- `none` — no suggestions

### 2.9 Template System

Entity templates live in `Cadence/Templates/{entityKey}.md` and define:
- Default frontmatter schema for new entities
- H2 sections (Brief, Scope, Milestones, Tasks, Risks, Stakeholders, Notes)
- Section tags for rendering hints (e.g., `## Notes #notes`, `## Contacts #cross-contact-company-table`)

Template management surface allows drag-and-drop section reordering.

---

## 3. CSS Design System

### 3.1 Design Tokens

Cadence's CSS (2,035 lines) uses Obsidian CSS custom properties as its base
and defines its own color system using **oklch** for accent bands:

| Band     | oklch Value           | Semantic Use              |
| -------- | --------------------- | ------------------------- |
| emerald  | `oklch(0.55 0.13 155)` | Active/healthy status    |
| mint     | `oklch(0.78 0.12 155)` | Progress 50–75%          |
| sky      | `oklch(0.65 0.10 230)` | Info/neutral accent      |
| warn     | `oklch(0.72 0.14 70)`  | Warning/attention (25–50%)|
| rose     | `oklch(0.65 0.14 25)`  | Danger/overdue (<25%)    |

### 3.2 Component CSS Classes (Portable)

| Prefix       | Component                            | QiLife Relevance |
| ------------ | ------------------------------------ | ---------------- |
| `.cad-stat-*`  | Stat cards (dashboard KPI)          | ★★★ High        |
| `.cad-kanban-*`| Kanban board (columns, cards, drag) | ★★★ High        |
| `.cad-table-*` | Entity list table                   | ★★★ High        |
| `.cad-proj-*`  | Project cards, progress bars        | ★★ Medium       |
| `.cad-pill-*`  | Status/priority pills               | ★★★ High        |
| `.cad-home-*`  | Home dashboard cards                | ★★ Medium       |
| `.cad-inbox-*` | Inbox/reminder rows                 | ★ Low           |
| `.cad-pd-*`    | Project detail (meta inputs, etc.)  | ★★ Medium       |
| `.cad-briefing-*` | Daily briefing component         | ★ Low           |
| `.cad-btn`     | Button system                       | ★★★ High        |

### 3.3 Dark Mode Strategy

Cadence uses a **class-based** dark mode (`.cadence-app.cad-dark`) independent of
Obsidian's theme mode. When both Obsidian and Cadence are dark, it delegates to
Obsidian's CSS variables for seamless integration. The pattern is:

1. Light mode: uses Obsidian's `var(--background-primary)` etc.
2. `.cad-dark` class: hardcoded hex fallback values
3. `body.theme-dark .cad-dark`: delegates back to Obsidian variables

### 3.4 Responsive Layout

- Nav: fixed 220px sidebar, collapsible groups
- Content: flexbox with `overflow-y: auto`
- Grids: CSS Grid with `auto-fit, minmax(280px, 1fr)` for card layouts
- Kanban: horizontal scroll, 240px columns
- Mobile: 900px breakpoint collapses home columns to single-column

---

## 4. Feature Map: What Cadence Does vs. What QiLife Needs

| Cadence Feature               | QiLife Equivalent            | Mapping Strategy                    |
| ----------------------------- | ---------------------------- | ----------------------------------- |
| Entity registry (`ENTITIES`)  | `types.ts` type definitions  | Adapt schema pattern for TypeScript |
| Frontmatter CRUD              | Supabase REST API            | Replace file I/O with API calls     |
| Entity list (table)           | Existing list views          | Port CSS + column patterns          |
| Kanban board (Pipeline)       | Thread/Action boards         | Port kanban CSS + drag-drop logic   |
| Dashboard stat cards          | Home dashboard               | Port stat card pattern              |
| Status/priority pills         | Existing pills               | Port oklch color system             |
| Project detail (milestones)   | Thread detail                | Adapt milestone pattern to steps    |
| Entity create modal           | QiBit capture                | Adapt modal pattern                 |
| Daily note integration        | No equivalent (web app)      | Skip — Obsidian-specific            |
| Reminder/Inbox system         | Actions with due dates       | Partial conceptual overlap          |
| CSV import                    | No equivalent                | Future consideration                |
| Bi-directional sync           | Supabase relations           | Different approach needed           |
| Template system               | No equivalent                | Future consideration                |

---

## 5. Key Takeaways for QiLife

### 5.1 Adopt — Entity Registry Pattern

Cadence's `ENTITIES` registry is the single most portable pattern. QiLife should adopt
a similar **entity definition object** that drives:
- List views (which columns to show)
- Detail views (which fields to render)
- Create modals (which inputs to present)
- Validation (which fields are required)

### 5.2 Adopt — oklch Color System

The 5-band oklch color system (emerald/mint/sky/warn/rose) is well-designed and
perceptually uniform. Port directly to QiLife's CSS custom properties.

### 5.3 Adopt — Stat Card & Dashboard Pattern

The stat grid with accent bands and the two-column home layout are clean, proven patterns.

### 5.4 Evaluate — Kanban Board

Cadence's kanban has full drag-and-drop with stage mutations. Consider porting the
CSS layout pattern, but use a proper DnD library (e.g., `@dnd-kit`) for React.

### 5.5 Do NOT Adopt — File I/O Layer

Cadence's entire data layer is vault-specific (`app.vault`, `app.metadataCache`).
QiLife uses Supabase/REST — there is no code to port, only the **entity shape contract**.

### 5.6 Do NOT Adopt — Imperative Rendering

Cadence builds DOM imperatively (`el.createDiv()`). QiLife uses React TSX.
Port **design patterns** and **CSS**, not rendering code.

---

## 6. File Inventory

| File            | Size    | Lines  | Role                                    |
| --------------- | ------- | ------ | --------------------------------------- |
| `main.js`       | 528 KB  | 12,123 | All plugin logic in single file         |
| `styles.css`    | 70 KB   | 2,035  | All component styles + dark mode        |
| `manifest.json` | 452 B   | 12     | Obsidian plugin manifest                |
| `README.md`     | 15 KB   | 253    | Feature documentation + install guide   |
| `LICENSE`        | 1 KB   | 22     | MIT License                             |
| `versions.json` | 20 B    | 1      | Version compatibility map               |

---

## Attribution

This analysis references the Cadence Obsidian plugin by Wesley Swart, licensed under MIT.
Any code or design patterns adapted for QiLife must include the following attribution:

> Portions of this design inspired by [Cadence](https://github.com/wesswart77/obsidian-cadence)
> by Wesley Swart, licensed under MIT. © 2026 Wesley Swart.
