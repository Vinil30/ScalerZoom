import { JoinMeetingView } from "@/features/meetings/JoinMeetingView";

export default async function JoinInvitePage({ params }: { params: Promise<{ meetingCode: string }> }) {
  const { meetingCode } = await params;
  return <JoinMeetingView initialMeetingCode={decodeURIComponent(meetingCode)} />;
}
