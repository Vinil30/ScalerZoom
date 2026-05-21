"use client";

import { create } from "zustand";
import { aiService } from "@/services/ai_service";
import type { ActionItem, Summary, Transcript } from "@/types/api";

interface AIState {
  transcripts: Transcript[];
  summary: Summary | null;
  summaries: Summary[];
  actionItems: ActionItem[];
  loading: boolean;
  processing: boolean;
  error: string | null;
  fetchAIState: (meetingId: number) => Promise<void>;
  fetchTranscripts: (meetingId: number) => Promise<void>;
  fetchSummaries: (meetingId: number) => Promise<void>;
  fetchActionItems: (meetingId: number) => Promise<void>;
  generateSummary: (meetingId: number) => Promise<Summary | null>;
  generateActionItems: (meetingId: number) => Promise<ActionItem[]>;
  processTranscript: (meetingId: number, transcriptText: string) => Promise<boolean>;
}

export const useAIStore = create<AIState>((set, get) => ({
  transcripts: [],
  summary: null,
  summaries: [],
  actionItems: [],
  loading: false,
  processing: false,
  error: null,
  fetchAIState: async (meetingId) => {
    set({ loading: true, error: null });
    await Promise.all([get().fetchTranscripts(meetingId), get().fetchSummaries(meetingId), get().fetchActionItems(meetingId)]);
    set({ loading: false });
  },
  fetchTranscripts: async (meetingId) => {
    try {
      const transcripts = await aiService.listTranscripts(meetingId);
      set({ transcripts });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load transcripts." });
    }
  },
  fetchSummaries: async (meetingId) => {
    try {
      const summaries = await aiService.listSummaries(meetingId);
      set({ summaries, summary: summaries[0] ?? null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load AI summaries." });
    }
  },
  fetchActionItems: async (meetingId) => {
    try {
      const actionItems = await aiService.listActionItems(meetingId);
      set({ actionItems });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load action items." });
    }
  },
  generateSummary: async (meetingId) => {
    set({ processing: true, error: null });
    try {
      const summary = await aiService.generateSummary(meetingId);
      set((state) => ({ summary, summaries: [summary, ...state.summaries], processing: false }));
      return summary;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to generate summary.", processing: false });
      return null;
    }
  },
  generateActionItems: async (meetingId) => {
    set({ processing: true, error: null });
    try {
      const generated = await aiService.generateActionItems(meetingId);
      set((state) => ({ actionItems: [...generated, ...state.actionItems], processing: false }));
      return generated;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to generate action items.", processing: false });
      return [];
    }
  },
  processTranscript: async (meetingId, transcriptText) => {
    set({ processing: true, error: null });
    try {
      const result = await aiService.processTranscript({
        meeting_id: meetingId,
        transcript_text: transcriptText,
        language: "en",
        source_model: "manual-live-notes",
        provider: "mock",
      });
      set((state) => ({
        transcripts: [result.transcript, ...state.transcripts],
        summary: result.summary,
        summaries: [result.summary, ...state.summaries],
        actionItems: [...result.action_items, ...state.actionItems],
        processing: false,
      }));
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to process transcript.", processing: false });
      return false;
    }
  },
}));
