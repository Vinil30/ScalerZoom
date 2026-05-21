PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_uuid TEXT NOT NULL UNIQUE,
    meeting_code TEXT NOT NULL UNIQUE,
    host_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    meeting_type TEXT NOT NULL DEFAULT 'scheduled',
    scheduled_start TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE RESTRICT,
    CHECK (meeting_type IN ('instant', 'scheduled', 'recurring', 'webinar')),
    CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
    CHECK (duration_minutes > 0)
);

CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    user_id INTEGER,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'participant',
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TEXT,
    mic_enabled INTEGER NOT NULL DEFAULT 1,
    video_enabled INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (meeting_id, user_id),
    CHECK (role IN ('host', 'cohost', 'participant', 'guest')),
    CHECK (mic_enabled IN (0, 1)),
    CHECK (video_enabled IN (0, 1))
);

CREATE TABLE IF NOT EXISTS meeting_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    invite_link TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS meeting_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    participant_count INTEGER NOT NULL DEFAULT 0,
    started_at TEXT,
    ended_at TEXT,
    total_duration INTEGER,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    CHECK (participant_count >= 0)
);

CREATE TABLE IF NOT EXISTS ai_meeting_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    generated_summary TEXT NOT NULL,
    generated_by_model TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_action_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    action_text TEXT NOT NULL,
    assigned_to TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'open',
    generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CHECK (status IN ('open', 'in_progress', 'completed', 'dismissed'))
);

CREATE TABLE IF NOT EXISTS ai_transcripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id INTEGER NOT NULL,
    transcript_text TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    source_model TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE INDEX IF NOT EXISTS idx_meetings_uuid ON meetings(meeting_uuid);
CREATE INDEX IF NOT EXISTS idx_meetings_code ON meetings(meeting_code);
CREATE INDEX IF NOT EXISTS idx_meetings_host_status ON meetings(host_id, status);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_start ON meetings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_meetings_code_status ON meetings(meeting_code, status);

CREATE INDEX IF NOT EXISTS idx_participants_meeting ON participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_meeting_role ON participants(meeting_id, role);
CREATE INDEX IF NOT EXISTS idx_participants_joined_at ON participants(joined_at);

CREATE INDEX IF NOT EXISTS idx_meeting_links_meeting_expires ON meeting_links(meeting_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_meeting_history_started_at ON meeting_history(started_at);
CREATE INDEX IF NOT EXISTS idx_meeting_history_meeting_started ON meeting_history(meeting_id, started_at);

CREATE INDEX IF NOT EXISTS idx_ai_summaries_meeting_created ON ai_meeting_summaries(meeting_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_action_items_meeting_status ON ai_action_items(meeting_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_action_items_priority ON ai_action_items(priority);
CREATE INDEX IF NOT EXISTS idx_ai_transcripts_meeting_created ON ai_transcripts(meeting_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_transcripts_language ON ai_transcripts(language);
