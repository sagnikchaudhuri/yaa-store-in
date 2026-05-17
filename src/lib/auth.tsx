"use client";

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo,
} from "react";
import type { AdminRole, AdminMember } from "@/lib/store";

// ─── Permissions ───────────────────────────────────────────────────

export type Permission =
  | "view_dashboard"
  | "view_listings"
  | "edit_listings"
  | "delete_listings"
  | "manage_drops"
  | "view_support"
  | "manage_support"
  | "view_analytics"
  | "manage_anemone"
  | "manage_admins"
  | "view_security"
  | "manage_categories"
  | "manage_franchises"
  | "view_leads";

const ALL_PERMS: Permission[] = [
  "view_dashboard", "view_listings", "edit_listings", "delete_listings",
  "manage_drops", "view_support", "manage_support", "view_analytics",
  "manage_anemone", "manage_admins", "view_security",
  "manage_categories", "manage_franchises", "view_leads",
];

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  "super-admin": ALL_PERMS,
  "admin":       ALL_PERMS.filter(p => p !== "manage_admins"),
  "support":     ["view_dashboard", "view_support", "manage_support", "view_leads"],
  "content":     ["view_dashboard", "view_listings", "edit_listings", "manage_categories", "manage_franchises"],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  "super-admin": "Super Admin",
  "admin":       "Admin",
  "support":     "Support Staff",
  "content":     "Content Manager",
};

// ─── Role hierarchy ────────────────────────────────────────────────
// Higher number = higher authority. Used to enforce who can manage whom.

export const ROLE_HIERARCHY: Record<AdminRole, number> = {
  "super-admin": 4,
  "admin":       3,
  "support":     2,
  "content":     1,
};

// ─── Hidden Super Admin ───────────────────────────────────────────
// Credentials are verified server-side via POST /api/auth/super-admin.
// DEMO_SUPER_ADMIN_EMAIL and DEMO_SUPER_ADMIN_PASSWORD live in .env.local
// (gitignored) and are never exposed to the browser bundle.
// Only the sanitised user object (no password) is returned on success.

// ─── Context ───────────────────────────────────────────────────────

interface AuthContextValue {
  currentUser: AdminMember | null;
  /**
   * True only during the brief initial client mount while sessionStorage
   * is being read.  Always resolves to false within milliseconds.
   * A 3-second hard timeout guarantees it never stays true forever.
   */
  loading: boolean;
  /**
   * Async — Super Admin credentials are checked via the server-side API
   * route so the password never travels through the client bundle.
   * Demo accounts still accept any non-empty password (MVP behaviour).
   */
  login: (email: string, password: string, admins: AdminMember[]) => Promise<boolean>;
  logout: () => void;
  can: (perm: Permission) => boolean;
  /**
   * Returns true if the current user has authority over the given target role.
   * Super Admin > Admin > Support = Content.
   * Used to gate edit/remove controls in the Security page.
   */
  canManageRole: (targetRole: AdminRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = "yaa_dashboard_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Always start as null/loading so the server-rendered HTML matches the
  // initial client render (no hydration mismatch).
  const [currentUser, setCurrentUser] = useState<AdminMember | null>(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    // Hard safety timeout — if anything prevents the storage read from
    // completing (strict-mode remount, hydration error, private browsing
    // quirks), this guarantees loading resolves within 3 seconds.
    const safety = setTimeout(() => setLoading(false), 3000);

    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AdminMember;
        // Basic sanity check — make sure it looks like a valid session
        if (parsed && parsed.id && parsed.email && parsed.role) {
          setCurrentUser(parsed);
        }
      }
    } catch {
      // sessionStorage unavailable or corrupt — treat as fresh session
    } finally {
      clearTimeout(safety);
      setLoading(false);
    }
  }, []);

  // ── Stable function references ─────────────────────────────────
  // Wrapped in useCallback so consumers (e.g. handleExpired in AuthGuard)
  // don't get new references on every render, preventing unnecessary
  // re-renders and useEffect re-runs down the tree.

  const login = useCallback(async (email: string, password: string, admins: AdminMember[]): Promise<boolean> => {
    const normalized = email.toLowerCase().trim();

    // ── Path 1: Hidden Super Admin (server-side check) ───────────
    // POST to the API route which reads DEMO_SUPER_ADMIN_EMAIL and
    // DEMO_SUPER_ADMIN_PASSWORD from process.env (server-only).
    // The password is never sent back to the client.
    try {
      const res = await fetch("/api/auth/super-admin", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: normalized, password }),
      });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; user?: AdminMember };
        if (data.ok && data.user) {
          setCurrentUser(data.user);
          try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data.user)); } catch { /* private mode */ }
          return true;
        }
      }
    } catch {
      // Network error or API unavailable — fall through to demo accounts.
    }

    // ── Path 2: Demo accounts ────────────────────────────────────
    // Email match only; any non-empty password is accepted (MVP demo).
    // Super-admin accounts in the admins list are excluded here so they
    // cannot be accessed through the demo path.
    const found = admins.find(
      a => a.email.toLowerCase() === normalized &&
           a.status === "active" &&
           a.role !== "super-admin"
    );
    if (!found) return false;
    setCurrentUser(found);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(found)); } catch { /* private mode */ }
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }, []);

  const can = useCallback((perm: Permission): boolean => {
    if (!currentUser) return false;
    return ROLE_PERMISSIONS[currentUser.role]?.includes(perm) ?? false;
  }, [currentUser]);

  const canManageRole = useCallback((targetRole: AdminRole): boolean => {
    if (!currentUser) return false;
    const myLevel     = ROLE_HIERARCHY[currentUser.role] ?? 0;
    const targetLevel = ROLE_HIERARCHY[targetRole]       ?? 0;
    return myLevel > targetLevel;
  }, [currentUser]);

  // Memoize the context value so consumers only re-render when currentUser
  // or loading actually changes, not on every AuthProvider render.
  const value = useMemo<AuthContextValue>(
    () => ({ currentUser, loading, login, logout, can, canManageRole }),
    [currentUser, loading, login, logout, can, canManageRole],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
