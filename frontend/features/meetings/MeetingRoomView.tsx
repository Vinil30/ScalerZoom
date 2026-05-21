"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Info, ShieldCheck, Video } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { LocalMediaTile } from "@/components/meeting/LocalMediaTile";
import { MeetingControls } from "@/components/meeting/MeetingControls";
import { ParticipantSidebar } from "@/components/meeting/ParticipantSidebar";
import { ParticipantTile } from "@/components/meeting/ParticipantTile";
import { AIActionItemsPanel } from "@/features/ai/AIActionItemsPanel";
import { TranscriptSubmissionPanel } from "@/features/ai/TranscriptSubmissionPanel";
import { TranscriptInsightsPanel } from "@/features/ai/TranscriptInsightsPanel";
import { useLocalMedia } from "@/hooks/useLocalMedia";
import { useAIStore } from "@/store/ai_store";
import { useMeetingStore } from "@/store/meeting_store";
import { formatMeetingDate } from "@/utils/date";

export function MeetingRoomView({ meetingId }: { meetingId: number | null }) {
  const { currentMeeting, participants, activeParticipant, fetchMeeting, fetchParticipants, restoreParticipant } = useMeetingStore();
  const { fetchAIState } = useAIStore();
  const localMedia = useLocalMedia();

  useEffect(() => {
    if (!meetingId) return;
    restoreParticipant(meetingId);
    void fetchMeeting(meetingId);
    void fetchParticipants(meetingId);
    void fetchAIState(meetingId);
    const interval = window.setInterval(() => {
      void fetchParticipants(meetingId);
      void fetchMeeting(meetingId);
    }, 8000);
    return () => window.clearInterval(interval);
  }, [fetchAIState, fetchMeeting, fetchParticipants, meetingId, restoreParticipant]);

  if (!meetingId) {
    return (
      <div className="app-shell grid min-h-screen place-items-center p-6">
        <div className="panel max-w-md p-6 text-center">
          <h1 className="text-xl font-semibold">Meeting not selected</h1>
          <p className="mt-2 text-sm text-slate-500">Open a meeting from the dashboard or join with a meeting code.</p>
          <Link className="mt-5 inline-flex" href="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const visibleParticipants = participants.length > 0 ? participants : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-800 px-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{currentMeeting?.title ?? "Meeting room"}</h1>
          <p className="text-xs text-slate-400">
            {currentMeeting ? `${currentMeeting.meeting_code} | ${formatMeetingDate(currentMeeting.scheduled_start)}` : "Loading meeting details"}
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300 md:flex">
          <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          Local media preview
        </div>
        <Link href="/dashboard">
          <Button variant="secondary" className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800" icon={<Video className="h-4 w-4" aria-hidden="true" />}>
            Dashboard
          </Button>
        </Link>
      </header>

      <main className="flex min-h-[calc(100vh-64px)]">
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="grid flex-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleParticipants.map((participant) =>
              participant.id === activeParticipant?.id ? (
                <LocalMediaTile
                  key={participant.id}
                  participant={participant}
                  stream={localMedia.stream}
                  cameraEnabled={localMedia.cameraEnabled && participant.video_enabled}
                  micEnabled={localMedia.micEnabled && participant.mic_enabled}
                  permissionError={localMedia.permissionError}
                  requesting={localMedia.requesting}
                  onRequestMedia={() => void localMedia.requestMedia()}
                />
              ) : (
                <ParticipantTile key={participant.id} participant={participant} />
              ),
            )}
            {visibleParticipants.length === 0 && (
              <div className="col-span-full grid place-items-center rounded-lg border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
                <div>
                  <Info className="mx-auto h-10 w-10 text-slate-500" aria-hidden="true" />
                  <h2 className="mt-3 text-lg font-semibold">Waiting for participants</h2>
                  <p className="mt-2 text-sm text-slate-400">Join from the join page to create a participant session.</p>
                </div>
              </div>
            )}
          </div>
          <MeetingControls onMicChanged={localMedia.setMicEnabled} onCameraChanged={localMedia.setCameraEnabled} />
        </section>
        <ParticipantSidebar participants={visibleParticipants} />
      </main>

      <section className="bg-zoom-surface text-zoom-ink">
        <div className="page-container grid gap-5 lg:grid-cols-3">
          <TranscriptSubmissionPanel meetingId={meetingId} />
          <AIActionItemsPanel meetingId={meetingId} />
          <TranscriptInsightsPanel />
        </div>
      </section>
    </div>
  );
}
