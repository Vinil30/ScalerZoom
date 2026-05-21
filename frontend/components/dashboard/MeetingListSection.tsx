import { EmptyState } from "@/components/shared/EmptyState";
import { MeetingCard } from "@/components/cards/MeetingCard";
import type { Meeting } from "@/types/api";

export function MeetingListSection({ title, meetings }: { title: string; meetings: Meeting[] }) {
  return (
    <section className="zoom-card p-7">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[30px] font-semibold text-[#07071f]">{title}</h2>
        <span className="text-sm font-normal text-[#0b5cff]">{meetings.length} items</span>
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
