# QiLife Markdown Entity Contract

> **Version**: 0.1.0-draft
> **Branch**: `alpha/qicadence`
> **Date**: 2026-06-16
> **Status**: Prototype — not wired into production

---

## 1. Purpose

This document defines the **entity data contract** for QiLife entities, informed by
Cadence's entity registry pattern and QiLife's existing TypeScript type system.
The contract specifies mandatory fields, typing rules, and ID conventions that every
QiLife entity must satisfy for consistent rendering, querying, and future portability.

---

## 2. Universal Entity Contract

Every QiLife entity — regardless of type — **MUST** include the following fields:

| Field        | Type                 | Required | Description                                         |
| ------------ | -------------------- | -------- | --------------------------------------------------- |
| `id`         | `string` (UUID v4)   | ✅ YES   | Stable, globally unique identifier. Never reused.   |
| `type`       | `string` (enum)      | ✅ YES   | Entity type discriminator (see §3).                 |
| `title`      | `string`             | ✅ YES   | Primary display name for the entity.                |
| `status`     | `string` (enum)      | ✅ YES   | Lifecycle status (type-specific values).            |
| `created_at` | `string` (ISO 8601)  | ✅ YES   | Creation timestamp. Immutable once set.             |
| `updated_at` | `string` (ISO 8601)  | ✅ YES   | Last-modified timestamp. Auto-updated on mutation.  |
| `source`     | `string`             | ✅ YES   | Where this entity originated (see §4).              |
| `tags`       | `string[]`           | ✅ YES   | Freeform tags. Empty array `[]` if none.            |

### Stable ID Requirement

