# QiLife

QiLife is an AI LifeDesk. The current working loop is:

Capture -> Agent Draft -> Review -> Save -> Timeline -> Dashboard / Actions / Recent QiBits

## Current Mode

- Frontend is deployed on Cloudflare Pages.
- Backend is not required for the core capture loop today.
- If `VITE_API_BASE_URL` is unset or the API is offline, the frontend runs in localStorage fallback mode.
- Local fallback mode should not show fake API-connected state or raw `Failed to fetch` cards.

## Local Development

### Frontend

1. `cd frontend`
2. `npm ci`
3. Optional: set `VITE_API_BASE_URL=http://127.0.0.1:8000` in `.env.local`
4. `npm run dev`

If `VITE_API_BASE_URL` is omitted, the frontend still works in local fallback mode.

### Backend

1. `cd backend`
2. Create and activate a virtual environment
3. `pip install -r requirements.txt`
4. `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`

SQLite path defaults to:

- `C:\QiLabs\60_QiApps\_qilife\data\db\qilife.sqlite`

## Cloudflare Pages

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`

## API Configuration

- Frontend reads all API traffic from `VITE_API_BASE_URL`
- Local dev API example: `http://127.0.0.1:8000`
- Future `qiserver` API target: `https://qilife-api.qially.com`

## Knowledge Source

- Repo docs under `docs/` are the source of truth
- The frontend Knowledge page should index repo docs when a backend docs endpoint is available
