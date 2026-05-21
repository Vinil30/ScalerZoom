"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { AppNavbar } from "@/components/navbar/AppNavbar";
import { MeetingListSection } from "@/components/dashboard/MeetingListSection";
import { MetricStrip } from "@/components/dashboard/MetricStrip";
import { QuickActionGrid } from "@/components/dashboard/QuickActionGrid";
import { DEMO_HOST_ID } from "@/lib/demo-user";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useMeetingStore } from "@/store/meeting_store";
import { useToastStore } from "@/store/toast_store";

const productLinks = [
  { label: "AI Companion", badge: "New", external: true },
  { label: "Meetings" },
  { label: "Recordings" },
  { label: "Summaries" },
  { label: "Hub", badge: "New", external: true },
  { label: "Whiteboards", external: true },
  { label: "Notes" },
  { label: "Clips", external: true },
  { label: "Canvas", external: true },
  { label: "Tasks", external: true },
  { label: "Scheduler", external: true },
  { label: "Discover More Products" },
];

export function DashboardView() {
  const router = useRouter();
  const { overview, loading, error } = useDashboardData();
  const { createMeeting } = useMeetingStore();
  const { pushToast } = useToastStore();

  async function handleNewMeeting() {
    const meeting = await createMeeting({
      host_id: DEMO_HOST_ID,
      title: "Instant collaboration room",
      description: "Started from the Zoom AI Workspace dashboard.",
      meeting_type: "instant",
      duration_minutes: 30,
    });
    if (meeting) {
      pushToast({ kind: "success", title: "Instant meeting started", description: `Invite code ${meeting.meeting_code}` });
      router.push(`/meeting?meetingId=${meeting.id}`);
    }
  }

  const personalMeetingId = overview?.recent_meetings[0]?.meeting_code ?? overview?.upcoming_schedule[0]?.meeting_code ?? "379 501 4625";

  return (
    <div className="app-shell">
      <AppNavbar />
      <div className="flex min-h-[calc(100vh-80px)] bg-white">
        <aside className="hidden w-[374px] shrink-0 border-r border-[#d9deea] bg-[#fbfcff] lg:block">
          <div className="sticky top-20 h-[calc(100vh-80px)] overflow-y-auto pb-8">
            <div className="border-b border-[#d9deea] bg-[#eef6ff] px-12 py-5 text-[19px] font-normal text-[#0b5cff]">Home</div>
            <div className="px-4 py-7">
              <p className="mb-5 text-[15px] font-normal text-[#59606f]">My Products</p>
              <nav className="space-y-1">
                {productLinks.map((item) => (
                  <div key={item.label} className="flex min-h-11 items-center justify-between rounded-lg border border-transparent px-8 py-2.5 text-[19px] font-normal text-[#05051f] transition hover:border-[#d9deea] hover:bg-white">
                    <span>{item.label}</span>
                    <span className="flex items-center gap-3">
                      {item.badge ? <span className="rounded-full border border-[#8cbcff] bg-[#eff6ff] px-2 py-0.5 text-xs font-normal text-[#0b5cff]">{item.badge}</span> : null}
                      {item.external ? <ExternalLink className="h-4 w-4 text-[#111827]" aria-hidden="true" /> : null}
                    </span>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-white px-5 py-8 sm:px-8 xl:px-10">
          {error && <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          {loading && !overview ? (
            <div className="zoom-card h-64 animate-pulse" />
          ) : overview ? (
            <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_410px]">
              <section className="min-w-0 space-y-7">
                <div className="zoom-card flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex h-[98px] w-[98px] items-center justify-center rounded-[22px] bg-[#111118] text-2xl font-medium text-white shadow-sm">SV</div>
                    <div>
                      <h1 className="text-[30px] font-semibold leading-tight text-[#05051f]">sai vinil</h1>
                      <p className="mt-1 text-[18px] text-[#16162b]">Plan: <span className="font-normal">Workplace Basic</span></p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-4 sm:items-end">
                    <button className="h-10 rounded-lg border border-[#8f9bad] bg-white px-8 text-[18px] font-normal text-[#111827]">Manage Plan</button>
                    <Link href="/dashboard" className="text-[18px] font-normal text-[#0b5cff]">View Plan Details</Link>
                  </div>
                </div>

                <div className="zoom-card relative min-h-[376px] overflow-hidden px-8 py-12 sm:px-16">
                  <div className="absolute bottom-[-120px] left-[7%] h-[460px] w-[66%] rounded-[50%] bg-[#f0ecf8]" />
                  <div className="relative z-10 max-w-[600px]">
                    <h2 className="text-[34px] font-semibold leading-tight text-[#202033] sm:text-[46px]">Summer savings are on!</h2>
                    <p className="mt-6 text-[21px] leading-tight text-[#05051f]">
                      For a limited time, get 15% off an annual Zoom Workplace Pro plan and unlock meetings up to 30 hours,
                      unlimited AI Companion usage, unlimited AI note-taking with My Notes, and more.
                    </p>
                    <button className="mt-8 rounded-[10px] bg-[#0b5cff] px-7 py-3 text-[20px] font-semibold text-white shadow-sm transition hover:bg-[#0a4ed9]">
                      Redeem offer
                    </button>
                  </div>
                  <p className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-sm text-[#6c6f83]">Terms apply.</p>
                </div>

                <MetricStrip overview={overview} />
                <MeetingListSection title="Recent activity" meetings={overview.recent_meetings} />
              </section>

              <aside className="space-y-7">
                <QuickActionGrid onNewMeeting={() => void handleNewMeeting()} personalMeetingId={personalMeetingId} />

                <section className="zoom-card p-8">
                  <div className="mb-7 flex items-center justify-between gap-4">
                    <h2 className="text-[34px] font-semibold text-[#05051f]">Meetings</h2>
                    <Link href="/schedule" className="text-[18px] font-normal text-[#0b5cff]">Visit Meetings</Link>
                  </div>
                  {overview.upcoming_schedule.length > 0 ? (
                    <div className="space-y-3">
                      {overview.upcoming_schedule.slice(0, 2).map((meeting) => (
                        <Link key={meeting.id} href={`/meeting?meetingId=${meeting.id}`} className="block rounded-lg border border-[#dfe4ee] bg-[#f5f6f8] px-4 py-4 transition hover:bg-[#eef4ff]">
                          <p className="truncate text-[18px] font-semibold text-[#05051f]">{meeting.title}</p>
                          <p className="mt-1 text-sm text-[#62677a]">Code {meeting.meeting_code}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-[#dfe4ee] bg-[#f5f6f8] px-4 py-3 text-[21px] font-semibold text-[#05051f]">No Upcoming Meetings</div>
                  )}
                  <button className="mx-auto mt-5 block rounded-lg border border-[#9ca8ba] bg-white px-5 py-2 text-[18px] text-[#111827]">
                    Test Audio and Video
                  </button>
                </section>

                <section className="zoom-card p-8">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-[#0b5cff]" aria-hidden="true" />
                    <h2 className="text-[24px] font-semibold text-[#05051f]">AI workspace</h2>
                  </div>
                  <p className="mt-3 text-[16px] leading-6 text-[#62677a]">
                    Meeting summaries, transcripts, and action items appear inside the meeting room after transcript processing.
                  </p>
                </section>
              </aside>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
