# QiLife

QiLife is the private Life OS application in the QiApps family.

## Canonical application

There is exactly one deployable frontend in this repository:

- App root: `qilife.2`
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- API: `https://api.qially.com`
- Authentication: Supabase Auth using a publishable key
- Application data: authenticated `/v1/life/*` requests through Qi API

The historical `qilife/frontend` prototype is retired and must not be used as a build root or deployment source.

## Cloudflare deployment

For Cloudflare Pages:

- Root directory: `qilife.2`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `24`

Required build variables:

- `VITE_QI_API_URL=https://api.qially.com`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The app also contains `qilife.2/wrangler.jsonc` for Cloudflare Workers Static Assets deployments. SPA fallback is configured for both Pages and Workers.

## Local validation

```bash
cd qilife.2
npm ci
npm run build
npm run dev
```

Do not merge a change that fails the repository CI build.
