"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import { useStore } from "@/lib/store";
import type { AdminRole } from "@/lib/store";

const ROLE_COLOR: Record<AdminRole, string> = {
  "super-admin": "oklch(0.47 0.22 22)",
  "admin":       "oklch(0.68 0.19 44)",
  "support":     "oklch(0.55 0.22 280)",
  "content":     "oklch(0.64 0.14 160)",
};
const ROLE_BG: Record<AdminRole, string> = {
  "super-admin": "oklch(0.47 0.22 22 / 0.10)",
  "admin":       "oklch(0.68 0.19 44 / 0.10)",
  "support":     "oklch(0.55 0.22 280 / 0.10)",
  "content":     "oklch(0.64 0.14 160 / 0.10)",
};

export default function LoginPage() {
  const router  = useRouter();
  const { login, currentUser, loading: authLoading } = useAuth();
  const { state }              = useStore();
  const admins                 = state.admins;

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // If already authenticated (e.g. page refresh while logged in), redirect to overview
  useEffect(() => {
    if (!authLoading && currentUser) router.replace("/dashboard/overview");
  }, [authLoading, currentUser, router]);

  function handleQuickSelect(email: string) {
    setEmail(email);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 350)); // brief UX delay

    const ok = login(email, password, admins);
    setLoading(false);

    if (!ok) {
      setError("Invalid credentials. Check your email and password, or select a demo account below.");
    } else {
      router.push("/dashboard/overview");
    }
  }

  // Super-admin accounts are never shown in the demo selector.
  // The real admin logs in via the form with credentials from .env.local.
  const demoAdmins = admins.filter(a => a.status === "active" && a.role !== "super-admin");

  // Do not return null while authLoading — that causes a persistent blank
  // screen if the effect is slow.  The useEffect above handles the redirect
  // once auth resolves; rendering the form in the meantime is safe because
  // any submit attempt while authLoading is true is effectively a no-op
  // (admins list may be empty until the store hydrates, preventing login).

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "oklch(0.10 0.012 260)" }}
    >
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex w-14 h-14 rounded-2xl items-center justify-center font-heading font-black text-white text-2xl shadow-xl mb-4"
            style={{
              background: "linear-gradient(135deg, oklch(0.72 0.20 48), oklch(0.50 0.22 22))",
              boxShadow: "0 8px 32px oklch(0.68 0.19 44 / 0.40)",
            }}
          >
            Y
          </div>
          <h1 className="font-heading font-black text-2xl text-white tracking-tight">
            YAA Store<span style={{ color: "oklch(0.68 0.19 44)" }}>.</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Operations Dashboard</p>
        </div>

        <div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 24px 80px oklch(0 0 0 / 0.50)" }}
        >
          {/* Notice bar */}
          <div
            className="px-6 py-3 flex items-center gap-2.5 text-xs font-semibold"
            style={{ background: "oklch(0.68 0.19 44 / 0.08)", borderBottom: "1px solid oklch(0.68 0.19 44 / 0.14)" }}
          >
            <span style={{ color: "oklch(0.68 0.19 44)" }}>⚡</span>
            <span style={{ color: "oklch(0.52 0.20 38)" }}>
              Operations dashboard · Enter your credentials to sign in
            </span>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Demo account tiles */}
            <div>
              <div className="flex items-baseline justify-between mb-2.5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                  Demo Accounts
                </p>
                <p className="text-[10px] text-muted-foreground/60">any password</p>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {demoAdmins.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleQuickSelect(a.email)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 text-left transition-all hover:shadow-sm"
                    style={{
                      borderColor: email === a.email ? ROLE_COLOR[a.role] : "oklch(0.90 0.015 80)",
                      background:  email === a.email ? ROLE_BG[a.role]   : "transparent",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-heading font-black text-sm text-white flex-shrink-0"
                      style={{ background: ROLE_COLOR[a.role] }}
                    >
                      {a.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{a.email}</p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                      style={{ background: ROLE_BG[a.role], color: ROLE_COLOR[a.role] }}
                    >
                      {ROLE_LABELS[a.role]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="admin@yaa-store.com"
                  className="w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ borderColor: error ? "oklch(0.47 0.22 22)" : "oklch(0.88 0.015 80)" }}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full border rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    style={{ borderColor: "oklch(0.88 0.015 80)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-xs text-red-600 font-medium p-3 rounded-xl bg-red-50">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!email.trim() || loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
                style={{ background: "oklch(0.68 0.19 44)" }}
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-5">
          YAA Store Operations · Internal use only
        </p>
      </div>
    </div>
  );
}
