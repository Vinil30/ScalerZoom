# AI Zoom Clone Backend

FastAPI backend for an AI-powered Zoom-like meeting platform.

The backend now uses a practical SQL-first architecture:

- FastAPI routes
- Pydantic API schemas
- SQLite
- direct `sqlite3` queries
- readable `schema.sql`
- lightweight service functions
- OpenAI/Groq-ready AI service wrappers

## Why Direct SQL

The assignment benefits from clear SQL more than heavy ORM abstraction.

Direct SQL makes the database design easy to review and easy to explain:

- tables are visible in `database/schema.sql`
- relationships are explicit through foreign keys
- indexes are obvious
- queries are readable
- services are short and practical

The result is still modular, but it avoids unnecessary ORM complexity.

## Backend Structure

```text
backend/
  main.py
  schemas.py
  routes/
  services/
  utils/
  database/
    database.py
    schema.sql
    queries.py
    seed.py
    architecture.md
    relationships.md
```

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Initialize Database

From the project root:

```bash
python -m backend.database.seed
```

The seed script creates users, meetings, participants, meeting history, transcripts, summaries, and action items.

## Run API

From the project root:

```bash
uvicorn backend.main:app --reload
```

API docs:

- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health: `http://localhost:8000/health`

## API Overview

Meetings:

- `POST /api/v1/meetings`
- `GET /api/v1/meetings`
- `GET /api/v1/meetings/{meeting_id}`
- `PATCH /api/v1/meetings/{meeting_id}`
- `POST /api/v1/meetings/{meeting_id}/start`
- `POST /api/v1/meetings/{meeting_id}/end`
- `POST /api/v1/meetings/join`

Scheduling:

- `POST /api/v1/schedule`
- `GET /api/v1/schedule/upcoming`
- `POST /api/v1/schedule/{meeting_id}/cancel`

Participants:

- `GET /api/v1/participants/meeting/{meeting_id}`
- `PATCH /api/v1/participants/{participant_id}`
- `POST /api/v1/participants/{participant_id}/leave`

Dashboard:

- `GET /api/v1/dashboard/overview`

AI:

- `POST /api/v1/ai/transcripts`
- `POST /api/v1/ai/transcripts/process`
- `GET /api/v1/ai/meetings/{meeting_id}/transcripts`
- `GET /api/v1/ai/meetings/{meeting_id}/summaries`
- `POST /api/v1/ai/summaries/generate`
- `GET /api/v1/ai/meetings/{meeting_id}/action-items`
- `POST /api/v1/ai/action-items/generate`
- `POST /api/v1/ai/action-items`

## Database Design

Tables:

- `users`
- `meetings`
- `participants`
- `meeting_links`
- `meeting_history`
- `ai_transcripts`
- `ai_meeting_summaries`
- `ai_action_items`

The schema keeps foreign keys, constraints, indexes, timestamps, UUIDs, meeting codes, and cascade rules.

Read:

- `database/architecture.md`
- `database/relationships.md`
- `database/schema.sql`

## AI Foundation

The AI layer is intentionally lightweight:

- `OpenAIService` wraps OpenAI chat completions.
- `GroqService` uses the OpenAI client with Groq's base URL.
- prompt templates live in `utils/ai_utils.py`
- transcript cleanup lives in `utils/transcript_utils.py`

The frontend can already call transcript and summary endpoints, while real provider use can be enabled through `.env`.

Phase 3 adds an end-to-end transcript processing endpoint. It stores the submitted transcript, generates a summary, extracts action items, and returns all persisted artifacts in one response. If OpenAI or Groq keys are configured, those providers are used; otherwise the app falls back to local meeting-intelligence heuristics so the workflow remains demoable.
