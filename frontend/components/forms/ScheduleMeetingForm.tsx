"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarPlus, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { DEMO_HOST_ID } from "@/lib/demo-user";
import { useMeetingStore } from "@/store/meeting_store";
import { useToastStore } from "@/store/toast_store";
import { toDatetimeLocal } from "@/utils/date";

export function ScheduleMeetingForm() {
  const { scheduleMeeting, createdMeeting, loading, error } = useMeetingStore();
  const { pushToast } = useToastStore();
  const [title, setTitle] = useState("Product design review");
  const [description, setDescription] = useState("Review meeting flow, AI recap surface, and participant experience.");
  const [scheduledStart, setScheduledStart] = useState(toDatetimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [duration, setDuration] = useState("45");
  const [localError, setLocalError] = useState<string | null>(null);

  const linkPreview = useMemo(() => {
    if (createdMeeting?.invite_link) return createdMeeting.invite_link;
    return "Meeting link appears after scheduling";
  }, [createdMeeting]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (title.trim().length < 3) {
      setLocalError("Meeting title should be at least 3 characters.");
      return;
    }
    const meeting = await scheduleMeeting({
      host_id: DEMO_HOST_ID,
      title: title.trim(),
      description: description.trim(),
      scheduled_start: new Date(scheduledStart).toISOString(),
      duration_minutes: Number(duration),
      meeting_type: "scheduled",
    });
    if (meeting) {
      pushToast({
        kind: "success",
        title: "Meeting scheduled",
        description: `${meeting.title} is now visible on the dashboard.`,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="panel p-6">
        <h1 className="text-2xl font-semibold text-slate-950">Schedule a meeting</h1>
        <p className="mt-2 text-sm text-slate-500">Create a polished meeting object with calendar-ready metadata.</p>

        <div className="mt-6 grid gap-5">
          <div className="space-y-2">
            <label htmlFor="title" className="label">Title</label>
            <input id="title" className="field" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              className="min-h-28 w-full rounded-md border border-zoom-line bg-white px-3 py-3 text-sm outline-none transition focus:border-zoom-blue focus:ring-2 focus:ring-blue-100"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="scheduledStart" className="label">Date and time</label>
              <input
                id="scheduledStart"
                type="datetime-local"
                className="field"
                value={scheduledStart}
                onChange={(event) => setScheduledStart(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="duration" className="label">Duration</label>
              <select id="duration" className="field" value={duration} onChange={(event) => setDuration(event.target.value)}>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
          </div>

          {(localError || error) && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {localError ?? error}
            </div>
          )}

          <Button disabled={loading} icon={<CalendarPlus className="h-4 w-4" aria-hidden="true" />}>
            {loading ? "Scheduling..." : "Schedule meeting"}
          </Button>
        </div>
      </section>

      <aside className="panel h-fit p-6">
        <h2 className="text-base font-semibold text-slate-950">Meeting link preview</h2>
        <div className="mt-4 rounded-lg border border-zoom-line bg-slate-50 p-4">
          <p className="break-all text-sm font-medium text-slate-800">{linkPreview}</p>
          {createdMeeting && <p className="mt-2 text-xs text-slate-500">Code {createdMeeting.meeting_code}</p>}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!createdMeeting?.invite_link) return;
              void navigator.clipboard.writeText(createdMeeting.invite_link);
              pushToast({ kind: "success", title: "Invite link copied" });
            }}
            icon={<Copy className="h-4 w-4" aria-hidden="true" />}
          >
            Copy link
          </Button>
          {createdMeeting && (
            <Link href={`/meeting?meetingId=${createdMeeting.id}`}>
              <Button type="button" className="w-full" icon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}>
                Open room
              </Button>
            </Link>
          )}
        </div>
      </aside>
    </form>
  );
}
