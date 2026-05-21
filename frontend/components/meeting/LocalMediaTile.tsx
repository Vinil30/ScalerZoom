"use client";

import { useEffect, useRef } from "react";
import { Camera, Mic, MicOff, VideoOff } from "lucide-react";
import type { Participant } from "@/types/api";

export function LocalMediaTile({
  participant,
  stream,
  cameraEnabled,
  micEnabled,
  permissionError,
  requesting,
  onRequestMedia,
}: {
  participant: Participant;
  stream: MediaStream | null;
  cameraEnabled: boolean;
  micEnabled: boolean;
  permissionError: string | null;
  requesting: boolean;
  onRequestMedia: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-900 text-white shadow-sm ring-2 ring-emerald-400/60">
      {stream && cameraEnabled ? (
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-xl font-semibold">
            {participant.display_name.slice(0, 2).toUpperCase()}
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            onClick={onRequestMedia}
            disabled={requesting}
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {requesting ? "Requesting..." : "Enable camera"}
          </button>
          {permissionError && <p className="max-w-xs px-4 text-center text-xs text-red-200">{permissionError}</p>}
        </div>
      )}
      {!cameraEnabled && (
        <div className="absolute right-3 top-3 rounded-full bg-black/55 p-2">
          <VideoOff className="h-4 w-4 text-red-200" aria-hidden="true" />
        </div>
      )}
      <div className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold text-white">You</div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 px-3 py-2">
        <span className="truncate text-sm font-medium">{participant.display_name}</span>
        {micEnabled ? <Mic className="h-4 w-4" aria-hidden="true" /> : <MicOff className="h-4 w-4 text-red-300" aria-hidden="true" />}
      </div>
    </div>
  );
}
