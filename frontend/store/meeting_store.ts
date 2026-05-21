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
  restoreParticipant: (meetingId: number) => void;
}

const participantStorageKey = (meetingId: number) => `zoom-clone-active-participant-${meetingId}`;

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
      const participants = await meetingService.listParticipants(createdMeeting.id);
      const activeParticipant = participants.find((participant) => participant.role === "host") ?? participants[0] ?? null;
      if (activeParticipant) {
        window.localStorage.setItem(participantStorageKey(createdMeeting.id), JSON.stringify(activeParticipant));
      }
      set({ createdMeeting, currentMeeting: createdMeeting, participants, activeParticipant, loading: false });
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
      window.localStorage.setItem(participantStorageKey(participant.meeting_id), JSON.stringify(participant));
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
      const currentActive = get().activeParticipant;
      const activeParticipant =
        currentActive && participants.some((participant) => participant.id === currentActive.id)
          ? currentActive
          : participants.find((participant) => participant.role === "host") ?? participants[0] ?? null;
      if (activeParticipant) {
        window.localStorage.setItem(participantStorageKey(meetingId), JSON.stringify(activeParticipant));
      }
      set({ participants, activeParticipant });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to load participants." });
    }
  },
  toggleMic: async () => {
    const participant = get().activeParticipant;
    if (!participant) return;
    const updated = await meetingService.updateParticipant(participant.id, { mic_enabled: !participant.mic_enabled });
    window.localStorage.setItem(participantStorageKey(updated.meeting_id), JSON.stringify(updated));
    set((state) => ({
      activeParticipant: updated,
      participants: state.participants.map((item) => (item.id === updated.id ? updated : item)),
    }));
  },
  toggleCamera: async () => {
    const participant = get().activeParticipant;
    if (!participant) return;
    const updated = await meetingService.updateParticipant(participant.id, { video_enabled: !participant.video_enabled });
    window.localStorage.setItem(participantStorageKey(updated.meeting_id), JSON.stringify(updated));
    set((state) => ({
      activeParticipant: updated,
      participants: state.participants.map((item) => (item.id === updated.id ? updated : item)),
    }));
  },
  leaveMeeting: async () => {
    const participant = get().activeParticipant;
    if (!participant) return;
    const updated = await meetingService.leaveMeeting(participant.id);
    window.localStorage.setItem(participantStorageKey(updated.meeting_id), JSON.stringify(updated));
    set((state) => ({
      activeParticipant: updated,
      participants: state.participants.map((item) => (item.id === updated.id ? updated : item)),
    }));
  },
  restoreParticipant: (meetingId) => {
    const stored = window.localStorage.getItem(participantStorageKey(meetingId));
    if (!stored) return;
    try {
      set({ activeParticipant: JSON.parse(stored) });
    } catch {
      window.localStorage.removeItem(participantStorageKey(meetingId));
    }
  },
}));
