"use client";

import { Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useAIStore } from "@/store/ai_store";

export function AISummaryPanel({ meetingId }: { meetingId: number }) {
  const { summary, loading, error, generateSummary } = useAIStore();

  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <Brain className="h-5 w-5 text-zoom-blue" aria-hidden="true" />
            AI meeting summary
          </h2>
          <p className="mt-1 text-sm text-slate-500">Generated recap, highlights, and decision context.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          onClick={() => void generateSummary(meetingId)}
          icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
        >
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-sm leading-6 text-slate-700">
          {summary?.generated_summary ??
            "AI summary will appear here after transcript processing. The backend is already wired for OpenAI-compatible providers and Groq."}
        </p>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
