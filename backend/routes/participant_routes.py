from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.schemas import ParticipantRead, ParticipantUpdate
from backend.services import meeting_service


router = APIRouter(prefix="/participants", tags=["Participants"])


@router.get("/meeting/{meeting_id}", response_model=list[ParticipantRead])
def list_participants(meeting_id: int, db: Session = Depends(get_db)) -> list[ParticipantRead]:
    return meeting_service.list_participants(db, meeting_id)


@router.patch("/{participant_id}", response_model=ParticipantRead)
def update_participant(
    participant_id: int,
    payload: ParticipantUpdate,
    db: Session = Depends(get_db),
) -> ParticipantRead:
    return meeting_service.update_participant(db, participant_id, payload)


@router.post("/{participant_id}/leave", response_model=ParticipantRead)
def leave_meeting(participant_id: int, db: Session = Depends(get_db)) -> ParticipantRead:
    return meeting_service.leave_meeting(db, participant_id)
