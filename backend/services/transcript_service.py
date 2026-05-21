import json
import re
from typing import Any

from fastapi import HTTPException, status

from backend.database import queries
from backend.schemas import ActionItemCreate, TranscriptCreate, TranscriptProcessRequest
from backend.services.groq_service import GroqService
from backend.services.meeting_service import get_meeting_or_404
from backend.utils.transcript_utils import normalize_transcript_text


def create_transcript(payload: TranscriptCreate) -> dict[str, Any]:
    get_meeting_or_404(payload.meeting_id)
    transcript_id = queries.create_transcript(
        payload.meeting_id,
        normalize_transcript_text(payload.transcript_text),
        payload.language,
        payload.source_model,
    )
    transcripts = queries.list_transcripts(payload.meeting_id)
    return next(item for item in transcripts if item["id"] == transcript_id)


def list_transcripts(meeting_id: int) -> list[dict[str, Any]]:
    get_meeting_or_404(meeting_id)
    return queries.list_transcripts(meeting_id)


def list_action_items(meeting_id: int) -> list[dict[str, Any]]:
    get_meeting_or_404(meeting_id)
    return queries.list_action_items(meeting_id)


def create_action_item(payload: ActionItemCreate) -> dict[str, Any]:
    get_meeting_or_404(payload.meeting_id)
    action_item_id = queries.create_action_item(**payload.model_dump())
    item = queries.get_action_item(action_item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Action item creation failed.")
    return item


def _mock_action_items(transcript_text: str) -> list[dict[str, str | None]]:
    sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+", transcript_text) if part.strip()]
    action_verbs = ("will", "should", "need", "needs", "prepare", "create", "confirm", "review", "follow up", "add")
    candidates = [sentence for sentence in sentences if any(verb in sentence.lower() for verb in action_verbs)]
    if not candidates:
        candidates = sentences[:2] or ["Confirm owners and next steps for the meeting outcomes."]

    items: list[dict[str, str | None]] = []
    for sentence in candidates[:5]:
        assigned_to = None
        owner_match = re.match(r"([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:will|should|needs?|to)\b", sentence)
        if owner_match:
            assigned_to = owner_match.group(1)

        lowered = sentence.lower()
        priority = "medium"
        if any(word in lowered for word in ("urgent", "blocked", "critical", "failed", "incident")):
            priority = "high"
        if any(word in lowered for word in ("alert", "security", "customer")):
            priority = "high"

        items.append(
            {
                "action_text": sentence,
                "assigned_to": assigned_to,
                "priority": priority,
                "status": "open",
            }
        )
    return items


def _parse_action_items(raw_json: str, transcript_text: str) -> list[dict[str, str | None]]:
    try:
        payload = json.loads(raw_json)
        raw_items = payload.get("action_items", [])
        items = []
        for item in raw_items:
            if not isinstance(item, dict) or not item.get("action_text"):
                continue
            priority = item.get("priority", "medium")
            if priority not in {"low", "medium", "high", "urgent"}:
                priority = "medium"
            items.append(
                {
                    "action_text": str(item["action_text"]),
                    "assigned_to": item.get("assigned_to"),
                    "priority": priority,
                    "status": "open",
                }
            )
        return items or _mock_action_items(transcript_text)
    except json.JSONDecodeError:
        return _mock_action_items(transcript_text)


def _provider_action_items(provider: str, transcript_text: str) -> tuple[list[dict[str, str | None]], str]:
    if provider == "groq":
        try:
            return _parse_action_items(GroqService().extract_action_items(transcript_text), transcript_text), "groq-openai-compatible"
        except Exception:
            return _mock_action_items(transcript_text), "local-meeting-intelligence"
    return _mock_action_items(transcript_text), "local-meeting-intelligence"


def generate_action_items(meeting_id: int, provider: str = "mock") -> list[dict[str, Any]]:
    get_meeting_or_404(meeting_id)
    transcript = queries.get_latest_transcript(meeting_id)
    if transcript is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No transcript exists for this meeting yet.",
        )

    action_items, _model_name = _provider_action_items(provider, transcript["transcript_text"])
    created_items = []
    for item in action_items:
        action_item_id = queries.create_action_item(
            meeting_id=meeting_id,
            action_text=str(item["action_text"]),
            assigned_to=item.get("assigned_to"),
            priority=str(item.get("priority") or "medium"),
            status="open",
        )
        created = queries.get_action_item(action_item_id)
        if created:
            created_items.append(created)
    return created_items


def process_transcript(payload: TranscriptProcessRequest) -> dict[str, Any]:
    transcript = create_transcript(
        TranscriptCreate(
            meeting_id=payload.meeting_id,
            transcript_text=payload.transcript_text,
            language=payload.language,
            source_model=payload.source_model,
        )
    )
    action_items = generate_action_items(payload.meeting_id, payload.provider)
    return {
        "transcript": transcript,
        "action_items": action_items,
    }
