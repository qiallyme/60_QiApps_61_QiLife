# QiLife — Cloudflare Pages Deployment

**Repo:** `qiallyme/52_QiApp_QiLife`
**Framework:** Vite + React + TypeScript
**Database:** Supabase

---

## Cloudflare Pages Build Settings

Go to your Cloudflare Pages project → **Settings → Build & deployments**

| Setting | Value |
| ------- | ----- |
| **Framework preset** | `None` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `frontend` |
| **Node.js version** | `18` (or `20`) |

> **Root directory is critical.** The app is in `frontend/`, not the repo root.
> Cloudflare runs `npm run build` from inside `frontend/`.

---

## Environment Variables

Go to **Settings → Environment variables** and add these for **both Production and Preview**:

| Variable | Value | Notes |
| -------- | ----- | ----- |
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Public anon key (safe to expose) |
| `VITE_API_BASE_URL` | `https://your-qiserver-url` | QiServer backend (if active) |

> **Important:** Cloudflare bakes `VITE_*` env vars into the bundle at build time.
> They are NOT secret at runtime — use only the Supabase **anon key**, never the service key.

### Where to find your Supabase values
1. Go to [supabase.com](https://supabase.com) → your project
2. **Settings → API**
3. Copy **Project URL** → `VITE_SUPABASE_URL`
4. Copy **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## Local `.env.local` (never committed)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> `.env.local` is in `.gitignore` — Cloudflare uses its own env var settings, not this file.

---

## Deploy Steps

### First deploy
1. Connect repo `qiallyme/52_QiApp_QiLife` in Cloudflare Pages
2. Set build settings above
3. Add env vars
4. Run the SQL migrations (see `supabase/SQL_RUNS.md`)
5. Deploy

### Re-deploy after code changes
```bash
git add .
git commit -m "your message"
git push
# Cloudflare auto-deploys on push to main
```

### Re-deploy after env var changes
- Go to Cloudflare Pages → Deployments → Retry last deployment
- (Env var changes require a rebuild to take effect)

---

## Verify the deployment works

After deploy, open your Cloudflare Pages URL and:

1. ✅ `/` — existing app loads
2. ✅ `/qilife` — QiLife shell loads (sidebar, topbar, home dashboard)
3. ✅ Click **People** → table view loads (empty until DB is connected)
4. ✅ Click **+ Capture** → modal opens, can type, save attempts Supabase write
5. ✅ Reload `/qilife/people` directly — React Router redirects work (not 404)

---

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| Build fails: `Cannot find module` | Check root directory is set to `frontend` |
| White screen on `/qilife` | Check `_redirects` file is in `frontend/public/` |
| Supabase calls fail | Check env vars are set in Cloudflare, not just `.env.local` |
| `schema "qilife" does not exist` | Run migration `20260623000000_qilife_records_shell.sql` |
| 404 on page refresh | `_redirects` file missing from `public/` — already included |
