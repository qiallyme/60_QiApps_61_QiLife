# Active code map

Production implementation exists only in the root application directories.
Historical implementations and copied reference applications are not retained in
this repository.

| Concern | Canonical location |
| --- | --- |
| Application entry point | `src/main.tsx` |
| Router composition | `src/app/createAppRoutes.tsx`, `src/app/AppRouter.tsx` |
| Module contract and registry | `src/app/moduleTypes.ts`, `src/app/moduleRegistry.ts` |
| Shared module frame | `src/app/ModuleRouteFrame.tsx` |
| Temporary compatibility route | `src/app/CompatibilityShellRoute.tsx` |
| Shared shell | `src/features/qilife/components/QiLifeShell.tsx` |
| Authentication boundary | `src/features/qilife/auth/` |
| Current modules | `src/modules/today/`, `actions/`, `projects/`, `people/`, `journal/` |
| Relationship contract and resolver | `src/features/qilife/relations/` |
| Shared QiRecord store | `src/features/qilife/services/qilifeStore.ts` |
| Authenticated API client | `src/lib/qiApiClient.ts` |
| Supabase client | `src/lib/supabaseClient.ts` |
| Database migrations | `supabase/migrations/` |
| Cloudflare configuration | `wrangler.jsonc` |
| Test setup and tests | `src/test/` and colocated `*.test.*` files |
| Current documentation | `README.md`, `docs/ARCHITECTURE.md`, `docs/architecture/`, `docs/decisions/`, `docs/superpowers/` |

Module routes are registered before the compatibility catch-all. Persistence
flows from module repositories through the shared store and Qi API; modules do
not own databases or Supabase clients.
