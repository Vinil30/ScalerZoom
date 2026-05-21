# Interview Preparation Notes

## Why Normalize The Database?

Meetings, participants, links, history, transcripts, summaries, and action items are separate because they represent different product concepts. This avoids duplicated data, keeps queries predictable, and makes future features easier to add.

## Why Separate AI Tables?

AI outputs are derived artifacts. A meeting can have multiple transcripts, summaries, or action item generations over time. Separate AI tables make regeneration, auditability, and model comparison possible.

## Why A Service-Based Backend?

Routes should only handle HTTP concerns. Services hold business rules like meeting creation, join validation, transcript processing, and AI orchestration. This keeps the backend readable and testable.

## Why Zustand?

Zustand gives small, modular stores for dashboard, meeting, participant, and AI state. It avoids prop drilling without introducing heavy Redux-style boilerplate.

## Why SQLite?

SQLite keeps deployment simple for the assignment, but the schema is designed like a real relational system: foreign keys, indexes, constraints, cascade rules, and normalized tables. The design can move to PostgreSQL later.

## How Is AI Integration Designed?

The frontend submits transcripts. The backend stores the transcript, calls a provider abstraction, parses output, and persists summaries/action items. OpenAI and Groq are supported, with a local fallback for reliability.

## How Would Streaming Scale Later?

The current app implements local media preview. A real production version would add WebSocket signaling, peer connection negotiation, TURN servers, and eventually an SFU for multi-party scalability.

## Strong Talking Points

- The schema is intentionally normalized and interview-readable.
- AI outputs are persisted, not just displayed temporarily.
- API calls are centralized with timeout/retry handling.
- The frontend is split by features and reusable components.
- The media layer is scoped realistically instead of overengineering fake conferencing infrastructure.
