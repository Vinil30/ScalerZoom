from fastapi import APIRouter

from backend.schemas import ParticipantRead, ParticipantUpdate
from backend.services import meeting_service


router = APIRouter(prefix="/participants", tags=["Participants"])


@router.get("/meeting/{meeting_id}", response_model=list[ParticipantRead])
def list_participants(meeting_id: int) -> list[ParticipantRead]:
    return meeting_service.list_participants(meeting_id)


@router.patch("/{participant_id}", response_model=ParticipantRead)
def update_participant(
    participant_id: int,
    payload: ParticipantUpdate,
) -> ParticipantRead:
    return meeting_service.update_participant(participant_id, payload)


@router.post("/{participant_id}/leave", response_model=ParticipantRead)
def leave_meeting(participant_id: int) -> ParticipantRead:
    return meeting_service.leave_meeting(participant_id)
