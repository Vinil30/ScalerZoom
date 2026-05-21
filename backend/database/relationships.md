# Database Relationships

## Relationship Flow

The platform centers on `users` and `meetings`.

```text
users
  ├── meetings.host_id
  └── participants.user_id

meetings
  ├── participants.meeting_id
  ├── meeting_links.meeting_id
  ├── meeting_history.meeting_id
  ├── ai_transcripts.meeting_id
  ├── ai_meeting_summaries.meeting_id
  └── ai_action_items.meeting_id
```

## users to meetings

Relationship: one user can host many meetings.

Implementation:

- `meetings.host_id` references `users.id`.
- Host deletion is restricted to avoid orphaning important meeting records.
- This relationship supports future permissions such as "only hosts can start, end, cancel, or invite."

## users to participants

Relationship: one user can participate in many meetings.

Implementation:

- `participants.user_id` references `users.id`.
- The foreign key uses `SET NULL` so historical attendance can survive if a user profile is removed.
- Guest participation is supported by allowing `user_id` to be null while preserving `display_name`.

## meetings to participants

Relationship: one meeting can have many participants.

Implementation:

- `participants.meeting_id` references `meetings.id`.
- Deleting a meeting cascades participant rows because participant records are scoped to that meeting.
- `(meeting_id, user_id)` is unique to prevent duplicate authenticated attendance records.

Participant tracking logic:

- `joined_at` records session entry time.
- `left_at` records exit time and remains null while the participant is active.
- `role` enables host, cohost, participant, and guest behavior.
- `mic_enabled` and `video_enabled` prepare for real-time state without implementing streaming yet.

## meetings to meeting_links

Relationship: one meeting can have many invite links.

Implementation:

- `meeting_links.meeting_id` references `meetings.id`.
- Links cascade when their parent meeting is deleted.
- `expires_at` prepares for rotating links, expiring links, and future security controls.

## meetings to meeting_history

Relationship: one meeting can have many history rows.

Implementation:

- `meeting_history.meeting_id` references `meetings.id`.
- Multiple rows allow recurring sessions or restarted meetings later.
- `participant_count` and `total_duration` support analytics without recalculating from raw participant rows on every dashboard request.

## meetings to ai_transcripts

Relationship: one meeting can have many transcripts.

Implementation:

- `ai_transcripts.meeting_id` references `meetings.id`.
- Multiple transcripts support different languages, retries, diarization passes, and provider migrations.
- `source_model` documents whether the transcript came from a manual upload, OpenAI, Groq, Whisper, or a future provider.

Transcript architecture:

- Transcript ingestion belongs in the service layer.
- Raw transcript text is normalized before storage.
- Derived artifacts such as summaries and action items should reference the meeting, not mutate the original transcript.

## meetings to ai_meeting_summaries

Relationship: one meeting can have many AI summaries.

Implementation:

- `ai_meeting_summaries.meeting_id` references `meetings.id`.
- Multiple summaries support prompt versioning, model comparison, regeneration, and user-approved summary variants.
- `generated_by_model` preserves audit context.

## meetings to ai_action_items

Relationship: one meeting can have many AI action items.

Implementation:

- `ai_action_items.meeting_id` references `meetings.id`.
- `priority` and `status` are constrained values for clean dashboard filtering.
- `assigned_to` remains text in Phase 1 because AI output may refer to people who are not platform users.

## Cascading Behavior

Meeting-owned records cascade:

- participants
- meeting links
- meeting history
- AI transcripts
- AI summaries
- AI action items

User-owned meeting records do not cascade:

- Hosted meetings are protected with restricted deletion semantics.
- Participant `user_id` can become null while preserving historical attendance.

## Future Extensibility

This relationship model can grow into:

- `organizations` and `organization_members`
- `meeting_recordings`
- `chat_messages`
- `reaction_events`
- `calendar_events`
- `meeting_series` for recurring meetings
- `ai_prompt_runs` for prompt/model metadata
- `transcript_segments` for speaker-level diarization
- `embedding_chunks` for semantic search

The current design keeps those additions natural because core concepts already have separate ownership boundaries.
