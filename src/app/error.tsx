"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "oklch(0.97 0.012 80)" }}>
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg"
          style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 48), oklch(0.50 0.22 22))" }}
        >
          💥
        </div>
        <h1 className="font-heading font-black text-2xl text-foreground mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          An unexpected error occurred. This has been logged and we&apos;ll look into it.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground mb-4 px-3 py-2 rounded-lg bg-white border" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: "oklch(0.68 0.19 44)" }}
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-bold border hover:bg-white transition-colors"
            style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.40 0.05 260)" }}
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
