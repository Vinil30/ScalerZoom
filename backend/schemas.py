from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


MeetingType = Literal["instant", "scheduled", "recurring", "webinar"]
MeetingStatus = Literal["scheduled", "live", "ended", "cancelled"]
ParticipantRole = Literal["host", "cohost", "participant", "guest"]
ActionPriority = Literal["low", "medium", "high", "urgent"]
ActionStatus = Literal["open", "in_progress", "completed", "dismissed"]


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: EmailStr
    avatar_url: str | None = None


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime


class MeetingCreate(BaseModel):
    host_id: int
    title: str = Field(min_length=3, max_length=180)
    description: str | None = None
    meeting_type: MeetingType = "scheduled"
    scheduled_start: datetime | None = None
    duration_minutes: int = Field(default=30, gt=0, le=1440)


class MeetingScheduleCreate(MeetingCreate):
    meeting_type: MeetingType = "scheduled"
    scheduled_start: datetime


class MeetingUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    description: str | None = None
    scheduled_start: datetime | None = None
    duration_minutes: int | None = Field(default=None, gt=0, le=1440)
    status: MeetingStatus | None = None


class MeetingRead(BaseModel):
    id: int
    meeting_uuid: str
    meeting_code: str
    host_id: int
    title: str
    description: str | None
    meeting_type: MeetingType
    scheduled_start: datetime | None
    duration_minutes: int
    status: MeetingStatus
    created_at: datetime
    updated_at: datetime
    participant_count: int = 0


class MeetingLinkRead(BaseModel):
    id: int
    meeting_id: int
    invite_link: str
    created_at: datetime
    expires_at: datetime | None


class MeetingWithLink(MeetingRead):
    invite_link: str


class JoinMeetingRequest(BaseModel):
    meeting_code: str
    display_name: str = Field(min_length=1, max_length=120)
    user_id: int | None = None
    role: ParticipantRole = "participant"
    mic_enabled: bool = True
    video_enabled: bool = True


class ParticipantUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=120)
    role: ParticipantRole | None = None
    mic_enabled: bool | None = None
    video_enabled: bool | None = None
    left_at: datetime | None = None


class ParticipantRead(BaseModel):
    id: int
    meeting_id: int
    user_id: int | None
    display_name: str
    role: ParticipantRole
    joined_at: datetime
    left_at: datetime | None
    mic_enabled: bool
    video_enabled: bool


class MeetingHistoryRead(BaseModel):
    id: int
    meeting_id: int
    participant_count: int
    started_at: datetime | None
    ended_at: datetime | None
    total_duration: int | None


class TranscriptCreate(BaseModel):
    meeting_id: int
    transcript_text: str = Field(min_length=1)
    language: str = Field(default="en", min_length=2, max_length=20)
    source_model: str = Field(default="manual-upload", max_length=100)


class TranscriptRead(BaseModel):
    id: int
    meeting_id: int
    transcript_text: str
    language: str
    source_model: str
    created_at: datetime


class ActionItemGenerationRequest(BaseModel):
    meeting_id: int
    provider: Literal["groq", "mock"] = "mock"


class TranscriptProcessRequest(BaseModel):
    meeting_id: int
    transcript_text: str = Field(min_length=1)
    language: str = Field(default="en", min_length=2, max_length=20)
    source_model: str = Field(default="manual-upload", max_length=100)
    provider: Literal["groq", "mock"] = "mock"


class ActionItemCreate(BaseModel):
    meeting_id: int
    action_text: str = Field(min_length=1)
    assigned_to: str | None = Field(default=None, max_length=120)
    priority: ActionPriority = "medium"
    status: ActionStatus = "open"


class ActionItemRead(BaseModel):
    id: int
    meeting_id: int
    action_text: str
    assigned_to: str | None
    priority: ActionPriority
    status: ActionStatus
    generated_at: datetime


class TranscriptProcessResponse(BaseModel):
    transcript: TranscriptRead
    action_items: list[ActionItemRead]


class DashboardOverview(BaseModel):
    total_meetings: int
    live_meetings: int
    upcoming_meetings: int
    completed_meetings: int
    total_participants: int
    total_transcripts: int
    total_ai_summaries: int
    recent_meetings: list[MeetingRead]
    upcoming_schedule: list[MeetingRead]


class APIHealth(BaseModel):
    status: str
    service: str
    database: str
