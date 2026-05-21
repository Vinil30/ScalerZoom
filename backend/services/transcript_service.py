from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database.models import AIActionItem, AIMeetingSummary, AITranscript
from backend.database.schemas import ActionItemCreate, TranscriptCreate
from backend.services.groq_service import GroqService
from backend.services.meeting_service import get_meeting_or_404
from backend.services.openai_service import OpenAIService
from backend.utils.transcript_utils import extract_candidate_keywords, normalize_transcript_text


def create_transcript(db: Session, payload: TranscriptCreate) -> AITranscript:
    get_meeting_or_404(db, payload.meeting_id)
    transcript = AITranscript(
        meeting_id=payload.meeting_id,
        transcript_text=normalize_transcript_text(payload.transcript_text),
        language=payload.language,
        source_model=payload.source_model,
    )
    db.add(transcript)
    db.commit()
    db.refresh(transcript)
    return transcript


def list_transcripts(db: Session, meeting_id: int) -> list[AITranscript]:
    get_meeting_or_404(db, meeting_id)
    return list(
        db.scalars(
            select(AITranscript)
            .where(AITranscript.meeting_id == meeting_id)
            .order_by(AITranscript.created_at.desc())
        )
    )


def create_action_item(db: Session, payload: ActionItemCreate) -> AIActionItem:
    get_meeting_or_404(db, payload.meeting_id)
    item = AIActionItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def generate_summary(db: Session, meeting_id: int, provider: str = "mock") -> AIMeetingSummary:
    get_meeting_or_404(db, meeting_id)
    transcript = db.scalars(
        select(AITranscript)
        .where(AITranscript.meeting_id == meeting_id)
        .order_by(AITranscript.created_at.desc())
    ).first()
    if transcript is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No transcript exists for this meeting yet.",
        )

    if provider == "openai":
        generated_text = OpenAIService().generate_meeting_summary(transcript.transcript_text)
        model_name = "openai"
    elif provider == "groq":
        generated_text = GroqService().generate_meeting_summary(transcript.transcript_text)
        model_name = "groq-openai-compatible"
    else:
        keywords = ", ".join(extract_candidate_keywords(transcript.transcript_text, limit=8))
        generated_text = (
            "Mock AI summary: the meeting covered planning, decisions, blockers, and next steps. "
            f"Detected topic signals: {keywords or 'general collaboration'}."
        )
        model_name = "mock-summary-engine"

    summary = AIMeetingSummary(
        meeting_id=meeting_id,
        generated_summary=generated_text,
        generated_by_model=model_name,
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary
