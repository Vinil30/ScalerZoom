from fastapi import HTTPException, status

from backend.database import queries
from backend.schemas import ActionItemCreate, TranscriptCreate
from backend.services.groq_service import GroqService
from backend.services.meeting_service import get_meeting_or_404
from backend.services.openai_service import OpenAIService
from backend.utils.transcript_utils import extract_candidate_keywords, normalize_transcript_text


def create_transcript(payload: TranscriptCreate) -> dict:
    get_meeting_or_404(payload.meeting_id)
    transcript_id = queries.create_transcript(
        payload.meeting_id,
        normalize_transcript_text(payload.transcript_text),
        payload.language,
        payload.source_model,
    )
    transcripts = queries.list_transcripts(payload.meeting_id)
    return next(item for item in transcripts if item["id"] == transcript_id)


def list_transcripts(meeting_id: int) -> list[dict]:
    get_meeting_or_404(meeting_id)
    return queries.list_transcripts(meeting_id)


def create_action_item(payload: ActionItemCreate) -> dict:
    get_meeting_or_404(payload.meeting_id)
    action_item_id = queries.create_action_item(**payload.model_dump())
    item = queries.get_action_item(action_item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Action item creation failed.")
    return item


def generate_summary(meeting_id: int, provider: str = "mock") -> dict:
    get_meeting_or_404(meeting_id)
    transcript = queries.get_latest_transcript(meeting_id)
    if transcript is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No transcript exists for this meeting yet.",
        )

    if provider == "openai":
        generated_text = OpenAIService().generate_meeting_summary(transcript["transcript_text"])
        model_name = "openai"
    elif provider == "groq":
        generated_text = GroqService().generate_meeting_summary(transcript["transcript_text"])
        model_name = "groq-openai-compatible"
    else:
        keywords = ", ".join(extract_candidate_keywords(transcript["transcript_text"], limit=8))
        generated_text = (
            "Mock AI summary: the meeting covered planning, decisions, blockers, and next steps. "
            f"Detected topic signals: {keywords or 'general collaboration'}."
        )
        model_name = "mock-summary-engine"

    summary_id = queries.create_summary(meeting_id, generated_text, model_name)
    summary = queries.get_summary(summary_id)
    if summary is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Summary creation failed.")
    return summary
