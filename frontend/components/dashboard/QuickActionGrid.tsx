"use client";

import { CalendarPlus, LogIn, Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";

export function QuickActionGrid({ onNewMeeting }: { onNewMeeting: () => void }) {
  const actions = [
    {
      label: "New Meeting",
      detail: "Start an instant room",
      icon: <Video className="h-5 w-5" aria-hidden="true" />,
      action: <Button onClick={onNewMeeting} icon={<Video className="h-4 w-4" aria-hidden="true" />}>Start</Button>,
    },
    {
      label: "Join Meeting",
      detail: "Use code or invite link",
      icon: <LogIn className="h-5 w-5" aria-hidden="true" />,
      action: (
        <Link href="/join">
          <Button variant="secondary" icon={<LogIn className="h-4 w-4" aria-hidden="true" />}>Join</Button>
        </Link>
      ),
    },
    {
      label: "Schedule Meeting",
      detail: "Plan with AI-ready notes",
      icon: <CalendarPlus className="h-5 w-5" aria-hidden="true" />,
      action: (
        <Link href="/schedule">
          <Button variant="secondary" icon={<CalendarPlus className="h-4 w-4" aria-hidden="true" />}>Schedule</Button>
        </Link>
      ),
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {actions.map((item) => (
        <div key={item.label} className="panel flex min-h-36 flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">{item.label}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-zoom-blue">{item.icon}</span>
          </div>
          <div className="mt-5">{item.action}</div>
        </div>
      ))}
    </section>
  );
}
