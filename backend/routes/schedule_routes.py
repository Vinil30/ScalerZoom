from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.schemas import MeetingRead, MeetingScheduleCreate, MeetingUpdate, MeetingWithLink
from backend.services import meeting_service


router = APIRouter(prefix="/schedule", tags=["Scheduling"])


@router.post("", response_model=MeetingWithLink, status_code=status.HTTP_201_CREATED)
def schedule_meeting(payload: MeetingScheduleCreate, db: Session = Depends(get_db)) -> MeetingWithLink:
    meeting, link = meeting_service.schedule_meeting(db, payload)
    return MeetingWithLink.model_validate(meeting).model_copy(update={"invite_link": link.invite_link})


@router.get("/upcoming", response_model=list[MeetingRead])
def upcoming_meetings(
    limit: int = Query(default=25, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[MeetingRead]:
    return meeting_service.list_meetings(db, status_filter="scheduled", limit=limit)


@router.post("/{meeting_id}/cancel", response_model=MeetingRead)
def cancel_meeting(meeting_id: int, db: Session = Depends(get_db)) -> MeetingRead:
    return meeting_service.update_meeting(db, meeting_id, payload=MeetingUpdate(status="cancelled"))
