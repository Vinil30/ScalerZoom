export type MeetingStatus = "scheduled" | "live" | "ended" | "cancelled";
export type MeetingType = "instant" | "scheduled" | "recurring" | "webinar";
export type ParticipantRole = "host" | "cohost" | "participant" | "guest";
export type ActionPriority = "low" | "medium" | "high" | "urgent";
export type ActionStatus = "open" | "in_progress" | "completed" | "dismissed";

export interface Meeting {
  id: number;
  meeting_uuid: string;
  meeting_code: string;
  host_id: number;
  title: string;
  description: string | null;
  meeting_type: MeetingType;
  scheduled_start: string | null;
  duration_minutes: number;
  status: MeetingStatus;
  created_at: string;
  updated_at: string;
  participant_count: number;
}

export interface MeetingWithLink extends Meeting {
  invite_link: string;
}

export interface Participant {
  id: number;
  meeting_id: number;
  user_id: number | null;
  display_name: string;
  role: ParticipantRole;
  joined_at: string;
  left_at: string | null;
  mic_enabled: boolean;
  video_enabled: boolean;
}

export interface DashboardOverview {
  total_meetings: number;
  live_meetings: number;
  upcoming_meetings: number;
  completed_meetings: number;
  total_participants: number;
  total_transcripts: number;
  total_ai_summaries: number;
  recent_meetings: Meeting[];
  upcoming_schedule: Meeting[];
}

export interface Transcript {
  id: number;
  meeting_id: number;
  transcript_text: string;
  language: string;
  source_model: string;
  created_at: string;
}

export interface Summary {
  id: number;
  meeting_id: number;
  generated_summary: string;
  generated_by_model: string;
  created_at: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  action_text: string;
  assigned_to: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  generated_at: string;
}

export interface CreateMeetingInput {
  host_id: number;
  title: string;
  description?: string;
  meeting_type?: MeetingType;
  scheduled_start?: string;
  duration_minutes: number;
}

export interface JoinMeetingInput {
  meeting_code: string;
  display_name: string;
  user_id?: number;
  role?: ParticipantRole;
  mic_enabled?: boolean;
  video_enabled?: boolean;
}

export interface TranscriptProcessInput {
  meeting_id: number;
  transcript_text: string;
  language?: string;
  source_model?: string;
  provider?: "mock" | "openai" | "groq";
}

export interface TranscriptProcessResponse {
  transcript: Transcript;
  summary: Summary;
  action_items: ActionItem[];
}
