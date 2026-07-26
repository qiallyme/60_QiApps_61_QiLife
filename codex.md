# QiLife repository instructions

Work directly on `main` unless the user explicitly changes the workflow.
Preserve unrelated changes and verify behavior before committing.

## Authoritative locations

- Production application code lives in root `src/`.
- Static application assets live in root `public/`.
- Database migrations live only in root `supabase/migrations/`.
- Root `package.json`, TypeScript, Vite, Vitest, and Wrangler configuration is
  authoritative.
- Current architecture documentation lives under `docs/architecture/`,
  `docs/decisions/`, and `docs/superpowers/`.

## Architecture rules

- New modules use the typed contract and central registry in `src/app/`.
- New screens are URL-first. Preserve the temporary compatibility shell only for
  a specific working feature.
- Shared QiRecords are canonical. Use module repositories and
  `src/features/qilife/services/qilifeStore.ts`.
- Use `src/lib/qiApiClient.ts` and the single shared Supabase client.
- Do not introduce per-module tables, Supabase clients, local databases, queues,
  or sync engines.
- Reuse the shared relationship field contract and resolver.
- Preserve Journal raw-capture immutability and navigation protection.

## Repository boundaries

- Do not recreate old implementation trees.
- Do not copy reference projects into this repository.
- Documentation must not contain duplicate runnable applications.
- Generated output, caches, temporary databases, and local secrets are not
  repository content.

Run `npm run test:ci`, `npm run build`, and `git diff --check` for full
verification.
