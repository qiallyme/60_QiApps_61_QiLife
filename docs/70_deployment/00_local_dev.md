# Local Development Setup

## Canonical Local Paths

- backend app root: `C:\QiLabs\60_QiApps\_qilife\backend`
- frontend app root: `C:\QiLabs\60_QiApps\_qilife\frontend`
- SQLite database path: `C:\QiLabs\60_QiApps\_qilife\data\db\qilife.sqlite`

## Backend

1. Create and activate a virtual environment.
2. Install backend dependencies from `requirements.txt`.
3. Run Alembic migrations.
4. Run the seed command.
5. Start FastAPI on `127.0.0.1:8000`.

Python's standard library already includes SQLite support; do not add `sqlite3` as a pip dependency.

## Frontend

1. Install dependencies in `frontend/`.
2. Set `VITE_API_URL=http://127.0.0.1:8000`.
3. Start Vite on `127.0.0.1:5173`.

## Deployment Doctrine

We use a single API base URL strategy across environments.
- **Frontend App**: Hosted on Cloudflare Pages.
- **Backend App**: Hosted on `qiserver` running the real FastAPI application with local SQLite.
- **Optional Gateway**: A future Cloudflare Worker may act as a proxy or gateway, but is not the primary backend currently.

### Frontend API Configuration
- Uses `VITE_API_BASE_URL` for all backend API calls.
- **Local Dev**: `http://localhost:8000`
- **Production**: `https://qilife-api.qially.com`
- Do not hardcode localhost in components.
- On startup, the frontend checks the backend health. If offline, it shows "Local fallback mode" and safely uses localStorage fallback for v1 features.

## Development Rules

- Treat repo `docs/` as canonical system knowledge.
- Keep imported repo docs read-only in the app.
- Do not create a separate wiki service for v1.
