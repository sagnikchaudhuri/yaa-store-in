"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#faf8f5", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h1 style={{ fontWeight: 900, fontSize: "20px", marginBottom: "8px", color: "#1a1a2e" }}>
            Critical error
          </h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
            The application encountered a critical error. Please try refreshing.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              borderRadius: "12px",
              border: "none",
              background: "oklch(0.68 0.19 44)",
              color: "white",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
