"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { useAIStore } from "@/store/ai_store";

const priorityColor = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700",
};

export function AIActionItemsPanel({ meetingId }: { meetingId: number }) {
  const { actionItems, processing, generateActionItems } = useAIStore();

  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          AI action items
        </h2>
        <Button
          type="button"
          variant="secondary"
          disabled={processing}
          onClick={() => void generateActionItems(meetingId)}
          icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
        >
          Extract
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {actionItems.length > 0 ? actionItems.map((item) => (
          <div key={item.id} className="rounded-lg border border-zoom-line bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-800">{item.action_text}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${priorityColor[item.priority]}`}>
                {item.priority}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {item.assigned_to ?? "Unassigned"} | {item.status.replace("_", " ")}
            </p>
          </div>
        )) : (
          <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
            Action items will appear after transcript processing.
          </p>
        )}
      </div>
    </section>
  );
}
