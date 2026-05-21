"use client";

import { create } from "zustand";
import { meetingService } from "@/services/meeting_service";
import type { CreateMeetingInput, JoinMeetingInput, Meeting, MeetingWithLink, Participant } from "@/types/api";

interface MeetingState {
  currentMeeting: Meeting | null;
  createdMeeting: MeetingWithLink | null;
  participants: Participant[];
  activeParticipant: Participant | null;
  loading: boolean;
  error: string | null;
  fetchMeeting: (meetingId: number) => Promise<void>;
  createMeeting: (input: CreateMeetingInput) => Promise<MeetingWithLink | null>;
  scheduleMeeting: (input: CreateMeetingInput) => Promise<MeetingWithLink | null>;
  joinMeeting: (input: JoinMeetingInput) => Promise<Participant | null>;
  fetchParticipants: (meetingId: number) => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  leaveMeeting: () => Promise<void>;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  currentMeeting: null,
  createdMeeting: null,
  participants: [],
  activeParticipant: null,
  loading: false,
  error: null,
  fetchMeeting: async (meetingId) => {
    set({ loading: true, error: null });
    try {
      const currentMeeting = await meetingService.getMeeting(meetingId);
      set({ currentMeeting, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load meeting.", loading: false });
    }
  },
  createMeeting: async (input) => {
    set({ loading: true, error: null });
    try {
      const createdMeeting = await meetingService.createMeeting(input);
      set({ createdMeeting, currentMeeting: createdMeeting, loading: false });
      return createdMeeting;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to create meeting.", loading: false });
      return null;
    }
  },
  scheduleMeeting: async (input) => {
    set({ loading: true, error: null });
    try {
      const createdMeeting = await meetingService.scheduleMeeting(input);
      set({ createdMeeting, loading: false });
      return createdMeeting;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to schedule meeting.", loading: false });
      return null;
    }
  },
  joinMeeting: async (input) => {
    set({ loading: true, error: null });
    try {
      const participant = await meetingService.joinMeeting(input);
      set({ activeParticipant: participant, loading: false });
      await get().fetchParticipants(participant.meeting_id);
      return participant;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to join meeting.", loading: false });
      return null;
    }
  },
  fetchParticipants: async (meetingId) => {
    try {
      const participants = await meetingService.listParticipants(meetingId);
      set({ participants });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load participants." });
    }
  },
  toggleMic: async () => {
    const participant = get().activeParticipant;
    if (!participant) return;
    const updated = await meetingService.updateParticipant(participant.id, { mic_enabled: !participant.mic_enabled });
    set((state) => ({
      activeParticipant: updated,
      participants: state.participants.map((item) => (item.id === updated.id ? updated : item)),
    }));
  },
  toggleCamera: async () => {
    const participant = get().activeParticipant;
    if (!participant) return;
    const updated = await meetingService.updateParticipant(participant.id, { video_enabled: !participant.video_enabled });
    set((state) => ({
      activeParticipant: updated,
      participants: state.participants.map((item) => (item.id === updated.id ? updated : item)),
    }));
  },
  leaveMeeting: async () => {
    const participant = get().activeParticipant;
    if (!participant) return;
    const updated = await meetingService.leaveMeeting(participant.id);
    set((state) => ({
      activeParticipant: updated,
      participants: state.participants.map((item) => (item.id === updated.id ? updated : item)),
    }));
  },
}));
