# SQL-Based Backend Architecture

## Why This Backend Uses Direct SQL

The backend now uses `sqlite3` and readable SQL instead of a heavy ORM layer.

That choice is intentional for this assignment:

- The database schema is small enough to understand directly.
- SQL makes relationships, indexes, and constraints visible during review.
- The service layer is easier to explain in interviews.
- There is less framework magic between the API and the database.
- The project still keeps clean modular boundaries without adding enterprise-style abstraction.

This is not a downgrade from good architecture. It is a practical architecture: strong schema design, simple query helpers, thin routes, and focused services.

## File Responsibilities

### `schema.sql`

Owns the database structure in plain SQL:

- table definitions
- foreign keys
- check constraints
- unique constraints
- indexes
- timestamp defaults

This file is the first place a reviewer can inspect the data model.

### `database.py`

Owns SQLite connection handling:

- opens connections
- enables foreign keys
- applies the schema
- exposes small `fetch_one`, `fetch_all`, and `execute` helpers

It avoids ORM session lifecycle concepts and keeps database access easy to follow.

### `queries.py`

Centralizes reusable SQL operations:

- meeting lookup and creation
- participant tracking
- dashboard counts
- transcript storage
- summary and action item storage

Services call these helpers so SQL stays in one database-focused module rather than being scattered through route files.

### `seed.py`

Creates realistic starter data:

- sample users
- upcoming meetings
- recent meetings
- live meeting
- participants
- meeting history
- transcript
- AI summary
- AI action items

## Schema Overview

The schema keeps the same production-minded collaboration model:

- `users`
- `meetings`
- `participants`
- `meeting_links`
- `meeting_history`
- `ai_transcripts`
- `ai_meeting_summaries`
- `ai_action_items`

The tables are normalized around real product concepts. Meeting metadata, attendance, invite links, history, transcripts, summaries, and tasks are stored separately because they change at different times and support different workflows.

## Indexing Strategy

Indexes target the actual API access patterns:

- `users.email` and `users.username` for identity lookup.
- `meetings.meeting_code` for the join flow.
- `meetings.host_id, status` for host dashboards.
- `meetings.scheduled_start` for upcoming schedules.
- `participants.meeting_id, role` for room sidebars and host checks.
- `meeting_history.started_at` for analytics.
- `ai_transcripts.meeting_id, created_at` for latest transcript reads.
- `ai_meeting_summaries.meeting_id, created_at` for summary history.
- `ai_action_items.meeting_id, status` for task panels.

## API Flow

Routes stay thin:

```text
FastAPI route -> service function -> query helper -> SQLite
```

The route handles HTTP shape. The service handles business rules. The query module handles SQL.

This keeps responsibilities clear without adding unnecessary layers.

## Scheduling Workflow

1. A host creates or schedules a meeting.
2. The service generates `meeting_uuid` and `meeting_code`.
3. SQL inserts the meeting row.
4. SQL inserts a meeting invite link.
5. Participants join through the meeting code.
6. The room can transition to live or ended.
7. Meeting history records duration and participant count.
8. Transcripts and AI artifacts attach to the meeting.

## AI Integration Architecture

The AI layer remains provider-ready:

- OpenAI wrapper for normal OpenAI calls.
- Groq wrapper using an OpenAI-compatible base URL.
- Prompt templates in a utility module.
- Transcript normalization before storage.

The database stores AI outputs as durable product artifacts, not provider-specific implementation details.

## Scalability Considerations

SQLite is simple and suitable for the assignment, but the schema is portable:

- Foreign keys model real ownership.
- Cascades keep meeting-owned data consistent.
- Public UUID/code fields avoid exposing only internal IDs.
- Append-friendly AI tables support reprocessing and model comparison.
- Index names and query shapes translate naturally to PostgreSQL later.

A future production migration could move `schema.sql` into Alembic or raw migration files without changing the service API.
