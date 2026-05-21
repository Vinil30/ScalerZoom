"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useMeetingStore } from "@/store/meeting_store";
import { useToastStore } from "@/store/toast_store";

function extractMeetingCode(value: string): string {
  const trimmed = value.trim();
  const joinMatch = trimmed.match(/join\/([^/?#]+)/i);
  return (joinMatch?.[1] ?? trimmed).toUpperCase();
}

export function JoinMeetingForm({ initialMeetingCode = "" }: { initialMeetingCode?: string }) {
  const router = useRouter();
  const { joinMeeting, loading, error } = useMeetingStore();
  const { pushToast } = useToastStore();
  const [meetingInput, setMeetingInput] = useState(initialMeetingCode);
  const [displayName, setDisplayName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const previewCode = useMemo(() => extractMeetingCode(meetingInput), [meetingInput]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const meeting_code = extractMeetingCode(meetingInput);
    if (meeting_code.length < 4) {
      setLocalError("Enter a valid meeting code or invite link.");
      return;
    }
    if (displayName.trim().length < 2) {
      setLocalError("Enter the name you want participants to see.");
      return;
    }

    const participant = await joinMeeting({
      meeting_code,
      display_name: displayName.trim(),
      role: "participant",
      mic_enabled: true,
      video_enabled: true,
    });

    if (participant) {
      pushToast({ kind: "success", title: "Joined meeting", description: "Participant state is synced with the backend." });
      router.push(`/meeting?meetingId=${participant.meeting_id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel mx-auto w-full max-w-xl p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Join a meeting</h1>
        <p className="mt-2 text-sm text-slate-500">Use a meeting code or paste a full invite link.</p>
      </div>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <label htmlFor="meeting" className="label">Meeting ID or invite link</label>
          <input
            id="meeting"
            className="field"
            value={meetingInput}
            placeholder="ABC-123-4567 or http://localhost:3000/join/ABC-123-4567"
            onChange={(event) => setMeetingInput(event.target.value)}
          />
          {previewCode && <p className="text-xs text-slate-500">Detected code: {previewCode}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="displayName" className="label">Display name</label>
          <input
            id="displayName"
            className="field"
            value={displayName}
            placeholder="Maya Raman"
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </div>

        {(localError || error) && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {localError ?? error}
          </div>
        )}

        <Button className="w-full" disabled={loading} icon={<LogIn className="h-4 w-4" aria-hidden="true" />}>
          {loading ? "Validating meeting..." : "Join meeting"}
        </Button>
      </div>
    </form>
  );
}
