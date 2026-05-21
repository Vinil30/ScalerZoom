"use client";

import { X } from "lucide-react";
import { useToastStore } from "@/store/toast_store";

const toastClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
};

export function ToastViewport() {
  const { toasts, dismissToast } = useToastStore();

  return (
    <div className="fixed right-4 top-20 z-50 flex w-[min(380px,calc(100vw-32px))] flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className={`rounded-lg border p-4 shadow-soft ${toastClasses[toast.kind]}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && <p className="mt-1 text-sm opacity-80">{toast.description}</p>}
            </div>
            <button className="rounded-md p-1 hover:bg-white/60" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
