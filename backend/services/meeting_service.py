from datetime import datetime, timedelta
import os
import sqlite3
from typing import Any

from dotenv import load_dotenv
from fastapi import HTTPException, status

from backend.database import queries
from backend.schemas import JoinMeetingRequest, MeetingCreate, MeetingScheduleCreate, MeetingUpdate, ParticipantUpdate
from backend.utils.meeting_utils import build_invite_link, new_meeting_identity, now_utc
from backend.utils.validation_utils import ensure_future_datetime


load_dotenv()

PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8000")


def serialize_datetime(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def get_meeting_or_404(meeting_id: int) -> dict[str, Any]:
    meeting = queries.get_meeting(meeting_id)
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")
    return meeting


def get_user_or_404(user_id: int) -> dict[str, Any]:
    user = queries.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


def create_meeting(payload: MeetingCreate) -> tuple[dict[str, Any], dict[str, Any]]:
    get_user_or_404(payload.host_id)
    if payload.meeting_type == "scheduled" and payload.scheduled_start is not None:
        ensure_future_datetime(payload.scheduled_start, "scheduled_start")

    meeting_uuid, meeting_code = new_meeting_identity()
    scheduled_start = serialize_datetime(payload.scheduled_start)
    meeting_id = queries.create_meeting(
        meeting_uuid=meeting_uuid,
        meeting_code=meeting_code,
        host_id=payload.host_id,
        title=payload.title,
        description=payload.description,
        meeting_type=payload.meeting_type,
        scheduled_start=scheduled_start,
        duration_minutes=payload.duration_minutes,
    )

    expires_at = None
    if payload.scheduled_start:
        expires_at = (payload.scheduled_start + timedelta(days=1)).isoformat()

    link_id = queries.create_meeting_link(
        meeting_id,
        build_invite_link(meeting_code, PUBLIC_BASE_URL),
        expires_at,
    )

    meeting = queries.get_meeting(meeting_id)
    link = queries.get_meeting_link(link_id)
    if meeting is None or link is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Meeting creation failed.")
    return meeting, link


def schedule_meeting(payload: MeetingScheduleCreate) -> tuple[dict[str, Any], dict[str, Any]]:
    ensure_future_datetime(payload.scheduled_start, "scheduled_start")
    return create_meeting(payload)


def list_meetings(status_filter: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
    return queries.list_meetings(status_filter=status_filter, limit=limit)


def update_meeting(meeting_id: int, payload: MeetingUpdate) -> dict[str, Any]:
    get_meeting_or_404(meeting_id)
    update_data = payload.model_dump(exclude_unset=True)
    if "scheduled_start" in update_data and update_data["scheduled_start"] is not None:
        ensure_future_datetime(update_data["scheduled_start"], "scheduled_start")
        update_data["scheduled_start"] = update_data["scheduled_start"].isoformat()

    meeting = queries.update_meeting(meeting_id, update_data)
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found.")
    return meeting


def start_meeting(meeting_id: int) -> dict[str, Any]:
    meeting = get_meeting_or_404(meeting_id)
    if meeting["status"] == "live":
        return meeting

    queries.update_meeting(meeting_id, {"status": "live"})
    queries.create_meeting_history(
        meeting_id=meeting_id,
        participant_count=queries.count_participants(meeting_id),
        started_at=now_utc().isoformat(),
    )
    return get_meeting_or_404(meeting_id)


def end_meeting(meeting_id: int) -> dict[str, Any]:
    get_meeting_or_404(meeting_id)
    ended_at = now_utc()
    active_history = queries.get_active_history(meeting_id)
    participant_count = queries.count_participants(meeting_id)

    if active_history:
        total_duration = None
        if active_history["started_at"]:
            started_at = datetime.fromisoformat(active_history["started_at"])
            if started_at.tzinfo is None:
                started_at = started_at.replace(tzinfo=ended_at.tzinfo)
            total_duration = int((ended_at - started_at).total_seconds() // 60)
        queries.close_active_meeting_history(
            active_history["id"],
            participant_count,
            ended_at.isoformat(),
            total_duration,
        )

    queries.close_active_participants(meeting_id, ended_at.isoformat())
    queries.update_meeting(meeting_id, {"status": "ended"})
    return get_meeting_or_404(meeting_id)


def join_meeting(payload: JoinMeetingRequest) -> dict[str, Any]:
    meeting = queries.get_meeting_by_code(payload.meeting_code)
    if meeting is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting code not found.")
    if meeting["status"] in {"ended", "cancelled"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Meeting is not joinable.")
    if payload.user_id is not None:
        get_user_or_404(payload.user_id)

    try:
        participant_id = queries.create_participant(
            meeting_id=meeting["id"],
            user_id=payload.user_id,
            display_name=payload.display_name,
            role=payload.role,
            mic_enabled=payload.mic_enabled,
            video_enabled=payload.video_enabled,
        )
    except sqlite3.IntegrityError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already joined this meeting.") from exc

    participant = queries.get_participant(participant_id)
    if participant is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Participant creation failed.")
    return participant


def list_participants(meeting_id: int) -> list[dict[str, Any]]:
    get_meeting_or_404(meeting_id)
    return queries.list_participants(meeting_id)


def update_participant(participant_id: int, payload: ParticipantUpdate) -> dict[str, Any]:
    participant = queries.get_participant(participant_id)
    if participant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")

    updates = payload.model_dump(exclude_unset=True)
    if "left_at" in updates and updates["left_at"] is not None:
        updates["left_at"] = updates["left_at"].isoformat()
    updated = queries.update_participant(participant_id, updates)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")
    return updated


def leave_meeting(participant_id: int) -> dict[str, Any]:
    participant = queries.get_participant(participant_id)
    if participant is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")
    updated = queries.update_participant(participant_id, {"left_at": now_utc().isoformat()})
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Participant not found.")
    return updated
