from datetime import timedelta
import os

from fastapi import HTTPException, status
from dotenv import load_dotenv
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.database.models import Meeting, MeetingHistory, MeetingLink, Participant, User
from backend.database.schemas import JoinMeetingRequest, MeetingCreate, MeetingScheduleCreate, MeetingUpdate, ParticipantUpdate
from backend.utils.meeting_utils import build_invite_link, new_meeting_identity, now_utc
from backend.utils.validation_utils import ensure_future_datetime


load_dotenv()

PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")


def get_meeting_or_404(db: Session, meeting_id: int) -> Meeting:
    meeting = db.get(Meeting, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")
    return meeting


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


def create_meeting(db: Session, payload: MeetingCreate) -> tuple[Meeting, MeetingLink]:
    get_user_or_404(db, payload.host_id)
    if payload.meeting_type == "scheduled" and payload.scheduled_start is not None:
        ensure_future_datetime(payload.scheduled_start, "scheduled_start")

    meeting_uuid, meeting_code = new_meeting_identity()
    meeting = Meeting(
        meeting_uuid=meeting_uuid,
        meeting_code=meeting_code,
        host_id=payload.host_id,
        title=payload.title,
        description=payload.description,
        meeting_type=payload.meeting_type,
        scheduled_start=payload.scheduled_start,
        duration_minutes=payload.duration_minutes,
        status="scheduled",
    )
    db.add(meeting)
    db.flush()

    link = MeetingLink(
        meeting_id=meeting.id,
        invite_link=build_invite_link(meeting.meeting_code, PUBLIC_BASE_URL),
        expires_at=(payload.scheduled_start + timedelta(days=1)) if payload.scheduled_start else None,
    )
    db.add(link)
    db.commit()
    db.refresh(meeting)
    db.refresh(link)
    return meeting, link


def schedule_meeting(db: Session, payload: MeetingScheduleCreate) -> tuple[Meeting, MeetingLink]:
    ensure_future_datetime(payload.scheduled_start, "scheduled_start")
    return create_meeting(db, payload)


def list_meetings(db: Session, status_filter: str | None = None, limit: int = 50) -> list[Meeting]:
    statement = select(Meeting).order_by(Meeting.created_at.desc()).limit(limit)
    if status_filter:
        statement = select(Meeting).where(Meeting.status == status_filter).order_by(Meeting.created_at.desc()).limit(limit)
    return list(db.scalars(statement))


def update_meeting(db: Session, meeting_id: int, payload: MeetingUpdate) -> Meeting:
    meeting = get_meeting_or_404(db, meeting_id)
    update_data = payload.model_dump(exclude_unset=True)
    if "scheduled_start" in update_data and update_data["scheduled_start"] is not None:
        ensure_future_datetime(update_data["scheduled_start"], "scheduled_start")
    for field, value in update_data.items():
        setattr(meeting, field, value)
    db.commit()
    db.refresh(meeting)
    return meeting


def start_meeting(db: Session, meeting_id: int) -> Meeting:
    meeting = get_meeting_or_404(db, meeting_id)
    meeting.status = "live"
    db.add(MeetingHistory(meeting_id=meeting.id, started_at=now_utc(), participant_count=len(meeting.participants)))
    db.commit()
    db.refresh(meeting)
    return meeting


def end_meeting(db: Session, meeting_id: int) -> Meeting:
    meeting = get_meeting_or_404(db, meeting_id)
    meeting.status = "ended"
    active_history = db.scalars(
        select(MeetingHistory)
        .where(MeetingHistory.meeting_id == meeting.id, MeetingHistory.ended_at.is_(None))
        .order_by(MeetingHistory.started_at.desc())
    ).first()
    ended_at = now_utc()
    if active_history:
        active_history.ended_at = ended_at
        active_history.participant_count = len(meeting.participants)
        if active_history.started_at:
            active_history.total_duration = int((ended_at - active_history.started_at).total_seconds() // 60)
    for participant in meeting.participants:
        if participant.left_at is None:
            participant.left_at = ended_at
    db.commit()
    db.refresh(meeting)
    return meeting


def join_meeting(db: Session, payload: JoinMeetingRequest) -> Participant:
    meeting = db.scalars(select(Meeting).where(Meeting.meeting_code == payload.meeting_code)).first()
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting code not found.")
    if meeting.status in {"ended", "cancelled"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Meeting is not joinable.")
    if payload.user_id is not None:
        get_user_or_404(db, payload.user_id)

    participant = Participant(
        meeting_id=meeting.id,
        user_id=payload.user_id,
        display_name=payload.display_name,
        role=payload.role,
        mic_enabled=payload.mic_enabled,
        video_enabled=payload.video_enabled,
    )
    db.add(participant)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already joined this meeting.") from exc
    db.refresh(participant)
    return participant


def list_participants(db: Session, meeting_id: int) -> list[Participant]:
    get_meeting_or_404(db, meeting_id)
    return list(db.scalars(select(Participant).where(Participant.meeting_id == meeting_id).order_by(Participant.joined_at)))


def update_participant(db: Session, participant_id: int, payload: ParticipantUpdate) -> Participant:
    participant = db.get(Participant, participant_id)
    if participant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(participant, field, value)
    db.commit()
    db.refresh(participant)
    return participant


def leave_meeting(db: Session, participant_id: int) -> Participant:
    participant = db.get(Participant, participant_id)
    if participant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")
    participant.left_at = now_utc()
    db.commit()
    db.refresh(participant)
    return participant
