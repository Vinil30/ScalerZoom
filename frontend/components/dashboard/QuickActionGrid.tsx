"use client";

import { CalendarDays, Plus, Video } from "lucide-react";
import Link from "next/link";

export function QuickActionGrid({
  onNewMeeting,
  personalMeetingId = "379 501 4625",
}: {
  onNewMeeting: () => void;
  personalMeetingId?: string;
}) {
  const actions = [
    {
      label: "Schedule",
      href: "/schedule",
      icon: <CalendarDays className="h-6 w-6" aria-hidden="true" />,
      className: "bg-[#0b6ff6]",
    },
    {
      label: "Join",
      href: "/join",
      icon: <Plus className="h-6 w-6" aria-hidden="true" />,
      className: "bg-[#1777f2]",
    },
    {
      label: "Host",
      onClick: onNewMeeting,
      icon: <Video className="h-6 w-6" aria-hidden="true" />,
      className: "bg-[#ff7a2b]",
    },
  ];

  return (
    <section className="zoom-card p-8">
      <div className="grid grid-cols-3 gap-6">
        {actions.map((item) =>
          item.href ? (
            <Link key={item.label} href={item.href} className="group flex flex-col items-center gap-3">
              <span className={`flex h-[62px] w-[62px] items-center justify-center rounded-2xl text-white shadow-sm transition group-hover:scale-105 ${item.className}`}>
                {item.icon}
              </span>
              <span className="text-[15px] font-normal text-[#5b5575]">{item.label}</span>
            </Link>
          ) : (
            <button key={item.label} onClick={item.onClick} className="group flex flex-col items-center gap-3">
              <span className={`flex h-[62px] w-[62px] items-center justify-center rounded-2xl text-white shadow-sm transition group-hover:scale-105 ${item.className}`}>
                {item.icon}
              </span>
              <span className="text-[15px] font-normal text-[#5b5575]">{item.label}</span>
            </button>
          ),
        )}
      </div>
      <div className="mt-8 text-center">
        <p className="text-[20px] font-semibold text-[#17172a]">Personal Meeting ID</p>
        <p className="mt-2 text-lg text-[#17172a]">{personalMeetingId}</p>
      </div>
    </section>
  );
}
