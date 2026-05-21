import { AppNavbar } from "@/components/navbar/AppNavbar";
import { JoinMeetingForm } from "@/components/forms/JoinMeetingForm";

export function JoinMeetingView({ initialMeetingCode }: { initialMeetingCode?: string }) {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="page-container grid min-h-[calc(100vh-64px)] place-items-center">
        <JoinMeetingForm initialMeetingCode={initialMeetingCode} />
      </main>
    </div>
  );
}
