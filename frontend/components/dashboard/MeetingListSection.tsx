import { EmptyState } from "@/components/shared/EmptyState";
import { MeetingCard } from "@/components/cards/MeetingCard";
import type { Meeting } from "@/types/api";

export function MeetingListSection({ title, meetings }: { title: string; meetings: Meeting[] }) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        <span className="text-sm text-slate-500">{meetings.length} items</span>
      </div>
      {meetings.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing here yet" description="Meetings will appear here after they are created or scheduled." />
      )}
    </section>
  );
}
