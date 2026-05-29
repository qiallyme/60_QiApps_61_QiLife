# Database Stability Strategy

This document details the database engineering choices and architecture designed to protect data, minimize schema volatility, maintain historic provenance, and ensure portability for **QiLife**.

---

## 1. Core Decisions

### Local-First SQLite (V1)
For the initial implementation of **QiLife**, **SQLite** is selected because it is:
*   **Local-First**: Complete control of data without network overhead.
*   **Portable**: The entire database is a single file (`qilife.sqlite`) that can be checked into backups or git.
*   **Simple Administration**: Zero daemon processes or connection pooling libraries to manage.
*   **Fast**: Zero-network round trips for read/write queries.
*   **Future-Ready**: Prepares the schema for an eventual migration to Postgres once the core entities are stable and multi-device support is needed.

### Postgres Transition (V2)
The database structure is designed to support a drop-in migration to Postgres on Cody's **QiServer** when:
1.  Multi-device concurrent access requires central session management.
2.  Vector search embeddings scale beyond SQLite extensions.
3.  Background worker services scale.

---

## 2. The Three-Layer Data Pipeline

To prevent user interpretations or LLM commentary from altering raw evidence, the schema is organized into three distinct layers:

```text
Raw Layer
├── qibits.raw_capture   # Sacred original input
├── documents            # File hashes and paths
├── imported repo docs   # Markdown files synced from git
└── activity_log         # Append-only audit events

Structured Layer
├── actions              # Active tasks
├── threads              # Cases / ongoing projects
├── people               # Relationships / contacts
├── transactions         # Money logs (amount_cents)
├── obligations          # Bilateral loans/debt logs
├── events               # Calendar entries
└── links                # Polymorphic join references

Interpretation Layer
├── qibits.summary       # Cleaned text
├── qibits.meaning       # Inferred meaning
├── knowledge_items      # In-app runbooks and wikis
├── ai_outputs           # Draft outputs from service runs
└── daily_summaries      # Markdown logs of daily activity
```

*   **Rule**: The raw capture of a QiBit is immutable. AI and user additions are saved into secondary fields or separate tables, preserving the original audit trail.

---

## 3. Core Database Rules

### Stable Primary Keys (ULIDs)
*   All primary keys (except static tables like `buckets`) must use **ULIDs** (Universally Unique Lexicographically Sortable Identifiers).
*   **Benefits**: Sortable by creation time (preserving insertion sequence), collision-resistant, and cleaner than standard UUIDs for timeline systems.
*   Example ULID: `01JYQ8Z7W4V6K2...`

### Financial Integrity (`amount_cents`)
*   To prevent float precision bugs, all financial values (in `transactions` and `obligations`) must be stored as integers representing cents (`amount_cents`), rather than decimals/floats. E.g., `$40.00` is stored as `4000`.

### Storing Files on Disk
*   Files (receipts, scans, documents) are stored on the local disk inside the `data/files/` hierarchy.
*   The database only stores file metadata (`file_path`, `mime_type`, `file_hash`) within the `documents` table to prevent database bloating.

### Links Beat Duplicate Foreign Key Columns
*   Instead of adding specific foreign keys to every table (e.g., adding `transaction_id` and `obligation_id` columns to `people` and `documents`), relationships are handled by the polymorphic **`links`** table.
*   This keeps schemas thin while offering high relational flexibility.

### Soft Deletion
*   Core operational tables feature `archived_at` and `deleted_at` datetime fields. Records are marked, not physically purged, preventing data loss.

### Alembic Migrations
*   All database changes must run through Alembic migrations. Direct schema mutations without migration records are forbidden.

---

## 4. SQLite Optimization Settings

To support WAL (Write-Ahead Logging) and relational constraints, the backend must run these pragmas on connection initialization:

```sql
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
PRAGMA synchronous=NORMAL;
```

---

## 5. File System & Backup Strategy

Data is organized under a single root directory:

```text
data/
├── db/
│   └── qilife.sqlite
├── files/
│   ├── documents/
│   ├── images/
│   ├── audio/
│   └── imports/
├── exports/
│   ├── markdown/
│   └── json/
└── backups/
```

*   **Backup Script**: A daily script runs `sqlite3 data/db/qilife.sqlite ".backup 'data/backups/qilife_YYYY-MM-DD_HHMM.sqlite'"` to create uncorrupted, hot-backup snapshots.
