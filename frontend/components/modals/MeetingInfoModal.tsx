import type { Meeting } from "@/types/api";

export function MeetingInfoModal({ meeting }: { meeting: Meeting | null }) {
  if (!meeting) return null;

  return (
    <div className="rounded-lg border border-zoom-line bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">Meeting information</h2>
      <p className="mt-2 text-sm text-slate-500">{meeting.title}</p>
      <p className="mt-2 text-xs text-slate-500">Code {meeting.meeting_code}</p>
    </div>
  );
}
