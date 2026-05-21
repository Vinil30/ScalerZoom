from fastapi import APIRouter, Query, status

from backend.schemas import MeetingRead, MeetingScheduleCreate, MeetingUpdate, MeetingWithLink
from backend.services import meeting_service


router = APIRouter(prefix="/schedule", tags=["Scheduling"])


@router.post("", response_model=MeetingWithLink, status_code=status.HTTP_201_CREATED)
def schedule_meeting(payload: MeetingScheduleCreate) -> MeetingWithLink:
    meeting, link = meeting_service.schedule_meeting(payload)
    return MeetingWithLink(**meeting, invite_link=link["invite_link"])


@router.get("/upcoming", response_model=list[MeetingRead])
def upcoming_meetings(
    limit: int = Query(default=25, ge=1, le=100),
) -> list[MeetingRead]:
    return meeting_service.list_meetings(status_filter="scheduled", limit=limit)


@router.post("/{meeting_id}/cancel", response_model=MeetingRead)
def cancel_meeting(meeting_id: int) -> MeetingRead:
    return meeting_service.update_meeting(meeting_id, payload=MeetingUpdate(status="cancelled"))
