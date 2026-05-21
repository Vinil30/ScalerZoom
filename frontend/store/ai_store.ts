"use client";

import { create } from "zustand";
import { aiService } from "@/services/ai_service";
import type { ActionItem, Summary, Transcript } from "@/types/api";

interface AIState {
  transcripts: Transcript[];
  summary: Summary | null;
  actionItems: ActionItem[];
  loading: boolean;
  error: string | null;
  fetchTranscripts: (meetingId: number) => Promise<void>;
  generateSummary: (meetingId: number) => Promise<void>;
  hydrateDemoActionItems: (meetingId: number) => void;
}

export const useAIStore = create<AIState>((set) => ({
  transcripts: [],
  summary: null,
  actionItems: [],
  loading: false,
  error: null,
  fetchTranscripts: async (meetingId) => {
    set({ loading: true, error: null });
    try {
      const transcripts = await aiService.listTranscripts(meetingId);
      set({ transcripts, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load transcripts.", loading: false });
    }
  },
  generateSummary: async (meetingId) => {
    set({ loading: true, error: null });
    try {
      const summary = await aiService.generateSummary(meetingId);
      set({ summary, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to generate summary.", loading: false });
    }
  },
  hydrateDemoActionItems: (meetingId) => {
    set({
      actionItems: [
        {
          id: 1,
          meeting_id: meetingId,
          action_text: "Confirm recording pipeline ownership before the next sync.",
          assigned_to: "Maya Raman",
          priority: "high",
          status: "open",
          generated_at: new Date().toISOString(),
        },
        {
          id: 2,
          meeting_id: meetingId,
          action_text: "Prepare transcript quality metrics for dashboard review.",
          assigned_to: "Arjun Dev",
          priority: "medium",
          status: "in_progress",
          generated_at: new Date().toISOString(),
        },
      ],
    });
  },
}));
