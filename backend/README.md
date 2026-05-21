# AI Zoom Clone Backend

Production-oriented FastAPI backend foundation for a scalable AI-powered meeting platform.

## Phase 1 Scope

This phase intentionally focuses on backend architecture only:

- FastAPI API structure
- SQLite database foundation
- SQLAlchemy models and relationships
- Pydantic request/response schemas
- Service-oriented business logic
- AI-ready OpenAI/Groq service wrappers
- Transcript and prompt utilities
- Seed data and system design documentation

Frontend pages and video streaming are intentionally out of scope for this phase.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Update `.env` with your keys if you want to test real AI providers.

## Initialize Database

```bash
cd ..
python -m backend.database.seed
```

The seed script creates sample users, upcoming meetings, recent meetings, a live meeting, participants, transcripts, AI summaries, and action items.

## Run API

```bash
uvicorn backend.main:app --reload
```

API docs:

- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health: `http://localhost:8000/health`

## API Overview

Meeting operations:

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
- `GET /api/v1/ai/meetings/{meeting_id}/transcripts`
- `POST /api/v1/ai/summaries/generate`
- `POST /api/v1/ai/action-items`

## Environment Configuration

`.env.example` documents the expected settings:

- `PUBLIC_BASE_URL` for generated invite links.
- `OPENAI_API_KEY` and `OPENAI_MODEL` for OpenAI calls.
- `GROQ_API_KEY`, `GROQ_BASE_URL`, and `GROQ_MODEL` for Groq's OpenAI-compatible API.

The AI routes default to a mock provider for safe local development. Real provider calls are available through the service wrappers.

## Architecture

The backend follows a thin-route architecture:

- `routes/` handles HTTP concerns only.
- `services/` owns business rules and database mutations.
- `utils/` provides reusable helpers for IDs, transcript normalization, prompts, and validation.
- `database/` owns SQLAlchemy models, Pydantic schemas, session handling, seed data, and system design docs.

Read the database design docs:

- `database/architecture.md`
- `database/relationships.md`

## Database Explanation

The schema uses normalized tables:

- `users`
- `meetings`
- `participants`
- `meeting_links`
- `meeting_history`
- `ai_meeting_summaries`
- `ai_action_items`
- `ai_transcripts`

The design includes foreign keys, indexes, constraints, timestamps, cascade rules, and append-friendly AI artifacts.

## AI Foundation

The AI layer is intentionally prepared but not deeply implemented in Phase 1:

- `OpenAIService` wraps standard OpenAI chat completion calls.
- `GroqService` uses the OpenAI client with Groq's base URL.
- Prompt templates are centralized in `utils/ai_utils.py`.
- Transcript utilities normalize text and extract lightweight topic signals.

This makes later phases ready for async summary generation, diarization, semantic search, action item approval, and model comparison.
