from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.schemas import JoinMeetingRequest, MeetingCreate, MeetingRead, MeetingUpdate, MeetingWithLink, ParticipantRead
from backend.services import meeting_service


router = APIRouter(prefix="/meetings", tags=["Meetings"])


@router.post("", response_model=MeetingWithLink, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: MeetingCreate, db: Session = Depends(get_db)) -> MeetingWithLink:
    meeting, link = meeting_service.create_meeting(db, payload)
    return MeetingWithLink.model_validate(meeting).model_copy(update={"invite_link": link.invite_link})


@router.get("", response_model=list[MeetingRead])
def list_meetings(
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[MeetingRead]:
    return meeting_service.list_meetings(db, status_filter=status_filter, limit=limit)


@router.post("/join", response_model=ParticipantRead, status_code=status.HTTP_201_CREATED)
def join_meeting(payload: JoinMeetingRequest, db: Session = Depends(get_db)) -> ParticipantRead:
    return meeting_service.join_meeting(db, payload)


@router.get("/{meeting_id}", response_model=MeetingRead)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)) -> MeetingRead:
    return meeting_service.get_meeting_or_404(db, meeting_id)


@router.patch("/{meeting_id}", response_model=MeetingRead)
def update_meeting(meeting_id: int, payload: MeetingUpdate, db: Session = Depends(get_db)) -> MeetingRead:
    return meeting_service.update_meeting(db, meeting_id, payload)


@router.post("/{meeting_id}/start", response_model=MeetingRead)
def start_meeting(meeting_id: int, db: Session = Depends(get_db)) -> MeetingRead:
    return meeting_service.start_meeting(db, meeting_id)


@router.post("/{meeting_id}/end", response_model=MeetingRead)
def end_meeting(meeting_id: int, db: Session = Depends(get_db)) -> MeetingRead:
    return meeting_service.end_meeting(db, meeting_id)
