-- ============================================================
-- QiLife SQL Run Log
-- ============================================================
-- Run these migrations IN ORDER against your Supabase project.
-- Use the Supabase SQL Editor or `supabase db push`.
--
-- Status key:
--   [ ] = not yet run
--   [x] = run and confirmed
-- ============================================================

## Migration Queue

| Order | File                                         | Status | Notes                          |
| ----- | -------------------------------------------- | ------ | ------------------------------ |
| 01    | supabase/migrations/20260616183000_create_qilife_alpha_core.sql | [ ] | Original alpha schema (qilife_entities, qilife_buckets) |
| 02    | supabase/migrations/20260623000000_qilife_records_shell.sql     | [ ] | New qilife schema + records table for Cadence-pattern shell |

## How to run

### Option A — Supabase SQL Editor (easiest)
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Paste each file content IN ORDER and click Run

### Option B — Supabase CLI
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Option C — Direct psql
```bash
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  -f supabase/migrations/20260616183000_create_qilife_alpha_core.sql
psql "..." -f supabase/migrations/20260623000000_qilife_records_shell.sql
```

## After running

Update this file:
- Mark each migration [x] once confirmed
- Note the date run and any issues

## Your Supabase project

- **Project ref:** (fill in)
- **Region:** (fill in)
- **Database password:** (in your password manager, NOT here)
