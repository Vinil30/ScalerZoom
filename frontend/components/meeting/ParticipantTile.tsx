import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import type { Participant } from "@/types/api";

export function ParticipantTile({ participant, isLocal = false }: { participant: Participant; isLocal?: boolean }) {
  const initials = participant.display_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900 text-white shadow-sm">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-xl font-semibold">
          {initials}
        </div>
      </div>
      <div className="absolute left-3 top-3 rounded-full bg-black/45 px-2 py-1 text-xs font-medium">
        {isLocal ? "You" : participant.role}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/45 px-3 py-2">
        <span className="truncate text-sm font-medium">{participant.display_name}</span>
        <span className="flex items-center gap-2">
          {participant.mic_enabled ? <Mic className="h-4 w-4" aria-hidden="true" /> : <MicOff className="h-4 w-4 text-red-300" aria-hidden="true" />}
          {participant.video_enabled ? <Video className="h-4 w-4" aria-hidden="true" /> : <VideoOff className="h-4 w-4 text-red-300" aria-hidden="true" />}
        </span>
      </div>
    </div>
  );
}
