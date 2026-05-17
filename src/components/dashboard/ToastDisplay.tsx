"use client";

import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/lib/toast";

const VARIANT_CONFIG = {
  success: {
    bg: "oklch(0.64 0.14 160)",
    icon: CheckCircle,
  },
  error: {
    bg: "oklch(0.47 0.22 22)",
    icon: AlertCircle,
  },
  warning: {
    bg: "oklch(0.68 0.19 44)",
    icon: AlertTriangle,
  },
  info: {
    bg: "oklch(0.55 0.22 280)",
    icon: Info,
  },
};

export default function ToastDisplay() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const cfg  = VARIANT_CONFIG[t.variant];
        const Icon = cfg.icon;
        return (
          <div
            key={t.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-white text-sm font-semibold pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-xs"
            style={{ background: cfg.bg }}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-1 opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
