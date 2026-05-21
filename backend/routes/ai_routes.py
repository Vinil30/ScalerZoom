from fastapi import APIRouter, status

from backend.schemas import (
    ActionItemGenerationRequest,
    ActionItemCreate,
    ActionItemRead,
    TranscriptCreate,
    TranscriptProcessRequest,
    TranscriptProcessResponse,
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


@router.post("/transcripts/process", response_model=TranscriptProcessResponse, status_code=status.HTTP_201_CREATED)
def process_transcript(payload: TranscriptProcessRequest) -> TranscriptProcessResponse:
    return transcript_service.process_transcript(payload)


@router.get("/meetings/{meeting_id}/action-items", response_model=list[ActionItemRead])
def list_action_items(meeting_id: int) -> list[ActionItemRead]:
    return transcript_service.list_action_items(meeting_id)


@router.post("/action-items/generate", response_model=list[ActionItemRead], status_code=status.HTTP_201_CREATED)
def generate_action_items(payload: ActionItemGenerationRequest) -> list[ActionItemRead]:
    return transcript_service.generate_action_items(payload.meeting_id, payload.provider)


@router.post("/action-items", response_model=ActionItemRead, status_code=status.HTTP_201_CREATED)
def create_action_item(payload: ActionItemCreate) -> ActionItemRead:
    return transcript_service.create_action_item(payload)
