from datetime import datetime, timezone

from backend.utils.id_generator import generate_meeting_code, generate_uuid


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def build_invite_link(meeting_code: str, public_base_url: str) -> str:
    return f"{public_base_url.rstrip('/')}/join/{meeting_code}"


def new_meeting_identity() -> tuple[str, str]:
    return generate_uuid(), generate_meeting_code()