IDs **MUST** be:
- UUID v4 format (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- Generated at creation time
- **Never reused** after deletion
- Used as the primary key in all references between entities

> **Why**: Cadence uses file basenames as implicit IDs (`Jane Smith.md`), which causes
> fragility on rename. QiLife avoids this by using stable UUIDs as the canonical identifier.

---

## 3. Entity Types

### 3.1 Core Types (Existing in QiLife)

| Type Code   | Display Name | QiLife Source Type    | Cadence Equivalent   |
| ----------- | ------------ | -------------------- | -------------------- |
| `qibit`     | QiBit        | `types.ts:QiBit`     | —                    |
| `thread`    | Thread       | `types.ts:Thread`    | `project` (partial)  |
| `action`    | Action       | `types.ts:Action`    | — (task items)       |
| `person`    | Person       | `types.ts:Person`    | `contact`            |
| `draft`     | Draft        | `types.ts:Draft`     | —                    |

### 3.2 Candidate Types (Inspired by Cadence, Not Yet in QiLife)

| Type Code      | Display Name   | Cadence Source       | QiLife Use Case              |
| -------------- | -------------- | -------------------- | ---------------------------- |
| `company`      | Company        | `company` entity     | Organization tracking        |
| `deal`         | Deal           | `deal` entity        | Opportunity / pipeline       |
| `activity`     | Activity       | `activity` entity    | Interaction timeline         |
| `milestone`    | Milestone      | Embedded in project  | Thread progress tracking     |

> **Decision required**: Whether to add `company`, `deal`, `activity` to QiLife or
> model them as specialized QiBits with type discrimination.

---

## 4. Source Enumeration

The `source` field tracks provenance:

| Source Value       | Meaning                                    |
| ------------------ | ------------------------------------------ |
| `user:manual`      | Created manually by the user               |
| `user:capture`     | Quick-captured via QiBit capture flow       |
| `agent:auto`       | Created by the AI agent during processing  |
| `import:csv`       | Imported from CSV (future)                 |
| `import:cadence`   | Migrated from a Cadence vault (future)     |
| `sync:supabase`    | Synced from Supabase backend               |

---

## 5. Type-Specific Field Contracts

### 5.1 QiBit

```typescript
interface QiBitContract {
  // Universal fields
  id: string;
  type: 'qibit';
  title: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  source: string;
  tags: string[];

  // QiBit-specific
  raw_capture: string;          // Original input text
  summary: string;              // AI-generated summary
  qibit_type: QiBitType;        // care | finance | legal | tech | task | note
  bucket_code: string;          // Bucket assignment
  thread_id: string | null;     // Parent thread
  priority: Priority;           // low | medium | high
  action_required: boolean;
  suggested_action: string | null;
  future_slot: string | null;
  people_ids: string[];         // FK refs to Person entities
}
```

### 5.2 Thread (maps loosely to Cadence `project`)

```typescript
interface ThreadContract {
  // Universal fields
  id: string;
  type: 'thread';
  title: string;
  status: 'open' | 'active' | 'on_hold' | 'done' | 'cancelled';
  created_at: string;
  updated_at: string;
  source: string;
  tags: string[];

  // Thread-specific
  description: string;
  bucket_code: string;
  priority: Priority;
  next_action: string | null;
  due_date: string | null;      // ISO 8601 date
  started_at: string;
  closed_at: string | null;
}
```

### 5.3 Action (maps to Cadence task items)

```typescript
interface ActionContract {
  // Universal fields
  id: string;
  type: 'action';
  title: string;
  status: 'open' | 'done';
  created_at: string;
  updated_at: string;
  source: string;
  tags: string[];

  // Action-specific
  priority: Priority;
  qibit_id: string | null;      // FK to source QiBit
  thread_id: string | null;     // FK to parent Thread
  due_hint: string | null;      // Natural language due hint
  due_date: string | null;      // Resolved ISO 8601 date
  description: string | null;
  completed_at: string | null;
}
```

### 5.4 Person (maps to Cadence `contact`)

```typescript
interface PersonContract {
  // Universal fields
  id: string;
  type: 'person';
  title: string;                 // Alias for display_name
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  source: string;
  tags: string[];

  // Person-specific
  display_name: string;
  legal_name: string;
  relationship: string;         // family | friend | colleague | professional
  person_type: string;          // individual | organization
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}
```

---

## 6. Entity Registry Pattern (Adapted from Cadence)

Cadence's `ENTITIES` registry drives all views from a single definition. QiLife
should adopt a similar pattern in TypeScript:

```typescript
// Proposed: src/registry/entityRegistry.ts

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'enum' | 'date' | 'tags' | 'currency' | 'number' | 'multitext';
  primary?: boolean;
  options?: string[];          // For enum types
  isList?: boolean;
  required?: boolean;
}

export interface EntityDef {
  type: string;                // Entity type code
  label: string;               // Singular display name
  plural: string;              // Plural display name
  icon: string;                // Lucide icon name
  fields: FieldDef[];          // Schema definition
  columns: string[];           // Default list view columns
  apiEndpoint: string;         // REST endpoint
}

export const ENTITY_REGISTRY: Record<string, EntityDef> = {
  qibit: {
    type: 'qibit',
    label: 'QiBit',
    plural: 'QiBits',
    icon: 'zap',
    fields: [
      { key: 'title', label: 'Title', type: 'text', primary: true, required: true },
      { key: 'qibit_type', label: 'Type', type: 'enum', options: ['care','finance','legal','tech','task','note'] },
      { key: 'priority', label: 'Priority', type: 'enum', options: ['low','medium','high'] },
      { key: 'status', label: 'Status', type: 'enum', options: ['draft','active','archived'] },
      { key: 'tags', label: 'Tags', type: 'tags' },
    ],
    columns: ['title', 'qibit_type', 'priority', 'status', 'tags'],
    apiEndpoint: '/api/qibits',
  },
  thread: {
    type: 'thread',
    label: 'Thread',
    plural: 'Threads',
    icon: 'folder-kanban',
    fields: [
      { key: 'title', label: 'Title', type: 'text', primary: true, required: true },
      { key: 'status', label: 'Status', type: 'enum', options: ['open','active','on_hold','done','cancelled'] },
      { key: 'priority', label: 'Priority', type: 'enum', options: ['low','medium','high'] },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'tags', label: 'Tags', type: 'tags' },
    ],
    columns: ['title', 'status', 'priority', 'due_date'],
    apiEndpoint: '/api/threads',
  },
  person: {
    type: 'person',
    label: 'Person',
    plural: 'People',
    icon: 'users',
    fields: [
      { key: 'display_name', label: 'Name', type: 'text', primary: true, required: true },
      { key: 'relationship', label: 'Relationship', type: 'enum', options: ['family','friend','colleague','professional'] },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'tags', label: 'Tags', type: 'tags' },
    ],
    columns: ['display_name', 'relationship', 'email', 'phone'],
    apiEndpoint: '/api/people',
  },
  action: {
    type: 'action',
    label: 'Action',
    plural: 'Actions',
    icon: 'check-circle',
    fields: [
      { key: 'title', label: 'Title', type: 'text', primary: true, required: true },
      { key: 'status', label: 'Status', type: 'enum', options: ['open','done'] },
      { key: 'priority', label: 'Priority', type: 'enum', options: ['low','medium','high'] },
      { key: 'due_date', label: 'Due', type: 'date' },
      { key: 'tags', label: 'Tags', type: 'tags' },
    ],
    columns: ['title', 'status', 'priority', 'due_date'],
    apiEndpoint: '/api/actions',
  },
};
```

---

## 7. Mapping Cadence Fields → QiLife Fields

### Contact → Person

| Cadence Field   | QiLife Field      | Notes                              |
| --------------- | ----------------- | ---------------------------------- |
| `name`          | `display_name`    | Primary field                      |
| `email`         | `email`           | Single string (Cadence: list)      |
| `phone`         | `phone`           | Single string (Cadence: list)      |
| `company`       | — (via relation)  | Company entity not yet in QiLife   |
| `role`          | `relationship`    | Semantic overlap, different values |
| `lastContact`   | `updated_at`      | Approximate mapping                |
| `tags`          | `tags`            | Direct mapping                     |

### Project → Thread

| Cadence Field   | QiLife Field      | Notes                              |
| --------------- | ----------------- | ---------------------------------- |
| `name`          | `title`           | Primary field                      |
| `status`        | `status`          | Different enum values              |
| `priority`      | `priority`        | Same: low / medium / high          |
| `owner`         | — (not in Thread) | Would need relation to Person      |
| `started`       | `started_at`      | Direct mapping                     |
| `due`           | `due_date`        | Direct mapping                     |
| `tags`          | `tags`            | Direct mapping                     |

---

## 8. Validation Rules

1. **`id`** — Must be valid UUID v4. Reject any entity without an ID.
2. **`type`** — Must match a key in `ENTITY_REGISTRY`. Reject unknown types.
3. **`title`** — Must be non-empty string, max 500 characters.
4. **`status`** — Must match one of the allowed values for the entity type.
5. **`created_at`** / **`updated_at`** — Must be valid ISO 8601 datetime strings.
6. **`source`** — Must match pattern `{category}:{detail}` (see §4).
7. **`tags`** — Must be an array of strings. Empty array is valid. No null.

---

## Attribution

Entity contract design influenced by the [Cadence](https://github.com/wesswart77/obsidian-cadence)
entity registry pattern by Wesley Swart, licensed under MIT. © 2026 Wesley Swart.
