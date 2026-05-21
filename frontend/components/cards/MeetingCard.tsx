import Link from "next/link";
import { Clock, UsersRound } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Meeting } from "@/types/api";
import { formatMeetingDate } from "@/utils/date";

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  return (
    <article className="rounded-lg border border-zoom-line bg-white p-4 transition hover:border-blue-200 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-950">{meeting.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{meeting.description ?? "No description provided."}</p>
        </div>
        <StatusBadge status={meeting.status} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatMeetingDate(meeting.scheduled_start)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
          {meeting.participant_count} participants
        </span>
        <span className="inline-flex items-center gap-1.5">
          Code {meeting.meeting_code}
        </span>
      </div>
      <Link
        href={`/meeting?meetingId=${meeting.id}`}
        className="mt-4 inline-flex text-sm font-semibold text-zoom-blue hover:text-blue-700"
      >
        Open meeting room
      </Link>
    </article>
  );
}
