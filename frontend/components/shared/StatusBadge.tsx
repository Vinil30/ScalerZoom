import type { MeetingStatus } from "@/types/api";

const statusClass: Record<MeetingStatus, string> = {
  scheduled: "bg-blue-50 text-blue-700 ring-blue-100",
  live: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  ended: "bg-slate-100 text-slate-700 ring-slate-200",
  cancelled: "bg-red-50 text-red-700 ring-red-100",
};

export function StatusBadge({ status }: { status: MeetingStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClass[status]}`}>
      {status}
    </span>
  );
}
