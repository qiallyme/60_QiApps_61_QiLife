# QiLife Validation Checklist

Use this checklist to verify the corrected v1 implementation.

## 1. Database & Schema Validation

Run validation against `data/db/qilife.sqlite`.

- `[ ]` Confirm canonical tables exist:
  ```sql
  SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;
  ```
- `[ ]` Confirm bucket seed count:
  ```sql
  SELECT count(*) FROM buckets; -- Expect 14
  ```
- `[ ]` Confirm money fields use integer cents:
  ```sql
  PRAGMA table_info(transactions);
  PRAGMA table_info(obligations);
  ```
- `[ ]` Confirm provenance links exist:
  ```sql
  SELECT source_type, target_type, relationship
  FROM links
  WHERE relationship IN ('created_from', 'explains', 'relates_to');
  ```

## 2. API Validation

- `[ ]` QiBit quick capture
  ```bash
  curl -X POST http://127.0.0.1:8000/api/qibits/capture \
    -H "Content-Type: application/json" \
    -d '{"raw_capture":"Need to follow up on surplus check","captured_at":"2026-05-29T10:00:00-05:00"}'
  ```
  Expect: created QiBit with status `new`.

- `[ ]` QiBit triage
  1. Capture a new QiBit.
  2. Extract its returned ULID.
  3. Post triage:
     ```bash
     curl -X POST http://127.0.0.1:8000/api/qibits/<ULID>/triage \
       -H "Content-Type: application/json" \
       -d '{"bucket_code":"70","action_required":true}'
     ```
  Expect: status becomes `triaged` and any approved downstream records are linked.

- `[ ]` Action step creation
  1. Create or locate an action ULID.
  2. Post a step:
     ```bash
     curl -X POST http://127.0.0.1:8000/api/actions/<ULID>/steps \
       -H "Content-Type: application/json" \
       -d '{"title":"Verify tracking number","sort_order":1}'
     ```
  Expect: created step linked to the action.

## 3. Timeline Validation

- `[ ]` Timeline endpoint returns projected rows from more than one table.
- `[ ]` Timeline contains newly captured QiBits.
- `[ ]` Completed actions sort by `completed_at`.
- `[ ]` Transactions sort by `date`.
- `[ ]` Daily summaries appear as distinct summary records, not as activity log rows.

## 4. Context Dock Validation

- `[ ]` Opening a thread shows linked knowledge, money, people, and QiBits.
- `[ ]` Imported repo docs appear read-only.
- `[ ]` Tags assist retrieval but do not replace direct links.

## 5. AI Workflow Validation

- `[ ]` AI suggestions land in `ai_outputs` first.
- `[ ]` Accepting a suggestion writes to primary tables once.
- `[ ]` Ask QiLife returns supporting records with stable IDs.
- `[ ]` Saving an AI answer creates an action, knowledge item, or QiBit, not a `notes` table row.
