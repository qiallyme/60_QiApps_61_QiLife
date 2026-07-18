---
title: QiLife Entity Registry
type: spec
status: draft
last_updated: 2026-06-22
---

# QiLife Entity Registry

Config-driven entity definitions. One generic renderer reads this. No hand-built screens per domain.

---

## v1 Entities

| Entity         | Label          | Section   | Default Layout |
| -------------- | -------------- | --------- | -------------- |
| `person`       | Person         | People    | table          |
| `task`         | Task           | Today     | kanban         |
| `event`        | Event          | Today     | table          |
| `note`         | Note           | Capture   | cards          |
| `project`      | Project        | Projects  | kanban         |
| `document`     | Document       | Documents | table          |
| `expense`      | Expense        | Finance   | table          |
| `account`      | Account        | Finance   | table          |
| `care_note`    | Care Note      | Care      | table          |
| `medication`   | Medication     | Care      | table          |
| `appointment`  | Appointment    | Care      | table          |
| `legal_matter` | Legal Matter   | Legal     | cards          |
| `home_item`    | Home Item      | Home      | table          |
| `asset`        | Asset          | Finance   | table          |
| `reminder`     | Reminder       | Today     | table          |

---

## Entity Schema Template

```ts
{
  key: "entity_key",
  label: "Display Label",
  plural: "Display Labels",
  table: "qilife.table_name",       // Supabase table
  primaryField: "name",              // field used as title
  defaultLayout: "table",            // table | cards | kanban
  sectionId: "sidebar_section",
  fields: [
    { key: "name",   label: "Name",   type: "text",    primary: true },
    { key: "status", label: "Status", type: "select",  options: ["active", "done", "parked"] },
    { key: "date",   label: "Date",   type: "date"   },
    { key: "tags",   label: "Tags",   type: "tags"   },
    { key: "notes",  label: "Notes",  type: "textarea" }
  ],
  columns: ["name", "status", "date"]  // columns shown in table view
}
```

---

## Field Types

| Type       | Renders as                        |
| ---------- | --------------------------------- |
| `text`     | text input                        |
| `textarea` | multiline input                   |
| `select`   | dropdown with options             |
| `multiselect` | tag-style multi picker         |
| `tags`     | freeform tags                     |
| `date`     | date picker                       |
| `datetime` | date + time picker                |
| `boolean`  | toggle                            |
| `number`   | numeric input                     |
| `currency` | number with $ formatting          |
| `relation` | link to another entity            |
| `file`     | link to QiNexus / Drive file      |

---

## Later Entities (not v1)

```txt
vehicle         pet             provider
case_event      evidence_item   income_source
subscription    routine         meal
inventory_item
```
