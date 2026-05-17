"use client";

// StoreProvider lives in RootProviders (app/layout.tsx) so both the
// dashboard and public pages (e.g. /contact) share the same store.
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "@/lib/toast";
import ToastDisplay from "@/components/dashboard/ToastDisplay";
import Sidebar from "@/components/dashboard/Sidebar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import type { ReactNode } from "react";

// ─── Loading shell ─────────────────────────────────────────────────
// Shown while auth state is resolving — matches final layout so
// there's no layout shift when content appears.
// After 5 s of showing, displays a "refresh" prompt so the user is never
// left on a blank spinner with no escape.
function LoadingShell({ message = "Loading…" }: { message?: string }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStuck(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "oklch(0.94 0.010 78)" }}>
      {/* Sidebar placeholder keeps layout stable */}
      <div
        className="hidden lg:block w-60 flex-shrink-0 h-screen"
        style={{ background: "oklch(0.12 0.010 260)" }}
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block w-8 h-8 border-[3px] rounded-full animate-spin mb-3"
            style={{
              borderColor: "oklch(0.68 0.19 44 / 0.20)",
              borderTopColor: "oklch(0.68 0.19 44)",
            }}
          />
          <p className="text-sm font-medium" style={{ color: "oklch(0.55 0.05 260)" }}>{message}</p>
          {stuck && (
            <div className="mt-4">
              <p className="text-xs mb-2" style={{ color: "oklch(0.60 0.05 260)" }}>
                Taking longer than expected.
              </p>
              <a
                href="/dashboard/login"
                className="text-xs font-semibold underline"
                style={{ color: "oklch(0.68 0.19 44)" }}
              >
                Go to login →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Session timeout warning modal ────────────────────────────────
function TimeoutWarning({ secondsLeft, onStay, onLogout }: {
  secondsLeft: number;
  onStay: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border overflow-hidden"
        style={{ borderColor: "oklch(0.88 0.015 80)" }}
      >
        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, oklch(0.68 0.19 44), oklch(0.47 0.22 22))" }} />
        <div className="px-6 py-6 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "oklch(0.68 0.19 44 / 0.10)" }}
          >
            <span className="text-2xl">⏱️</span>
          </div>
          <h2 className="font-heading font-black text-xl text-foreground mb-1">Still there?</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Your session will expire due to inactivity.
            You&apos;ll be logged out in <span className="font-bold text-foreground">{secondsLeft}s</span>.
          </p>
          {/* Countdown bar */}
          <div className="h-1.5 w-full rounded-full mb-5 overflow-hidden" style={{ background: "oklch(0.93 0.015 80)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${(secondsLeft / 60) * 100}%`,
                background: secondsLeft > 20 ? "oklch(0.68 0.19 44)" : "oklch(0.47 0.22 22)",
              }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold border hover:bg-gray-50 transition-colors"
              style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.48 0.05 260)" }}
            >
              Sign out
            </button>
            <button
              onClick={onStay}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: "oklch(0.68 0.19 44)" }}
            >
              Stay signed in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Idle monitor ──────────────────────────────────────────────────
// Fires after `timeoutMs` ms of inactivity, then gives a 60-second grace
// period before auto-logout.
//
// Pass `disabled: true` when the timer must not run (unauthenticated or on
// the login page). Never pass Infinity — setTimeout(fn, Infinity) overflows
// the 32-bit timer and fires immediately.
function useIdleTimer(
  timeoutMs: number,
  onExpired: () => void,
  disabled: boolean,
) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  // Refs hold mutable timer handles — mutations don't trigger re-renders.
  const idleTimerRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const graceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Keep onExpired in a ref so it never needs to be a dependency of effects.
  const onExpiredRef  = useRef(onExpired);
  useEffect(() => { onExpiredRef.current = onExpired; }, [onExpired]);

  // showWarning in a ref so resetIdle can read it without a stale closure.
  const showWarningRef = useRef(false);
  useEffect(() => { showWarningRef.current = showWarning; }, [showWarning]);

  // ── Helpers (stable — no state/effect dependencies) ──────────────
  const stopIdle  = useCallback(() => {
    if (idleTimerRef.current)  { clearTimeout(idleTimerRef.current);   idleTimerRef.current  = null; }
  }, []);
  const stopGrace = useCallback(() => {
    if (graceTimerRef.current) { clearInterval(graceTimerRef.current); graceTimerRef.current = null; }
  }, []);

  // arm / re-arm the idle timer (pure side-effect, no state reads)
  const armIdle = useCallback((ms: number) => {
    stopIdle();
    idleTimerRef.current = setTimeout(() => {
      setSecondsLeft(60);
      setShowWarning(true);
      showWarningRef.current = true;
    }, ms);
  }, [stopIdle]);

  // ── Activity handler: resets the idle timer on any user gesture ──
  // Captured in a ref so the event-listener identity stays stable.
  const timeoutMsRef = useRef(timeoutMs);
  useEffect(() => { timeoutMsRef.current = timeoutMs; }, [timeoutMs]);

  const handleActivity = useRef(() => {
    if (showWarningRef.current) return; // grace period — user must click the modal
    armIdle(timeoutMsRef.current);
  });
  // Keep armIdle inside the stable ref
  useEffect(() => {
    handleActivity.current = () => {
      if (showWarningRef.current) return;
      armIdle(timeoutMsRef.current);
    };
  }, [armIdle]);
  // Stable wrapper so addEventListener/removeEventListener see the same fn reference
  const onActivity = useCallback(() => handleActivity.current(), []);

  // ── Main effect: register listeners and arm the first timer ──────
  useEffect(() => {
    if (disabled) {
      stopIdle();
      stopGrace();
      setShowWarning(false);
      showWarningRef.current = false;
      return;
    }
    const EVENTS = ["mousemove", "keydown", "pointerdown", "touchstart", "scroll"] as const;
    EVENTS.forEach(ev => window.addEventListener(ev, onActivity, { passive: true }));
    armIdle(timeoutMs);
    return () => {
      EVENTS.forEach(ev => window.removeEventListener(ev, onActivity));
      stopIdle();
      stopGrace();
    };
  }, [disabled, timeoutMs, armIdle, stopIdle, stopGrace, onActivity]);

  // ── Grace-period countdown tick ──────────────────────────────────
  useEffect(() => {
    if (!showWarning) { stopGrace(); return; }
    graceTimerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { stopGrace(); return 0; }
        return s - 1;
      });
    }, 1000);
    return stopGrace;
  }, [showWarning, stopGrace]);

  // ── Auto-logout when countdown hits zero ─────────────────────────
  useEffect(() => {
    if (showWarning && secondsLeft === 0) {
      setShowWarning(false);
      showWarningRef.current = false;
      onExpiredRef.current();
    }
  }, [showWarning, secondsLeft]);

  // ── "Stay signed in" handler ─────────────────────────────────────
  const dismiss = useCallback(() => {
    setShowWarning(false);
    showWarningRef.current = false;
    stopGrace();
    if (!disabled) armIdle(timeoutMsRef.current);
  }, [disabled, armIdle, stopGrace]);

  return { showWarning, secondsLeft, dismiss };
}

