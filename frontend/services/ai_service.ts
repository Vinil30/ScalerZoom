import { apiGet, apiPost } from "@/services/api";
import type { ActionItem, Transcript, TranscriptProcessInput, TranscriptProcessResponse } from "@/types/api";

export const aiService = {
  listTranscripts(meetingId: number) {
    return apiGet<Transcript[]>(`/ai/meetings/${meetingId}/transcripts`);
  },
  listActionItems(meetingId: number) {
    return apiGet<ActionItem[]>(`/ai/meetings/${meetingId}/action-items`);
  },
  processTranscript(input: TranscriptProcessInput) {
    return apiPost<TranscriptProcessResponse, TranscriptProcessInput>("/ai/transcripts/process", input);
  },
  generateActionItems(meetingId: number, provider: "mock" | "groq" = "mock") {
    return apiPost<ActionItem[], { meeting_id: number; provider: "mock" | "groq" }>("/ai/action-items/generate", {
      meeting_id: meetingId,
      provider,
    });
  },
  createActionItem(input: {
    meeting_id: number;
    action_text: string;
    assigned_to?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    status?: "open" | "in_progress" | "completed" | "dismissed";
  }) {
    return apiPost<ActionItem, typeof input>("/ai/action-items", input);
  },
};
