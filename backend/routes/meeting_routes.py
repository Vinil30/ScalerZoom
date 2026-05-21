from fastapi import APIRouter, Query, status

from backend.schemas import JoinMeetingRequest, MeetingCreate, MeetingRead, MeetingUpdate, MeetingWithLink, ParticipantRead
from backend.services import meeting_service


router = APIRouter(prefix="/meetings", tags=["Meetings"])


@router.post("", response_model=MeetingWithLink, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: MeetingCreate) -> MeetingWithLink:
    meeting, link = meeting_service.create_meeting(payload)
    return MeetingWithLink(**meeting, invite_link=link["invite_link"])


@router.get("", response_model=list[MeetingRead])
def list_meetings(
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
) -> list[MeetingRead]:
    return meeting_service.list_meetings(status_filter=status_filter, limit=limit)


@router.post("/join", response_model=ParticipantRead, status_code=status.HTTP_201_CREATED)
def join_meeting(payload: JoinMeetingRequest) -> ParticipantRead:
    return meeting_service.join_meeting(payload)


@router.get("/{meeting_id}", response_model=MeetingRead)
def get_meeting(meeting_id: int) -> MeetingRead:
    return meeting_service.get_meeting_or_404(meeting_id)


@router.patch("/{meeting_id}", response_model=MeetingRead)
def update_meeting(meeting_id: int, payload: MeetingUpdate) -> MeetingRead:
    return meeting_service.update_meeting(meeting_id, payload)


@router.post("/{meeting_id}/start", response_model=MeetingRead)
def start_meeting(meeting_id: int) -> MeetingRead:
    return meeting_service.start_meeting(meeting_id)


@router.post("/{meeting_id}/end", response_model=MeetingRead)
def end_meeting(meeting_id: int) -> MeetingRead:
    return meeting_service.end_meeting(meeting_id)
