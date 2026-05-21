# Backend Deployment

## Render or Railway

Build command:

```bash
pip install -r backend/requirements.txt
```

Start command:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

## Required Environment Variables

```text
PUBLIC_BASE_URL=https://your-backend-domain
SQLITE_DB_PATH=backend/zoom_clone.db
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GROQ_API_KEY=
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_MODEL=llama-3.1-8b-instant
```

## Database

The app initializes the SQLite schema on startup. Run the seed script once for demo data:

```bash
python -m backend.database.seed
```

For a production system, move the same normalized schema to PostgreSQL and keep the service/query boundary.
