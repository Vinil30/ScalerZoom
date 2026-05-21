from typing import Any

from backend.database.database import db_cursor, execute, fetch_all, fetch_one


MEETING_COLUMNS = """
    m.id, m.meeting_uuid, m.meeting_code, m.host_id, m.title, m.description, m.meeting_type,
    m.scheduled_start, m.duration_minutes, m.status, m.created_at, m.updated_at,
    COUNT(p.id) AS participant_count
"""

PARTICIPANT_COLUMNS = """
    id, meeting_id, user_id, display_name, role, joined_at, left_at,
    mic_enabled, video_enabled
"""


def get_user(user_id: int) -> dict[str, Any] | None:
    return fetch_one(
        """
        SELECT id, username, email, avatar_url, created_at, updated_at
        FROM users
        WHERE id = ?
        """,
        (user_id,),
    )


def get_user_by_email(email: str) -> dict[str, Any] | None:
    return fetch_one("SELECT * FROM users WHERE email = ?", (email,))


def create_user(username: str, email: str, avatar_url: str | None = None) -> int:
    return execute(
        """
        INSERT INTO users (username, email, avatar_url)
        VALUES (?, ?, ?)
        """,
        (username, email, avatar_url),
    )


def get_meeting(meeting_id: int) -> dict[str, Any] | None:
    return fetch_one(
        f"""
        SELECT {MEETING_COLUMNS}
        FROM meetings m
        LEFT JOIN participants p ON p.meeting_id = m.id
        WHERE m.id = ?
        GROUP BY m.id
        """,
        (meeting_id,),
    )


def get_meeting_by_code(meeting_code: str) -> dict[str, Any] | None:
    return fetch_one(
        f"""
        SELECT {MEETING_COLUMNS}
        FROM meetings m
        LEFT JOIN participants p ON p.meeting_id = m.id
        WHERE m.meeting_code = ?
        GROUP BY m.id
        """,
        (meeting_code,),
    )


