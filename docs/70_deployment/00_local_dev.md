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

## Development Rules

- Treat repo `docs/` as canonical system knowledge.
- Keep imported repo docs read-only in the app.
- Do not create a separate wiki service for v1.
