from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.database.models import AIMeetingSummary, AITranscript, Meeting, Participant
from backend.database.schemas import DashboardOverview


def get_dashboard_overview(db: Session) -> DashboardOverview:
    total_meetings = db.scalar(select(func.count(Meeting.id))) or 0
    live_meetings = db.scalar(select(func.count(Meeting.id)).where(Meeting.status == "live")) or 0
    upcoming_meetings = db.scalar(select(func.count(Meeting.id)).where(Meeting.status == "scheduled")) or 0
    completed_meetings = db.scalar(select(func.count(Meeting.id)).where(Meeting.status == "ended")) or 0
    total_participants = db.scalar(select(func.count(Participant.id))) or 0
    total_transcripts = db.scalar(select(func.count(AITranscript.id))) or 0
    total_ai_summaries = db.scalar(select(func.count(AIMeetingSummary.id))) or 0

    recent_meetings = list(db.scalars(select(Meeting).order_by(Meeting.created_at.desc()).limit(5)))
    upcoming_schedule = list(
        db.scalars(
            select(Meeting)
            .where(Meeting.status == "scheduled")
            .order_by(Meeting.scheduled_start.asc())
            .limit(5)
        )
    )

    return DashboardOverview(
        total_meetings=total_meetings,
        live_meetings=live_meetings,
        upcoming_meetings=upcoming_meetings,
        completed_meetings=completed_meetings,
        total_participants=total_participants,
        total_transcripts=total_transcripts,
        total_ai_summaries=total_ai_summaries,
        recent_meetings=recent_meetings,
        upcoming_schedule=upcoming_schedule,
    )
