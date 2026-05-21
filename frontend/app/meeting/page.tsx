"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MeetingRoomView } from "@/features/meetings/MeetingRoomView";

function MeetingPageContent() {
  const searchParams = useSearchParams();
  const meetingId = Number(searchParams.get("meetingId"));
  return <MeetingRoomView meetingId={Number.isFinite(meetingId) && meetingId > 0 ? meetingId : null} />;
}

export default function MeetingPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-slate-950 text-white">Loading meeting...</div>}>
      <MeetingPageContent />
    </Suspense>
  );
}
