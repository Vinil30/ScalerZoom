"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Info, Video } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { MeetingControls } from "@/components/meeting/MeetingControls";
import { ParticipantSidebar } from "@/components/meeting/ParticipantSidebar";
import { ParticipantTile } from "@/components/meeting/ParticipantTile";
import { AIActionItemsPanel } from "@/features/ai/AIActionItemsPanel";
import { AISummaryPanel } from "@/features/ai/AISummaryPanel";
import { TranscriptInsightsPanel } from "@/features/ai/TranscriptInsightsPanel";
import { useAIStore } from "@/store/ai_store";
import { useMeetingStore } from "@/store/meeting_store";
import { formatMeetingDate } from "@/utils/date";

export function MeetingRoomView({ meetingId }: { meetingId: number | null }) {
  const { currentMeeting, participants, activeParticipant, fetchMeeting, fetchParticipants } = useMeetingStore();
  const { fetchTranscripts, hydrateDemoActionItems } = useAIStore();

  useEffect(() => {
    if (!meetingId) return;
    void fetchMeeting(meetingId);
    void fetchParticipants(meetingId);
    void fetchTranscripts(meetingId);
    hydrateDemoActionItems(meetingId);
  }, [fetchMeeting, fetchParticipants, fetchTranscripts, hydrateDemoActionItems, meetingId]);

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
      <header className="flex min-h-16 items-center justify-between border-b border-slate-800 px-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{currentMeeting?.title ?? "Meeting room"}</h1>
          <p className="text-xs text-slate-400">
            {currentMeeting ? `${currentMeeting.meeting_code} · ${formatMeetingDate(currentMeeting.scheduled_start)}` : "Loading meeting details"}
          </p>
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
            {visibleParticipants.map((participant) => (
              <ParticipantTile key={participant.id} participant={participant} isLocal={participant.id === activeParticipant?.id} />
            ))}
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
          <MeetingControls />
        </section>
        <ParticipantSidebar participants={visibleParticipants} />
      </main>

      <section className="bg-zoom-surface text-zoom-ink">
        <div className="page-container grid gap-5 lg:grid-cols-3">
          <AISummaryPanel meetingId={meetingId} />
          <AIActionItemsPanel />
          <TranscriptInsightsPanel />
        </div>
      </section>
    </div>
  );
}
