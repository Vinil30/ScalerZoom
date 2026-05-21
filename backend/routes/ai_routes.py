from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.schemas import (
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
def create_transcript(payload: TranscriptCreate, db: Session = Depends(get_db)) -> TranscriptRead:
    return transcript_service.create_transcript(db, payload)


@router.get("/meetings/{meeting_id}/transcripts", response_model=list[TranscriptRead])
def list_transcripts(meeting_id: int, db: Session = Depends(get_db)) -> list[TranscriptRead]:
    return transcript_service.list_transcripts(db, meeting_id)


@router.post("/summaries/generate", response_model=SummaryRead, status_code=status.HTTP_201_CREATED)
def generate_summary(payload: SummaryGenerationRequest, db: Session = Depends(get_db)) -> SummaryRead:
    return transcript_service.generate_summary(db, payload.meeting_id, payload.provider)


@router.post("/action-items", response_model=ActionItemRead, status_code=status.HTTP_201_CREATED)
def create_action_item(payload: ActionItemCreate, db: Session = Depends(get_db)) -> ActionItemRead:
    return transcript_service.create_action_item(db, payload)
