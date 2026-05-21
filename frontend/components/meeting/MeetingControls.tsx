"use client";

import { LogOut, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useMeetingStore } from "@/store/meeting_store";

export function MeetingControls() {
  const { activeParticipant, toggleMic, toggleCamera, leaveMeeting } = useMeetingStore();
  const micEnabled = activeParticipant?.mic_enabled ?? true;
  const videoEnabled = activeParticipant?.video_enabled ?? true;

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-800 bg-slate-950 px-4 py-4">
      <Button
        variant="secondary"
        className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
        onClick={() => void toggleMic()}
        icon={micEnabled ? <Mic className="h-4 w-4" aria-hidden="true" /> : <MicOff className="h-4 w-4" aria-hidden="true" />}
      >
        {micEnabled ? "Mute" : "Unmute"}
      </Button>
      <Button
        variant="secondary"
        className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
        onClick={() => void toggleCamera()}
        icon={videoEnabled ? <Video className="h-4 w-4" aria-hidden="true" /> : <VideoOff className="h-4 w-4" aria-hidden="true" />}
      >
        {videoEnabled ? "Stop video" : "Start video"}
      </Button>
      <Button variant="danger" onClick={() => void leaveMeeting()} icon={<LogOut className="h-4 w-4" aria-hidden="true" />}>
        Leave
      </Button>
    </div>
  );
}