def list_meetings(status_filter: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
    if status_filter:
        return fetch_all(
            f"""
            SELECT {MEETING_COLUMNS}
            FROM meetings m
            LEFT JOIN participants p ON p.meeting_id = m.id
            WHERE m.status = ?
            GROUP BY m.id
            ORDER BY m.created_at DESC
            LIMIT ?
            """,
            (status_filter, limit),
        )
    return fetch_all(
        f"""
        SELECT {MEETING_COLUMNS}
        FROM meetings m
        LEFT JOIN participants p ON p.meeting_id = m.id
        GROUP BY m.id
        ORDER BY m.created_at DESC
        LIMIT ?
        """,
        (limit,),
    )


def list_upcoming_meetings(limit: int = 5) -> list[dict[str, Any]]:
    return fetch_all(
        f"""
        SELECT {MEETING_COLUMNS}
        FROM meetings m
        LEFT JOIN participants p ON p.meeting_id = m.id
        WHERE m.status = 'scheduled'
        GROUP BY m.id
        ORDER BY m.scheduled_start ASC
        LIMIT ?
        """,
        (limit,),
    )


def create_meeting(
    *,
    meeting_uuid: str,
    meeting_code: str,
    host_id: int,
    title: str,
    description: str | None,
    meeting_type: str,
    scheduled_start: str | None,
    duration_minutes: int,
    status: str = "scheduled",
) -> int:
    return execute(
        """
        INSERT INTO meetings (
            meeting_uuid, meeting_code, host_id, title, description,
            meeting_type, scheduled_start, duration_minutes, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            meeting_uuid,
            meeting_code,
            host_id,
            title,
            description,
            meeting_type,
            scheduled_start,
            duration_minutes,
            status,
        ),
    )


def update_meeting(meeting_id: int, updates: dict[str, Any]) -> dict[str, Any] | None:
    allowed_fields = {"title", "description", "scheduled_start", "duration_minutes", "status"}
    clean_updates = {key: value for key, value in updates.items() if key in allowed_fields}
    if not clean_updates:
        return get_meeting(meeting_id)

    assignments = ", ".join(f"{field} = ?" for field in clean_updates)
    params = tuple(clean_updates.values()) + (meeting_id,)
    execute(
        f"""
        UPDATE meetings
        SET {assignments}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        params,
    )
    return get_meeting(meeting_id)


def create_meeting_link(meeting_id: int, invite_link: str, expires_at: str | None) -> int:
    return execute(
        """
        INSERT INTO meeting_links (meeting_id, invite_link, expires_at)
        VALUES (?, ?, ?)
        """,
        (meeting_id, invite_link, expires_at),
    )


def get_latest_meeting_link(meeting_id: int) -> dict[str, Any] | None:
    return fetch_one(
        """
        SELECT id, meeting_id, invite_link, created_at, expires_at
        FROM meeting_links
        WHERE meeting_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        """,
        (meeting_id,),
    )


def get_meeting_link(link_id: int) -> dict[str, Any] | None:
    return fetch_one(
        """
        SELECT id, meeting_id, invite_link, created_at, expires_at
        FROM meeting_links
        WHERE id = ?
        """,
        (link_id,),
    )


def create_participant(
    *,
    meeting_id: int,
    user_id: int | None,
    display_name: str,
    role: str,
    mic_enabled: bool = True,
    video_enabled: bool = True,
    joined_at: str | None = None,
    left_at: str | None = None,
) -> int:
    return execute(
        """
        INSERT INTO participants (
            meeting_id, user_id, display_name, role, mic_enabled, video_enabled, joined_at, left_at
        )
        VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), ?)
        """,
        (meeting_id, user_id, display_name, role, int(mic_enabled), int(video_enabled), joined_at, left_at),
    )


def get_participant(participant_id: int) -> dict[str, Any] | None:
    return fetch_one(f"SELECT {PARTICIPANT_COLUMNS} FROM participants WHERE id = ?", (participant_id,))


def list_participants(meeting_id: int) -> list[dict[str, Any]]:
    return fetch_all(
        f"""
        SELECT {PARTICIPANT_COLUMNS}
        FROM participants
        WHERE meeting_id = ?
        ORDER BY joined_at ASC, id ASC
        """,
        (meeting_id,),
    )


def update_participant(participant_id: int, updates: dict[str, Any]) -> dict[str, Any] | None:
    allowed_fields = {"display_name", "role", "mic_enabled", "video_enabled", "left_at"}
    clean_updates = {key: value for key, value in updates.items() if key in allowed_fields}
    if "mic_enabled" in clean_updates:
        clean_updates["mic_enabled"] = int(clean_updates["mic_enabled"])
    if "video_enabled" in clean_updates:
        clean_updates["video_enabled"] = int(clean_updates["video_enabled"])
    if not clean_updates:
        return get_participant(participant_id)

    assignments = ", ".join(f"{field} = ?" for field in clean_updates)
    execute(
        f"UPDATE participants SET {assignments} WHERE id = ?",
        tuple(clean_updates.values()) + (participant_id,),
    )
    return get_participant(participant_id)


def count_participants(meeting_id: int) -> int:
    row = fetch_one("SELECT COUNT(*) AS total FROM participants WHERE meeting_id = ?", (meeting_id,))
    return int(row["total"]) if row else 0


def create_meeting_history(
    *,
    meeting_id: int,
    participant_count: int,
    started_at: str | None,
    ended_at: str | None = None,
    total_duration: int | None = None,
) -> int:
    return execute(
        """
        INSERT INTO meeting_history (meeting_id, participant_count, started_at, ended_at, total_duration)
        VALUES (?, ?, ?, ?, ?)
        """,
        (meeting_id, participant_count, started_at, ended_at, total_duration),
    )


def get_active_history(meeting_id: int) -> dict[str, Any] | None:
    return fetch_one(
        """
        SELECT id, meeting_id, participant_count, started_at, ended_at, total_duration
        FROM meeting_history
        WHERE meeting_id = ? AND ended_at IS NULL
        ORDER BY started_at DESC, id DESC
        LIMIT 1
        """,
        (meeting_id,),
    )


def close_active_meeting_history(history_id: int, participant_count: int, ended_at: str, total_duration: int | None) -> None:
    execute(
        """
        UPDATE meeting_history
        SET participant_count = ?, ended_at = ?, total_duration = ?
        WHERE id = ?
        """,
        (participant_count, ended_at, total_duration, history_id),
    )


def close_active_participants(meeting_id: int, left_at: str) -> None:
    execute(
        """
        UPDATE participants
        SET left_at = ?
        WHERE meeting_id = ? AND left_at IS NULL
        """,
        (left_at, meeting_id),
    )


def create_transcript(meeting_id: int, transcript_text: str, language: str, source_model: str) -> int:
    return execute(
        """
        INSERT INTO ai_transcripts (meeting_id, transcript_text, language, source_model)
        VALUES (?, ?, ?, ?)
        """,
        (meeting_id, transcript_text, language, source_model),
    )


def list_transcripts(meeting_id: int) -> list[dict[str, Any]]:
    return fetch_all(
        """
        SELECT id, meeting_id, transcript_text, language, source_model, created_at
        FROM ai_transcripts
        WHERE meeting_id = ?
        ORDER BY created_at DESC, id DESC
        """,
        (meeting_id,),
    )


def get_latest_transcript(meeting_id: int) -> dict[str, Any] | None:
    return fetch_one(
        """
        SELECT id, meeting_id, transcript_text, language, source_model, created_at
        FROM ai_transcripts
        WHERE meeting_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        """,
        (meeting_id,),
    )


def create_summary(meeting_id: int, generated_summary: str, generated_by_model: str) -> int:
    return execute(
        """
        INSERT INTO ai_meeting_summaries (meeting_id, generated_summary, generated_by_model)
        VALUES (?, ?, ?)
        """,
        (meeting_id, generated_summary, generated_by_model),
    )


def get_summary(summary_id: int) -> dict[str, Any] | None:
    return fetch_one(
        """
        SELECT id, meeting_id, generated_summary, generated_by_model, created_at
        FROM ai_meeting_summaries
        WHERE id = ?
        """,
        (summary_id,),
    )


def list_summaries(meeting_id: int) -> list[dict[str, Any]]:
    return fetch_all(
        """
        SELECT id, meeting_id, generated_summary, generated_by_model, created_at
        FROM ai_meeting_summaries
        WHERE meeting_id = ?
        ORDER BY created_at DESC, id DESC
        """,
        (meeting_id,),
    )


def get_latest_summary(meeting_id: int) -> dict[str, Any] | None:
    return fetch_one(
        """
        SELECT id, meeting_id, generated_summary, generated_by_model, created_at
        FROM ai_meeting_summaries
        WHERE meeting_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
        """,
        (meeting_id,),
    )


def create_action_item(
    *,
    meeting_id: int,
    action_text: str,
    assigned_to: str | None,
    priority: str,
    status: str,
) -> int:
    return execute(
        """
        INSERT INTO ai_action_items (meeting_id, action_text, assigned_to, priority, status)
        VALUES (?, ?, ?, ?, ?)
        """,
        (meeting_id, action_text, assigned_to, priority, status),
    )


def get_action_item(action_item_id: int) -> dict[str, Any] | None:
    return fetch_one(
        """
        SELECT id, meeting_id, action_text, assigned_to, priority, status, generated_at
        FROM ai_action_items
        WHERE id = ?
        """,
        (action_item_id,),
    )


def list_action_items(meeting_id: int) -> list[dict[str, Any]]:
    return fetch_all(
        """
        SELECT id, meeting_id, action_text, assigned_to, priority, status, generated_at
        FROM ai_action_items
        WHERE meeting_id = ?
        ORDER BY
            CASE priority
                WHEN 'urgent' THEN 1
                WHEN 'high' THEN 2
                WHEN 'medium' THEN 3
                ELSE 4
            END,
            generated_at DESC,
            id DESC
        """,
        (meeting_id,),
    )


def dashboard_counts() -> dict[str, int]:
    with db_cursor() as cursor:
        return {
            "total_meetings": int(cursor.execute("SELECT COUNT(*) AS total FROM meetings").fetchone()["total"]),
            "live_meetings": int(cursor.execute("SELECT COUNT(*) AS total FROM meetings WHERE status = 'live'").fetchone()["total"]),
            "upcoming_meetings": int(cursor.execute("SELECT COUNT(*) AS total FROM meetings WHERE status = 'scheduled'").fetchone()["total"]),
            "completed_meetings": int(cursor.execute("SELECT COUNT(*) AS total FROM meetings WHERE status = 'ended'").fetchone()["total"]),
            "total_participants": int(cursor.execute("SELECT COUNT(*) AS total FROM participants").fetchone()["total"]),
            "total_transcripts": int(cursor.execute("SELECT COUNT(*) AS total FROM ai_transcripts").fetchone()["total"]),
            "total_ai_summaries": int(cursor.execute("SELECT COUNT(*) AS total FROM ai_meeting_summaries").fetchone()["total"]),
        }
