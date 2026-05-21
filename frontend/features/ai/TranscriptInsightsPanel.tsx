"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAIStore } from "@/store/ai_store";

export function TranscriptInsightsPanel() {
  const { transcripts } = useAIStore();
  const [query, setQuery] = useState("");
  const snippets = useMemo(() => {
    const text = transcripts.map((item) => item.transcript_text).join(" ");
    const chunks = text.match(/[^.]+[.]/g) ?? [];
    return chunks
      .filter((chunk) => chunk.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4);
  }, [query, transcripts]);

  return (
    <section className="panel p-5">
      <h2 className="text-base font-semibold text-slate-950">Transcript insights</h2>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          className="field pl-9"
          placeholder="Search discussion highlights"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="mt-4 space-y-3">
        {snippets.length > 0 ? (
          snippets.map((snippet) => (
            <p key={snippet} className="rounded-lg border border-zoom-line bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {snippet.trim()}
            </p>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            Transcript snippets will appear after a transcript is available for this meeting.
          </p>
        )}
      </div>
    </section>
  );
}
