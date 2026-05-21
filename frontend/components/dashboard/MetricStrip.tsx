import { Activity, CalendarDays, FileText, Users } from "lucide-react";
import type { DashboardOverview } from "@/types/api";

export function MetricStrip({ overview }: { overview: DashboardOverview }) {
  const metrics = [
    { label: "Total meetings", value: overview.total_meetings, icon: CalendarDays },
    { label: "Live now", value: overview.live_meetings, icon: Activity },
    { label: "Participants", value: overview.total_participants, icon: Users },
    { label: "Transcripts", value: overview.total_transcripts, icon: FileText },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-2xl border border-[#d9deea] bg-white px-5 py-4 shadow-[0_6px_18px_rgba(20,27,45,0.04)]">
          <div>
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef5ff] text-[#0b5cff]">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-normal text-[#6d6a85]">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-[#09091f]">{value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
