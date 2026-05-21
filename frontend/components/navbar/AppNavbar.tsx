"use client";

import Link from "next/link";
import { Bell, Settings, Video } from "lucide-react";
import { Button } from "@/components/shared/Button";

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zoom-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-zoom-blue text-white">
            <Video className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold tracking-normal text-zoom-ink">Zoom AI Workspace</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="/dashboard">
            Dashboard
          </Link>
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="/join">
            Join
          </Link>
          <Link className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href="/schedule">
            Schedule
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden w-11 px-0 sm:inline-flex" aria-label="Notifications">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Button variant="ghost" className="hidden w-11 px-0 sm:inline-flex" aria-label="Settings">
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            MR
          </div>
        </div>
      </div>
    </header>
  );
}
