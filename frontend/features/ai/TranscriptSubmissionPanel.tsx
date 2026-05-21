"use client";

import { FormEvent, useState } from "react";
import { FileText, WandSparkles } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useAIStore } from "@/store/ai_store";
import { useToastStore } from "@/store/toast_store";

const sampleTranscript =
  "Maya opened the meeting by reviewing launch readiness and customer feedback. Arjun will prepare transcript quality metrics by Friday. Nora should confirm onboarding copy and prioritize the dashboard blockers. The team agreed to review AI summary accuracy in the next sync.";

export function TranscriptSubmissionPanel({ meetingId }: { meetingId: number }) {
  const [transcriptText, setTranscriptText] = useState(sampleTranscript);
  const { processing, processTranscript, error } = useAIStore();
  const { pushToast } = useToastStore();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = await processTranscript(meetingId, transcriptText);
    if (ok) {
      pushToast({
        kind: "success",
        title: "AI meeting intelligence generated",
        description: "Summary, transcript, and action items were persisted.",
      });
    }
  }

  return (
    <section className="panel p-5 lg:col-span-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <FileText className="h-5 w-5 text-zoom-blue" aria-hidden="true" />
            Transcript ingestion
          </h2>
          <p className="mt-1 text-sm text-slate-500">Submit meeting notes to generate persisted AI summary and action items.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          className="min-h-32 w-full rounded-md border border-zoom-line bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-zoom-blue focus:ring-2 focus:ring-blue-100"
          value={transcriptText}
          onChange={(event) => setTranscriptText(event.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button disabled={processing || transcriptText.trim().length < 10} icon={<WandSparkles className="h-4 w-4" aria-hidden="true" />}>
          {processing ? "Processing transcript..." : "Generate AI intelligence"}
        </Button>
      </form>
    </section>
  );
}
