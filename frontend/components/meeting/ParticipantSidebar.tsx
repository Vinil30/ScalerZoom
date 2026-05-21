import { UsersRound } from "lucide-react";
import type { Participant } from "@/types/api";

export function ParticipantSidebar({ participants }: { participants: Participant[] }) {
  return (
    <aside className="hidden w-80 border-l border-slate-800 bg-slate-950 p-4 text-white xl:block">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Participants</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-xs">
          <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
          {participants.length}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {participants.map((participant) => (
          <div key={participant.id} className="flex items-center justify-between rounded-md bg-slate-900 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{participant.display_name}</p>
              <p className="text-xs capitalize text-slate-400">{participant.role}</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
        ))}
      </div>
    </aside>
  );
}
