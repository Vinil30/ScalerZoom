import { Activity, Brain, CalendarDays, Users } from "lucide-react";
import type { DashboardOverview } from "@/types/api";

export function MetricStrip({ overview }: { overview: DashboardOverview }) {
  const metrics = [
    { label: "Total meetings", value: overview.total_meetings, icon: CalendarDays },
    { label: "Live now", value: overview.live_meetings, icon: Activity },
    { label: "Participants", value: overview.total_participants, icon: Users },
    { label: "AI summaries", value: overview.total_ai_summaries, icon: Brain },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon }) => (
        <div key={label} className="panel flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-zoom-blue">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      ))}
    </section>
  );
}
