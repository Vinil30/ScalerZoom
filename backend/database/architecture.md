# Database Architecture

## Purpose

This SQLite schema is designed as a normalized backend foundation for an AI-powered Zoom-like collaboration platform. The goal is to model meetings, attendees, scheduling, historical analytics, and AI artifacts without coupling those concepts into one oversized table.

The schema intentionally separates operational meeting state from analytics and AI outputs. That makes the backend easier to extend later with recordings, chat, billing, teams, calendars, vector search, background jobs, and provider-specific AI metadata.

## Tables

### users

Stores platform identities that can host meetings, join meetings, receive action items, and later belong to organizations or workspaces.

Key design choices:

- `email` and `username` are unique and indexed for identity lookup.
- `avatar_url` is optional because invited guests may not need a complete profile in future phases.
- `created_at` and `updated_at` support audit-friendly account lifecycle tracking.

### meetings

Stores the primary meeting object. It represents both scheduled and instant meetings.

Key design choices:

- `meeting_uuid` is a stable external identifier for public APIs, logs, and distributed integrations.
- `meeting_code` is a short join code optimized for user-facing invite flows.
- `host_id` points to `users`, preserving ownership and future authorization rules.
- `meeting_type` and `status` use constrained values to prevent invalid state.
- `scheduled_start` and `duration_minutes` support calendar-style scheduling and dashboard queries.

### participants

Tracks the relationship between a person and a meeting session.

Key design choices:

- `meeting_id` is required; a participant record has no meaning without a meeting.
- `user_id` is nullable so future guest users can join without full account creation.
- `role` supports host, cohost, participant, and guest behavior.
- `joined_at` and `left_at` support attendance analytics and session reconstruction.
- `mic_enabled` and `video_enabled` capture current session state without implementing media streaming yet.

### meeting_links

Stores invite URLs separately from meetings so link behavior can evolve independently.

Key design choices:

- A meeting can have multiple links over time for rotations, expiring invites, or role-specific invite URLs.
- `expires_at` enables security-friendly invite expiration.
- The invite link is unique to prevent duplicate join URLs.

### meeting_history

Stores historical runtime data for ended or active sessions.

Key design choices:

- Kept separate from `meetings` because the same logical meeting can later support recurring sessions.
- `participant_count`, `started_at`, `ended_at`, and `total_duration` are analytics-friendly.
- This table is the right place to grow future metrics like peak participants, reconnect count, recording duration, or network quality.

### ai_transcripts

Stores transcripts generated or uploaded for a meeting.

Key design choices:

- Multiple transcripts per meeting are supported for retries, language variants, diarization passes, or provider migrations.
- `language` prepares the system for multilingual meetings.
- `source_model` records where the transcript came from for auditability and model comparison.

### ai_meeting_summaries

Stores generated meeting summaries.

Key design choices:

- Kept separate from transcripts because summaries are derived artifacts and may be regenerated.
- `generated_by_model` allows comparison between OpenAI, Groq, mock, and future providers.
- Multiple summaries per meeting support model upgrades and prompt versioning.

### ai_action_items

Stores AI-generated or manually accepted tasks from a meeting.

Key design choices:

- Action items are meeting-scoped and can later be linked to real users, external project management tools, or notifications.
- `priority` and `status` are constrained to maintain clean dashboard data.
- `assigned_to` is intentionally text for Phase 1 so AI output can be stored even when it does not map cleanly to a platform user.

## Indexing Strategy

Indexes are chosen around realistic API access patterns:

- `users.email` and `users.username` accelerate login and identity lookups.
- `meetings.meeting_code` supports the join flow.
- `meetings.host_id + status` supports host dashboards.
- `meetings.scheduled_start` supports upcoming meeting calendars.
- `participants.meeting_id + role` supports participant lists and host/cohost checks.
- `meeting_history.started_at` supports recent meeting analytics.
- `ai_transcripts.meeting_id + created_at` supports fetching the latest transcript.
- `ai_meeting_summaries.meeting_id + created_at` supports summary history.
- `ai_action_items.meeting_id + status` supports dashboard task widgets.

## Scalability Considerations

SQLite is appropriate for the assignment phase, but the schema follows patterns that transfer cleanly to PostgreSQL:

- Tables are normalized around clear domain boundaries.
- Foreign keys and cascades preserve data integrity.
- Public identifiers use UUID-style values rather than exposing database-only IDs.
- AI artifacts are append-friendly, which supports async processing and audit trails.
- Meeting state is separated from participant state and historical analytics.

Future production growth paths:

- Move from SQLite to PostgreSQL with Alembic migrations.
- Add organizations, teams, and workspace-level authorization.
- Add background job tables for transcript and summary processing.
- Add object storage references for recordings.
- Add vector embeddings for semantic transcript search.
- Add calendar integration tables for Google Calendar and Outlook.

## AI Integration Architecture

The AI schema is provider-neutral. Transcripts, summaries, and action items are stored as domain artifacts rather than OpenAI-specific objects.

The service layer prepares:

- OpenAI-compatible request wrappers.
- Groq integration through the OpenAI client with a custom base URL.
- Centralized prompt templates.
- Transcript normalization and keyword utilities.

This allows Phase 2 or Phase 3 to add real async AI generation without changing core meeting tables.

## Scheduling Workflow

The scheduling workflow is:

1. A host creates a scheduled meeting.
2. The backend generates `meeting_uuid` and `meeting_code`.
3. A meeting link is created with an optional expiration time.
4. Participants join by meeting code.
5. The meeting transitions from `scheduled` to `live`.
6. `meeting_history` captures start/end timing and participant count.
7. Transcripts and AI summaries attach to the meeting after or during the session.

## Why This Is Not A Beginner CRUD Schema

The schema is intentionally built around system behavior:

- Meetings are operational records.
- Participants are session attendance records.
- Links are invite/security records.
- History is analytics state.
- Transcripts, summaries, and action items are AI artifacts.

That separation makes the backend easier to explain in interviews and easier to evolve in later phases.
