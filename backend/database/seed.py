from datetime import timedelta

from sqlalchemy import select

from backend.database.database import SessionLocal, init_db
from backend.database.models import AIActionItem, AIMeetingSummary, AITranscript, Meeting, MeetingHistory, MeetingLink, Participant, User
from backend.utils.meeting_utils import build_invite_link, new_meeting_identity, now_utc


def seed_database() -> None:
    init_db()
    db = SessionLocal()
    try:
        if db.scalar(select(User).where(User.email == "maya.raman@example.com")):
            print("Seed data already exists. Skipping.")
            return

        users = [
            User(username="maya.raman", email="maya.raman@example.com", avatar_url="https://i.pravatar.cc/150?img=5"),
            User(username="arjun.dev", email="arjun.dev@example.com", avatar_url="https://i.pravatar.cc/150?img=12"),
            User(username="nora.pm", email="nora.pm@example.com", avatar_url="https://i.pravatar.cc/150?img=32"),
            User(username="liam.ops", email="liam.ops@example.com", avatar_url="https://i.pravatar.cc/150?img=47"),
        ]
        db.add_all(users)
        db.flush()

        meeting_specs = [
            {
                "host": users[0],
                "title": "AI Meeting Insights Architecture Review",
                "description": "Review transcript ingestion, summarization workflow, and dashboard analytics.",
                "meeting_type": "scheduled",
                "scheduled_start": now_utc() + timedelta(days=1, hours=2),
                "duration_minutes": 45,
                "status": "scheduled",
            },
            {
                "host": users[2],
                "title": "Weekly Product Sync",
                "description": "Roadmap alignment for collaboration and scheduling features.",
                "meeting_type": "scheduled",
                "scheduled_start": now_utc() + timedelta(days=3),
                "duration_minutes": 60,
                "status": "scheduled",
            },
            {
                "host": users[1],
                "title": "Incident Review: Recording Pipeline",
                "description": "Post-incident review for async transcript processing latency.",
                "meeting_type": "instant",
                "scheduled_start": now_utc() - timedelta(days=2),
                "duration_minutes": 35,
                "status": "ended",
            },
            {
                "host": users[0],
                "title": "Customer Demo Dry Run",
                "description": "Practice demo flow for meeting rooms, participants, and AI notes.",
                "meeting_type": "scheduled",
                "scheduled_start": now_utc() - timedelta(hours=1),
                "duration_minutes": 30,
                "status": "live",
            },
        ]

        meetings: list[Meeting] = []
        for spec in meeting_specs:
            meeting_uuid, meeting_code = new_meeting_identity()
            meeting = Meeting(
                meeting_uuid=meeting_uuid,
                meeting_code=meeting_code,
                host_id=spec["host"].id,
                title=spec["title"],
                description=spec["description"],
                meeting_type=spec["meeting_type"],
                scheduled_start=spec["scheduled_start"],
                duration_minutes=spec["duration_minutes"],
                status=spec["status"],
            )
            db.add(meeting)
            db.flush()
            db.add(
                MeetingLink(
                    meeting_id=meeting.id,
                    invite_link=build_invite_link(meeting.meeting_code, "http://localhost:8000"),
                    expires_at=meeting.scheduled_start + timedelta(days=1) if meeting.scheduled_start else None,
                )
            )
            meetings.append(meeting)

        incident_joined_at = now_utc() - timedelta(days=2, minutes=40)
        incident_left_at = now_utc() - timedelta(days=2, minutes=5)
        live_joined_at = now_utc() - timedelta(minutes=20)

        db.add_all(
            [
                Participant(meeting_id=meetings[0].id, user_id=users[0].id, display_name="Maya Raman", role="host"),
                Participant(meeting_id=meetings[0].id, user_id=users[1].id, display_name="Arjun Dev", role="participant"),
                Participant(meeting_id=meetings[2].id, user_id=users[1].id, display_name="Arjun Dev", role="host", joined_at=incident_joined_at, left_at=incident_left_at),
                Participant(meeting_id=meetings[2].id, user_id=users[3].id, display_name="Liam Ops", role="participant", joined_at=incident_joined_at + timedelta(minutes=5), left_at=incident_left_at),
                Participant(meeting_id=meetings[3].id, user_id=users[0].id, display_name="Maya Raman", role="host", joined_at=live_joined_at),
                Participant(meeting_id=meetings[3].id, user_id=users[2].id, display_name="Nora PM", role="participant", joined_at=live_joined_at + timedelta(minutes=3), mic_enabled=False),
            ]
        )

        db.add(
            MeetingHistory(
                meeting_id=meetings[2].id,
                participant_count=2,
                started_at=incident_joined_at,
                ended_at=incident_left_at,
                total_duration=35,
            )
        )
        db.add(
            MeetingHistory(
                meeting_id=meetings[3].id,
                participant_count=2,
                started_at=live_joined_at,
            )
        )

        transcript_text = (
            "Maya opened the meeting by reviewing latency in the recording pipeline. "
            "Arjun proposed moving transcript normalization into a background worker. "
            "Liam will prepare observability dashboards and add alerts for failed AI summary jobs."
        )
        db.add(
            AITranscript(
                meeting_id=meetings[2].id,
                transcript_text=transcript_text,
                language="en",
                source_model="seed-manual-transcript",
            )
        )
        db.add(
            AIMeetingSummary(
                meeting_id=meetings[2].id,
                generated_summary=(
                    "The team reviewed recording pipeline latency and agreed to separate transcript "
                    "normalization from request handling. Observability gaps were identified."
                ),
                generated_by_model="mock-summary-engine",
            )
        )
        db.add_all(
            [
                AIActionItem(
                    meeting_id=meetings[2].id,
                    action_text="Move transcript normalization to a background worker.",
                    assigned_to="Arjun Dev",
                    priority="high",
                    status="open",
                ),
                AIActionItem(
                    meeting_id=meetings[2].id,
                    action_text="Create dashboard alerts for failed AI summary jobs.",
                    assigned_to="Liam Ops",
                    priority="medium",
                    status="in_progress",
                ),
            ]
        )

        db.commit()
        print("Seed data created successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
