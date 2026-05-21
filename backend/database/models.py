from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), nullable=False, unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    hosted_meetings: Mapped[list["Meeting"]] = relationship(back_populates="host")
    participations: Mapped[list["Participant"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Meeting(TimestampMixin, Base):
    __tablename__ = "meetings"
    __table_args__ = (
        CheckConstraint(
            "meeting_type IN ('instant', 'scheduled', 'recurring', 'webinar')",
            name="ck_meetings_meeting_type",
        ),
        CheckConstraint(
            "status IN ('scheduled', 'live', 'ended', 'cancelled')",
            name="ck_meetings_status",
        ),
        CheckConstraint("duration_minutes > 0", name="ck_meetings_duration_positive"),
        Index("ix_meetings_host_status", "host_id", "status"),
        Index("ix_meetings_scheduled_start", "scheduled_start"),
        Index("ix_meetings_code_status", "meeting_code", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meeting_uuid: Mapped[str] = mapped_column(String(36), nullable=False, unique=True, index=True)
    meeting_code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True, index=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    meeting_type: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled")
    scheduled_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="scheduled", index=True)

    host: Mapped[User] = relationship(back_populates="hosted_meetings")
    participants: Mapped[list["Participant"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    links: Mapped[list["MeetingLink"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    history_records: Mapped[list["MeetingHistory"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    summaries: Mapped[list["AIMeetingSummary"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    action_items: Mapped[list["AIActionItem"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    transcripts: Mapped[list["AITranscript"]] = relationship(
        back_populates="meeting",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Participant(Base):
    __tablename__ = "participants"
    __table_args__ = (
        CheckConstraint("role IN ('host', 'cohost', 'participant', 'guest')", name="ck_participants_role"),
        UniqueConstraint("meeting_id", "user_id", name="uq_participants_meeting_user"),
        Index("ix_participants_meeting_role", "meeting_id", "role"),
        Index("ix_participants_joined_at", "joined_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="participant")
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    left_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    mic_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    video_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    meeting: Mapped[Meeting] = relationship(back_populates="participants")
    user: Mapped[User | None] = relationship(back_populates="participations")


class MeetingLink(Base):
    __tablename__ = "meeting_links"
    __table_args__ = (
        Index("ix_meeting_links_meeting_expires", "meeting_id", "expires_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    invite_link: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    meeting: Mapped[Meeting] = relationship(back_populates="links")


class MeetingHistory(Base):
    __tablename__ = "meeting_history"
    __table_args__ = (
        Index("ix_meeting_history_started_at", "started_at"),
        Index("ix_meeting_history_meeting_started", "meeting_id", "started_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    participant_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)

    meeting: Mapped[Meeting] = relationship(back_populates="history_records")


class AIMeetingSummary(Base):
    __tablename__ = "ai_meeting_summaries"
    __table_args__ = (
        Index("ix_ai_summaries_meeting_created", "meeting_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    generated_summary: Mapped[str] = mapped_column(Text, nullable=False)
    generated_by_model: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    meeting: Mapped[Meeting] = relationship(back_populates="summaries")


class AIActionItem(Base):
    __tablename__ = "ai_action_items"
    __table_args__ = (
        CheckConstraint("priority IN ('low', 'medium', 'high', 'urgent')", name="ck_ai_action_items_priority"),
        CheckConstraint("status IN ('open', 'in_progress', 'completed', 'dismissed')", name="ck_ai_action_items_status"),
        Index("ix_ai_action_items_meeting_status", "meeting_id", "status"),
        Index("ix_ai_action_items_priority", "priority"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    action_text: Mapped[str] = mapped_column(Text, nullable=False)
    assigned_to: Mapped[str | None] = mapped_column(String(120), nullable=True)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    meeting: Mapped[Meeting] = relationship(back_populates="action_items")


class AITranscript(Base):
    __tablename__ = "ai_transcripts"
    __table_args__ = (
        Index("ix_ai_transcripts_meeting_created", "meeting_id", "created_at"),
        Index("ix_ai_transcripts_language", "language"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    transcript_text: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(20), nullable=False, default="en")
    source_model: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    meeting: Mapped[Meeting] = relationship(back_populates="transcripts")