// ─── Auth guard ────────────────────────────────────────────────────
function AuthGuard({ children }: { children: ReactNode }) {
  const { currentUser, loading, logout } = useAuth();
  const { state } = useStore();
  const pathname    = usePathname();
  const router      = useRouter();
  const isLoginPage = pathname === "/dashboard/login";

  // Session timeout in ms, sourced from store setting
  const timeoutMs = (state.sessionTimeout ?? 30) * 60 * 1000;

  const handleExpired = useCallback(() => {
    logout();
    router.replace("/dashboard/login");
  }, [logout, router]);

  // Idle timer is only active when a user is authenticated and not on the login page.
  // Passing `disabled: true` is safe; passing Infinity to setTimeout would overflow.
  const timerDisabled = !currentUser || isLoginPage;
  const { showWarning, secondsLeft, dismiss } = useIdleTimer(
    timeoutMs,
    handleExpired,
    timerDisabled,
  );

  // Redirect to login when auth has resolved and there is no user.
  // Use a ref to ensure this fires at most once per mount — prevents any
  // double-fire that could happen if the effect deps change rapidly.
  const redirectedRef = useRef(false);
  useEffect(() => {
    if (!loading && !currentUser && !isLoginPage && !redirectedRef.current) {
      redirectedRef.current = true;
      router.replace("/dashboard/login");
    }
    // Reset the guard when we navigate back to an auth-required page
    // so the redirect can fire again if needed (e.g. after logout).
    if (isLoginPage) redirectedRef.current = false;
  }, [loading, currentUser, isLoginPage, router]);

  // Login page: render fullscreen with no sidebar, regardless of auth state
  if (isLoginPage) return <>{children}</>;

  // Auth still initialising — show stable skeleton so React doesn't unmount/remount
  if (loading) return <LoadingShell />;

  // Authenticated — full dashboard layout
  if (currentUser) {
    return (
      <>
        {showWarning && (
          <TimeoutWarning
            secondsLeft={secondsLeft}
            onStay={dismiss}
            onLogout={handleExpired}
          />
        )}
        <div className="flex h-screen overflow-hidden" style={{ background: "oklch(0.94 0.010 78)" }}>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Mobile-only top bar — gives room for the fixed hamburger button */}
            <div
              className="lg:hidden h-14 flex-shrink-0 flex items-center px-14 border-b bg-white"
              style={{ borderColor: "oklch(0.88 0.015 80)" }}
            >
              <span className="font-heading font-black text-lg tracking-tight text-foreground">
                YAA<span style={{ color: "oklch(0.68 0.19 44)" }}>.</span>
              </span>
              <span className="text-xs font-semibold text-muted-foreground ml-2">
                Dashboard
              </span>
            </div>
            <div className="flex-1 overflow-y-auto min-w-0">
              {children}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Not authenticated (redirect is firing in the effect)
  return <LoadingShell message="Redirecting…" />;
}

// ─── Root export ───────────────────────────────────────────────────
export default function DashboardProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthGuard>{children}</AuthGuard>
        <ToastDisplay />
      </ToastProvider>
    </AuthProvider>
  );
}
