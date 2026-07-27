# QiLife Interactive Record Rows Design

## Decision

QiLife will use compact interactive record rows as the default presentation for
collections of records inside dashboards and module indexes.

This pattern sits between bare underlined links and large standalone cards. Each
record has a clear surface, useful context, and a generous click target without
making a ten-item list feel like ten separate dashboard panels.

Large cards remain appropriate for summaries, metrics, empty states, and
high-level navigation. Quick-create commands remain buttons. Records in a
collection use record rows.

## Problem Confirmed

Current screens use several competing collection patterns:

- Today and Project related-record sections render ordinary links in indented
  unordered lists.
- Actions and Projects indexes render every record as a large card.
- Journal uses a separate custom list-item treatment.
- People related records use one-off inline styling.

The result does not establish a consistent visual meaning for “this is a record
you can open.” Bare links feel unfinished, while large cards consume too much
space for operational lists.

## Visual Pattern

Each section remains a raised white surface with a title, count, and optional
section action. Records appear as vertically stacked interactive rows within the
section.

Each row contains:

1. A Lucide entity icon in a restrained tinted icon well.
2. A primary title using normal text treatment without an underline.
3. One concise metadata line, such as entity type, project, person, status, or
   date.
4. An optional semantic status or priority chip.
5. An optional trailing date.
6. A trailing chevron that reinforces navigation.

The entire row is one router-native link when the record has a destination.
Non-navigable projected records use the same visual structure without hover,
chevron, or link semantics.

Rows use an interactive surface token, a visible one-pixel border, a 10–12px
radius, and a minimum 56px target height. Hover changes border and background
slightly; it does not use glow or dramatic movement. Keyboard focus uses the
shared focus ring. Selected, disabled, warning, and error treatments use shared
semantic tokens.

On mobile, secondary metadata and trailing information wrap beneath the title.
The row remains one full-width target and never requires horizontal scrolling.

## Shared Component Boundary

Introduce two small shared components:

- `RecordRow` renders one record’s icon, title, metadata, status, date, and
  navigation affordance.
- `RecordList` renders a stack of `RecordRow` items and owns only list spacing
  and empty presentation.

The components receive display-ready properties and do not query storage,
resolve relationships, or contain module persistence logic. Modules continue to
own their data loading and determine the correct route and metadata.

The shared API should support:

```ts
type RecordRowProps = {
  to?: string;
  entityKey: string;
  title: string;
  metadata?: string;
  status?: string | null;
  priority?: string | null;
  dateLabel?: string | null;
  selected?: boolean;
};
```

Entity icons come from one shared mapping using the already-installed
`lucide-react` package. Do not add a new icon dependency, emoji icons, SVG
approximations, or module-specific icon maps.

## Application

Apply the pattern to:

- Today projection sections.
- Project dashboard related records, especially Actions.
- People related records.
- Journal entry list.
- Actions index.
- Projects index.

Actions and Projects may retain richer metadata than dashboard rows, but they
use the same component and visual grammar rather than returning to a large card
grid.

Project quick-create links become clearly styled compact buttons in a dedicated
action rail. They do not masquerade as records.

Empty sections remain hidden where the current product intentionally suppresses
them. When a section must remain visible, it uses one concise empty message
instead of an empty record-shaped placeholder.

## Data and Navigation

This is a presentation-only change.

- Existing repositories and shared QiRecords remain unchanged.
- Existing relation resolution remains unchanged.
- Existing record IDs and field mappings remain unchanged.
- Every navigable row uses React Router `Link`.
- Current URL-first destinations remain authoritative.
- No selected-record state is introduced.
- Loading, error, save, authentication, storage-mode, and recovery behavior are
  unchanged.

## Accessibility

- A navigable record is one semantic link, not a clickable container containing
  nested links.
- Each link has an accessible name beginning with the record title.
- Status is written as text and is never communicated by color alone.
- Icon wells are decorative unless an icon adds information not present in the
  text.
- Focus is visible against the light surface.
- Target height is at least 44px, with 56px preferred.
- Metadata contrast uses the existing accessible secondary-text token.
- Reduced-motion preferences remove row translation and transition effects.

## Error and Legacy Handling

Missing optional metadata does not leave visual gaps. Unresolved legacy
relationship values continue to display through the module’s existing fallback
title logic. A missing route produces a non-interactive row rather than a fake
link. Loading and error states remain at the owning section or module level.

## Testing

Focused component tests will verify:

- The whole navigable row is one router-native link.
- The route points to the owning module.
- Optional metadata, status, priority, and date render correctly.
- A row without a destination is not presented as a link.
- Accessible naming and focusable targets are present.

Existing module tests will be updated only where markup expectations change.
Regression checks will cover Today, Actions, Projects, People, Journal, direct
refreshes, browser navigation, storage indicators, and Journal editing.

Responsive verification will check representative desktop and mobile widths.
The production build and complete existing test suite must pass before
deployment.

## Scope Boundary

This pass does not:

- alter QiRecord data;
- add a module;
- change authentication, persistence, export, or restore;
- retire the compatibility shell;
- redesign forms or module behavior;
- introduce a new design system;
- turn every surface into a card.

It creates one consistent, modern collection pattern and replaces the specific
bare-link and oversized-card presentations that currently weaken QiLife.
