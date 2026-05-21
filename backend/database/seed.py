from datetime import timedelta

from backend.database import queries
from backend.database.database import init_db
from backend.utils.meeting_utils import build_invite_link, new_meeting_identity, now_utc


def create_seed_meeting(
    *,
    host_id: int,
    title: str,
    description: str,
    meeting_type: str,
    scheduled_start: str,
    duration_minutes: int,
    status: str,
) -> int:
    meeting_uuid, meeting_code = new_meeting_identity()
    meeting_id = queries.create_meeting(
        meeting_uuid=meeting_uuid,
        meeting_code=meeting_code,
        host_id=host_id,
        title=title,
        description=description,
        meeting_type=meeting_type,
        scheduled_start=scheduled_start,
        duration_minutes=duration_minutes,
        status=status,
    )
    expires_at = (now_utc() + timedelta(days=7)).isoformat()
    queries.create_meeting_link(meeting_id, build_invite_link(meeting_code, "http://localhost:3000"), expires_at)
    return meeting_id


def seed_database() -> None:
    init_db()
    if queries.get_user_by_email("maya.raman@example.com"):
        print("Seed data already exists. Skipping.")
        return

    maya_id = queries.create_user("maya.raman", "maya.raman@example.com", "https://i.pravatar.cc/150?img=5")
    arjun_id = queries.create_user("arjun.dev", "arjun.dev@example.com", "https://i.pravatar.cc/150?img=12")
    nora_id = queries.create_user("nora.pm", "nora.pm@example.com", "https://i.pravatar.cc/150?img=32")
    liam_id = queries.create_user("liam.ops", "liam.ops@example.com", "https://i.pravatar.cc/150?img=47")

    architecture_meeting_id = create_seed_meeting(
        host_id=maya_id,
        title="AI Meeting Insights Architecture Review",
        description="Review transcript ingestion, summarization workflow, and dashboard analytics.",
        meeting_type="scheduled",
        scheduled_start=(now_utc() + timedelta(days=1, hours=2)).isoformat(),
        duration_minutes=45,
        status="scheduled",
    )
    product_sync_id = create_seed_meeting(
        host_id=nora_id,
        title="Weekly Product Sync",
        description="Roadmap alignment for collaboration and scheduling features.",
        meeting_type="scheduled",
        scheduled_start=(now_utc() + timedelta(days=3)).isoformat(),
        duration_minutes=60,
        status="scheduled",
    )
    incident_meeting_id = create_seed_meeting(
        host_id=arjun_id,
        title="Incident Review: Recording Pipeline",
        description="Post-incident review for async transcript processing latency.",
        meeting_type="instant",
        scheduled_start=(now_utc() - timedelta(days=2)).isoformat(),
        duration_minutes=35,
        status="ended",
    )
    demo_meeting_id = create_seed_meeting(
        host_id=maya_id,
        title="Customer Demo Dry Run",
        description="Practice demo flow for meeting rooms, participants, and AI notes.",
        meeting_type="scheduled",
        scheduled_start=(now_utc() - timedelta(hours=1)).isoformat(),
        duration_minutes=30,
        status="live",
    )

    incident_joined_at = now_utc() - timedelta(days=2, minutes=40)
    incident_left_at = now_utc() - timedelta(days=2, minutes=5)
    live_joined_at = now_utc() - timedelta(minutes=20)

    queries.create_participant(
        meeting_id=architecture_meeting_id,
        user_id=maya_id,
        display_name="Maya Raman",
        role="host",
    )
    queries.create_participant(
        meeting_id=architecture_meeting_id,
        user_id=arjun_id,
        display_name="Arjun Dev",
        role="participant",
    )
    queries.create_participant(
        meeting_id=product_sync_id,
        user_id=nora_id,
        display_name="Nora PM",
        role="host",
    )
    queries.create_participant(
        meeting_id=incident_meeting_id,
        user_id=arjun_id,
        display_name="Arjun Dev",
        role="host",
        joined_at=incident_joined_at.isoformat(),
        left_at=incident_left_at.isoformat(),
    )
    queries.create_participant(
        meeting_id=incident_meeting_id,
        user_id=liam_id,
        display_name="Liam Ops",
        role="participant",
        joined_at=(incident_joined_at + timedelta(minutes=5)).isoformat(),
        left_at=incident_left_at.isoformat(),
    )
    queries.create_participant(
        meeting_id=demo_meeting_id,
        user_id=maya_id,
        display_name="Maya Raman",
        role="host",
        joined_at=live_joined_at.isoformat(),
    )
    queries.create_participant(
        meeting_id=demo_meeting_id,
        user_id=nora_id,
        display_name="Nora PM",
        role="participant",
        mic_enabled=False,
        joined_at=(live_joined_at + timedelta(minutes=3)).isoformat(),
    )

    queries.create_meeting_history(
        meeting_id=incident_meeting_id,
        participant_count=2,
        started_at=incident_joined_at.isoformat(),
        ended_at=incident_left_at.isoformat(),
        total_duration=35,
    )
    queries.create_meeting_history(
        meeting_id=demo_meeting_id,
        participant_count=2,
        started_at=live_joined_at.isoformat(),
    )

    transcript_text = (
        "Maya opened the meeting by reviewing latency in the recording pipeline. "
        "Arjun proposed moving transcript normalization into a background worker. "
        "Liam will prepare observability dashboards and add alerts for failed AI summary jobs."
    )
    queries.create_transcript(
        incident_meeting_id,
        transcript_text,
        "en",
        "seed-manual-transcript",
    )
    queries.create_summary(
        incident_meeting_id,
        (
            "The team reviewed recording pipeline latency and agreed to separate transcript "
            "normalization from request handling. Observability gaps were identified."
        ),
        "mock-summary-engine",
    )
    queries.create_action_item(
        meeting_id=incident_meeting_id,
        action_text="Move transcript normalization to a background worker.",
        assigned_to="Arjun Dev",
        priority="high",
        status="open",
    )
    queries.create_action_item(
        meeting_id=incident_meeting_id,
        action_text="Create dashboard alerts for failed AI summary jobs.",
        assigned_to="Liam Ops",
        priority="medium",
        status="in_progress",
    )

    print("Seed data created successfully.")


if __name__ == "__main__":
    seed_database()
