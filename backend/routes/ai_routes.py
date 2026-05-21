from fastapi import APIRouter, status

from backend.schemas import (
    ActionItemCreate,
    ActionItemRead,
    SummaryGenerationRequest,
    SummaryRead,
    TranscriptCreate,
    TranscriptRead,
)
from backend.services import transcript_service


router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/transcripts", response_model=TranscriptRead, status_code=status.HTTP_201_CREATED)
def create_transcript(payload: TranscriptCreate) -> TranscriptRead:
    return transcript_service.create_transcript(payload)


@router.get("/meetings/{meeting_id}/transcripts", response_model=list[TranscriptRead])
def list_transcripts(meeting_id: int) -> list[TranscriptRead]:
    return transcript_service.list_transcripts(meeting_id)


@router.post("/summaries/generate", response_model=SummaryRead, status_code=status.HTTP_201_CREATED)
def generate_summary(payload: SummaryGenerationRequest) -> SummaryRead:
    return transcript_service.generate_summary(payload.meeting_id, payload.provider)


@router.post("/action-items", response_model=ActionItemRead, status_code=status.HTTP_201_CREATED)
def create_action_item(payload: ActionItemCreate) -> ActionItemRead:
    return transcript_service.create_action_item(payload)
