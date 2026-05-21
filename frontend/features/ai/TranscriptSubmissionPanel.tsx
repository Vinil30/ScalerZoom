"use client";

import { FormEvent, useState } from "react";
import { FileText, Mic, MicOff, Plus, Trash2, WandSparkles } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useSpeechTranscript } from "@/hooks/useSpeechTranscript";
import { useAIStore } from "@/store/ai_store";
import { useToastStore } from "@/store/toast_store";

const sampleTranscript =
  "Maya opened the meeting by reviewing launch readiness and customer feedback. Arjun will prepare transcript quality metrics by Friday. Nora should confirm onboarding copy and prioritize the dashboard blockers. The team agreed to review AI summary accuracy in the next sync.";

export function TranscriptSubmissionPanel({ meetingId }: { meetingId: number }) {
  const [transcriptText, setTranscriptText] = useState(sampleTranscript);
  const { processing, processTranscript, error } = useAIStore();
  const { pushToast } = useToastStore();
  const speech = useSpeechTranscript();

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

  function addVoiceTranscript() {
    const capturedText = [speech.transcript, speech.interimTranscript].filter(Boolean).join(" ").trim();
    if (!capturedText) return;
    setTranscriptText((current) => `${current.trim()}\n\n${capturedText}`.trim());
    speech.clearTranscript();
  }

  return (
    <section className="panel p-5 lg:col-span-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <FileText className="h-5 w-5 text-zoom-blue" aria-hidden="true" />
            Transcript ingestion
          </h2>
          <p className="mt-1 text-sm text-slate-500">Submit meeting notes or capture Chrome voice notes to generate persisted AI summary and action items.</p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Automated voice notes</p>
            <p className="mt-1 text-xs text-slate-600">Uses Chrome speech recognition, then adds captured text into the existing transcript box.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={!speech.isSupported || speech.isListening} onClick={speech.startListening} icon={<Mic className="h-4 w-4" aria-hidden="true" />}>
              Start voice notes
            </Button>
            <Button type="button" variant="secondary" disabled={!speech.isListening} onClick={speech.stopListening} icon={<MicOff className="h-4 w-4" aria-hidden="true" />}>
              Stop
            </Button>
            <Button type="button" disabled={!speech.transcript.trim() && !speech.interimTranscript.trim()} onClick={addVoiceTranscript} icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
              Add meeting transcript
            </Button>
            <Button type="button" variant="ghost" disabled={!speech.transcript.trim() && !speech.interimTranscript.trim()} onClick={speech.clearTranscript} icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}>
              Clear
            </Button>
          </div>
        </div>
        <div className="mt-3 min-h-14 rounded-md border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700">
          {speech.transcript || speech.interimTranscript ? (
            <>
              {speech.transcript}
              {speech.interimTranscript && <span className="text-slate-400"> {speech.interimTranscript}</span>}
            </>
          ) : (
            <span className="text-slate-400">
              {speech.isSupported ? "Captured voice notes will appear here." : "Chrome speech recognition is not available in this browser."}
            </span>
          )}
        </div>
        {speech.error && <p className="mt-2 text-xs text-red-600">{speech.error}</p>}
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
