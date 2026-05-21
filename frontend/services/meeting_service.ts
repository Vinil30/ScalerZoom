import { apiGet, apiPatch, apiPost } from "@/services/api";
import type { CreateMeetingInput, JoinMeetingInput, Meeting, MeetingWithLink, Participant } from "@/types/api";

export const meetingService = {
  listMeetings(status?: string) {
    return apiGet<Meeting[]>(status ? `/meetings?status=${status}` : "/meetings");
  },
  getMeeting(meetingId: number) {
    return apiGet<Meeting>(`/meetings/${meetingId}`);
  },
  createMeeting(input: CreateMeetingInput) {
    return apiPost<MeetingWithLink, CreateMeetingInput>("/meetings", input);
  },
  scheduleMeeting(input: CreateMeetingInput) {
    return apiPost<MeetingWithLink, CreateMeetingInput>("/schedule", {
      ...input,
      meeting_type: "scheduled",
    });
  },
  joinMeeting(input: JoinMeetingInput) {
    return apiPost<Participant, JoinMeetingInput>("/meetings/join", input);
  },
  listParticipants(meetingId: number) {
    return apiGet<Participant[]>(`/participants/meeting/${meetingId}`);
  },
  updateParticipant(participantId: number, input: Partial<Participant>) {
    return apiPatch<Participant, Partial<Participant>>(`/participants/${participantId}`, input);
  },
  leaveMeeting(participantId: number) {
    return apiPost<Participant, undefined>(`/participants/${participantId}/leave`);
  },
};
