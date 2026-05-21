"use client";

import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/navbar/AppNavbar";
import { MeetingListSection } from "@/components/dashboard/MeetingListSection";
import { MetricStrip } from "@/components/dashboard/MetricStrip";
import { QuickActionGrid } from "@/components/dashboard/QuickActionGrid";
import { DEMO_HOST_ID } from "@/lib/demo-user";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useMeetingStore } from "@/store/meeting_store";

export function DashboardView() {
  const router = useRouter();
  const { overview, loading, error } = useDashboardData();
  const { createMeeting } = useMeetingStore();

  async function handleNewMeeting() {
    const meeting = await createMeeting({
      host_id: DEMO_HOST_ID,
      title: "Instant collaboration room",
      description: "Started from the Zoom AI Workspace dashboard.",
      meeting_type: "instant",
      duration_minutes: 30,
    });
    if (meeting) router.push(`/meeting?meetingId=${meeting.id}`);
  }

  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="page-container">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-zoom-blue">Zoom Workplace inspired</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Welcome back, Maya</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage meetings, join rooms, and review AI-powered collaboration insights from one calm workspace.
            </p>
          </div>
          <div className="rounded-lg border border-zoom-line bg-white px-4 py-3 text-sm text-slate-600">
            Profile and settings placeholders are ready for auth in the next phase.
          </div>
        </div>

        {error && <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading && !overview ? (
          <div className="panel h-64 animate-pulse bg-white" />
        ) : overview ? (
          <div className="space-y-6">
            <QuickActionGrid onNewMeeting={() => void handleNewMeeting()} />
            <MetricStrip overview={overview} />
            <div className="grid gap-6 xl:grid-cols-2">
              <MeetingListSection title="Upcoming meetings" meetings={overview.upcoming_schedule} />
              <MeetingListSection title="Recent meetings" meetings={overview.recent_meetings} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
