# Database Relationships

## Relationship Map

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

## users -> meetings

A user can host many meetings.

`meetings.host_id` references `users.id` with restricted deletion. That keeps meeting history from accidentally losing its owner.

## users -> participants

A user can participate in many meetings.

`participants.user_id` is nullable. This supports guest joins while preserving display names. If a user profile is removed later, historical attendance can remain.

## meetings -> participants

A meeting can have many participants.

Participant rows track:

- display name
- role
- join time
- leave time
- mic state
- video state

This keeps the meeting room UI and attendance analytics separate from the core meeting record.

## meetings -> meeting_links

A meeting can have multiple invite links.

This supports future link rotation, expiration, role-specific links, and security controls without changing the `meetings` table.

## meetings -> meeting_history

A meeting can have many history rows.

That may look larger than Phase 1 needs, but it keeps the model ready for recurring meetings or restarted sessions. Historical records store participant counts, start times, end times, and duration.

## meetings -> ai_transcripts

A meeting can have many transcripts.

This supports:

- manual uploads
- provider retries
- language variants
- diarization improvements
- future transcript segmenting

The latest transcript can be fetched with a simple indexed query.

## meetings -> ai_meeting_summaries

A meeting can have many summaries.

This allows summaries to be regenerated when prompts or models improve. `generated_by_model` keeps the output explainable.

## meetings -> ai_action_items

A meeting can have many action items.

Action items are stored separately because they behave like tasks. They have priority, status, optional assignment text, and their own generated timestamp.

## Cascading Rules

Meeting-owned records cascade when a meeting is deleted:

- participants
- meeting links
- meeting history
- transcripts
- summaries
- action items

User-owned records do not cascade through hosted meetings. This protects collaboration history.

## Why The Relationship Design Is Practical

The schema is easy to explain:

- `meetings` stores the room/schedule.
- `participants` stores attendance.
- `meeting_links` stores invites.
- `meeting_history` stores analytics.
- AI tables store generated knowledge.

This is the right amount of structure for a recruiter-facing fullstack project: normalized, readable, and extensible without hiding everything behind ORM relationships.
