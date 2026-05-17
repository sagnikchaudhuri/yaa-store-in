"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title, message, confirmLabel = "Confirm", danger = false,
  onConfirm, onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border overflow-hidden"
        style={{ borderColor: "oklch(0.88 0.015 80)" }}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: danger
                  ? "oklch(0.47 0.22 22 / 0.10)"
                  : "oklch(0.68 0.19 44 / 0.10)",
              }}
            >
              <AlertTriangle
                className="h-5 w-5"
                style={{ color: danger ? "oklch(0.47 0.22 22)" : "oklch(0.68 0.19 44)" }}
              />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-semibold border hover:bg-gray-50 transition-colors"
              style={{ borderColor: "oklch(0.88 0.015 80)" }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{
                background: danger ? "oklch(0.47 0.22 22)" : "oklch(0.68 0.19 44)",
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
