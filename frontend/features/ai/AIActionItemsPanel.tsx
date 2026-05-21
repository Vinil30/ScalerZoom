"use client";

import { CheckCircle2 } from "lucide-react";
import { useAIStore } from "@/store/ai_store";

const priorityColor = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-red-50 text-red-700",
};

export function AIActionItemsPanel() {
  const { actionItems } = useAIStore();

  return (
    <section className="panel p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
        <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
        AI action items
      </h2>
      <div className="mt-4 space-y-3">
        {actionItems.map((item) => (
          <div key={item.id} className="rounded-lg border border-zoom-line bg-white p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-800">{item.action_text}</p>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${priorityColor[item.priority]}`}>
                {item.priority}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {item.assigned_to ?? "Unassigned"} · {item.status.replace("_", " ")}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
