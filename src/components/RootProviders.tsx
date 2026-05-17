"use client";

import { useEffect } from "react";
import { StoreProvider, useStore } from "@/lib/store";
import type { ReactNode } from "react";

// localStorage key shared with AnemoneWidget and OverviewPage
const ANEMONE_LS_KEY = "yaa_dashboard_anemone_enabled";

// Runs inside StoreProvider so it can dispatch.
// Reads the persisted toggle on first client mount and applies it to the store.
// This ensures the widget is already hidden on page load when it was previously disabled.
function AnemoneInit() {
  const { dispatch } = useStore();
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ANEMONE_LS_KEY);
      // Only override if explicitly disabled — default (null or "true") keeps it enabled
      if (stored === "false") {
        dispatch({ type: "ANEMONE_UPDATE", payload: { enabled: false } });
      }
    } catch { /* localStorage unavailable — ignore */ }
  }, [dispatch]);
  return null;
}

// Wraps the entire app so both public pages (e.g. /contact) and the
// dashboard share one store instance. Replace StoreProvider with a
// server-fetched initialState from Supabase/API when ready.
export default function RootProviders({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AnemoneInit />
      {children}
    </StoreProvider>
  );
}
