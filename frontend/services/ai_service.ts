import { apiGet, apiPost } from "@/services/api";
import type { ActionItem, Summary, Transcript } from "@/types/api";

export const aiService = {
  listTranscripts(meetingId: number) {
    return apiGet<Transcript[]>(`/ai/meetings/${meetingId}/transcripts`);
  },
  generateSummary(meetingId: number, provider: "mock" | "openai" | "groq" = "mock") {
    return apiPost<Summary, { meeting_id: number; provider: "mock" | "openai" | "groq" }>("/ai/summaries/generate", {
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
