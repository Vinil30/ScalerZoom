import { AppNavbar } from "@/components/navbar/AppNavbar";
import { ScheduleMeetingForm } from "@/components/forms/ScheduleMeetingForm";

export function ScheduleMeetingView() {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="page-container">
        <ScheduleMeetingForm />
      </main>
    </div>
  );
}
