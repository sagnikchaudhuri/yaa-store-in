"use client";

import React, { createContext, useContext, useReducer, useState, useEffect } from "react";
import {
  DASHBOARD_PRODUCTS, DASHBOARD_DROPS, DASHBOARD_TICKETS, SEED_CATEGORIES,
  type DashboardProduct, type DashboardDrop, type DashboardTicket,
  type ProductStatus, type DropStatus, type TicketStatus, type AnemoneMode,
  type Category,
} from "@/lib/dashboard-data";

export type { Category };

// ─── Extended types ───────────────────────────────────────────────

export type AdminRole = "super-admin" | "admin" | "support" | "content";

export interface Franchise {
  id: string;
  name: string;
  emoji: string;
  color: string;
  active: boolean;
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "inactive";
  joinedAt: string;
  lastSeen: string;
  avatar: string;
}

export interface TicketReply {
  id: string;
  text: string;
  author: "admin" | "customer";
  authorName: string;
  time: string;
}

export interface LogEntry {
  id: string;
  action: string;
  details: string;
  time: string;
  severity: "info" | "warning" | "critical";
}

export interface AnemoneSettings {
  mode: AnemoneMode;
  enabled: boolean;
  engagementMode: "auto" | "manual" | "drops-only";
  mascotMood: "energetic" | "calm" | "festive";
  announcementStyle: "banner" | "bubble" | "minimal";
  showOnAllPages: boolean;
  autoOpenOnDrops: boolean;
  idleNotifications: boolean;
  mobileVisibility: boolean;
  activePresetText: string;
}

// ─── Lead / contact tracking ──────────────────────────────────────

export type LeadSource = "drops-signup" | "contact-form" | "hero" | "collections";

export interface Lead {
  id: string;
  phone: string;
  name?: string;
  source: LeadSource;
  /** Human-readable label for the page/section that captured the lead */
  section: string;
  franchise?: string;
  timestamp: string;
}

// ─── Product localStorage persistence ────────────────────────────
// Products are the only slice that needs cross-refresh persistence.
// Pattern mirrors auth.tsx: always start from static seed (safe for SSR/hydration),
// then load from localStorage in useEffect after first client paint.

const PRODUCTS_STORAGE_KEY = "yaa_store_products_v1";

function loadProducts(): DashboardProduct[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    // Basic structural validation — id and status must be strings
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      typeof (parsed[0] as Record<string, unknown>)?.id !== "string" ||
      typeof (parsed[0] as Record<string, unknown>)?.status !== "string"
    ) return null;
    return parsed as DashboardProduct[];
  } catch {
    return null; // corrupt JSON or storage unavailable
  }
}

function saveProducts(products: DashboardProduct[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Private mode / storage full — silently swallow
  }
}

// ─── Seed data ────────────────────────────────────────────────────

const SEED_FRANCHISES: Franchise[] = [
  { id: "f1", name: "Naruto",          emoji: "🍃", color: "oklch(0.72 0.16 130)", active: true },
  { id: "f2", name: "One Piece",        emoji: "⚡", color: "oklch(0.68 0.19 44)",  active: true },
  { id: "f3", name: "Jujutsu Kaisen",   emoji: "🔵", color: "oklch(0.55 0.22 280)", active: true },
  { id: "f4", name: "Demon Slayer",     emoji: "🌸", color: "oklch(0.62 0.20 20)",  active: true },
  { id: "f5", name: "Bleach",           emoji: "⚔️", color: "oklch(0.58 0.18 240)", active: true },
  { id: "f6", name: "Studio Ghibli",    emoji: "🌿", color: "oklch(0.64 0.14 160)", active: true },
  { id: "f7", name: "Chainsaw Man",     emoji: "🔪", color: "oklch(0.62 0.20 22)",  active: true },
  { id: "f8", name: "Attack on Titan",  emoji: "⚙️", color: "oklch(0.55 0.06 260)", active: true },
  { id: "f9", name: "Original / YAA",   emoji: "🎌", color: "oklch(0.68 0.19 44)",  active: true },
];

const SEED_ADMINS: AdminMember[] = [
  { id: "a1", name: "Yusuf A.",   email: "yusuf@yaa-store.com",   role: "admin",       status: "active",   joinedAt: "Jan 2024", lastSeen: "Just now",  avatar: "Y" },
  { id: "a2", name: "Aisha K.",   email: "aisha@yaa-store.com",   role: "admin",       status: "active",   joinedAt: "Mar 2024", lastSeen: "2h ago",    avatar: "A" },
  { id: "a3", name: "Rahul M.",   email: "rahul@yaa-store.com",   role: "content",     status: "active",   joinedAt: "Apr 2024", lastSeen: "Yesterday", avatar: "R" },
  { id: "a4", name: "Sara J.",    email: "sara@yaa-store.com",    role: "support",     status: "active",   joinedAt: "Jun 2024", lastSeen: "3h ago",    avatar: "S" },
  { id: "a5", name: "Demi O.",    email: "demi@yaa-store.com",    role: "support",     status: "inactive", joinedAt: "Aug 2024", lastSeen: "5d ago",    avatar: "D" },
];

const SEED_ANEMONE: AnemoneSettings = {
  mode: "casual",
  enabled: true,
  engagementMode: "auto",
  mascotMood: "energetic",
  announcementStyle: "bubble",
  showOnAllPages: true,
  autoOpenOnDrops: false,
  idleNotifications: true,
  mobileVisibility: true,
  activePresetText: "",
};

const SEED_LOG: LogEntry[] = [
  { id: "l1", action: "Product listed",     details: "Gojo Satoru Figure set to Listed",           time: "2m ago",   severity: "info"     },
  { id: "l2", action: "Drop scheduled",     details: "Gear 5 Luffy Figure drop confirmed",          time: "14m ago",  severity: "info"     },
  { id: "l3", action: "Ticket resolved",    details: "TKT-004 marked resolved by Admin",            time: "1h ago",   severity: "info"     },
  { id: "l4", action: "Anemone mode",       details: "Mode changed: calm → hype",                   time: "3h ago",   severity: "info"     },
  { id: "l5", action: "Product deleted",    details: "Sasuke Figure (p99) removed from store",      time: "1d ago",   severity: "warning"  },
  { id: "l6", action: "Admin added",        details: "Demi O. invited as Support Staff",            time: "2d ago",   severity: "info"     },
  { id: "l7", action: "Drop deleted",       details: "Test drop draft removed",                     time: "3d ago",   severity: "warning"  },
  { id: "l8", action: "Role changed",       details: "Rahul M. promoted from Support → Content",   time: "5d ago",   severity: "info"     },
];

const SEED_LEADS: Lead[] = [
  { id: "ld1", phone: "+44 7900 123 456", source: "drops-signup",  section: "Homepage — Early Access",       franchise: "One Piece",        timestamp: "2h ago"  },
  { id: "ld2", phone: "+44 7911 234 567", source: "contact-form",  section: "Contact Page",                  franchise: "Jujutsu Kaisen",   timestamp: "5h ago", name: "Kira M."  },
  { id: "ld3", phone: "+44 7922 345 678", source: "drops-signup",  section: "Homepage — Early Access",       franchise: "Naruto",           timestamp: "1d ago"  },
  { id: "ld4", phone: "+44 7933 456 789", source: "contact-form",  section: "Contact Page",                  franchise: "Demon Slayer",     timestamp: "1d ago", name: "Ryuu K."  },
  { id: "ld5", phone: "+44 7944 567 890", source: "drops-signup",  section: "Collections — Special Drops",                                  timestamp: "2d ago"  },
  { id: "ld6", phone: "+44 7955 678 901", source: "contact-form",  section: "Contact Page",                  franchise: "Bleach",           timestamp: "3d ago", name: "Nova X."  },
  { id: "ld7", phone: "+44 7966 789 012", source: "drops-signup",  section: "Homepage — Early Access",       franchise: "Studio Ghibli",    timestamp: "4d ago"  },
  { id: "ld8", phone: "+44 7977 890 123", source: "contact-form",  section: "Contact Page",                  franchise: "Attack on Titan",  timestamp: "5d ago", name: "Suki T."  },
];

// ─── Store state ──────────────────────────────────────────────────

export interface StoreState {
  products:      DashboardProduct[];
  drops:         DashboardDrop[];
  tickets:       DashboardTicket[];
  ticketReplies: Record<string, TicketReply[]>;
  franchises:    Franchise[];
  categories:    Category[];
  admins:        AdminMember[];
  anemone:       AnemoneSettings;
  sessionTimeout: number; // minutes
  activityLog:   LogEntry[];
  leads:         Lead[];
}

// ─── Actions ──────────────────────────────────────────────────────

export type StoreAction =
  // Products
  | { type: "PRODUCTS_HYDRATE";          payload: DashboardProduct[] }
  | { type: "PRODUCT_CREATE";            payload: DashboardProduct }
  | { type: "PRODUCT_UPDATE";            payload: { id: string; updates: Partial<DashboardProduct> } }
  | { type: "PRODUCT_DELETE";            payload: string }
  | { type: "PRODUCT_TOGGLE_VISIBILITY"; payload: string }
  // Drops
  | { type: "DROP_CREATE";               payload: DashboardDrop }
  | { type: "DROP_UPDATE";               payload: { id: string; updates: Partial<DashboardDrop> } }
  | { type: "DROP_DELETE";               payload: string }
  // Tickets
  | { type: "TICKET_CREATE";             payload: DashboardTicket }
  | { type: "TICKET_UPDATE_STATUS";      payload: { id: string; status: TicketStatus } }
  | { type: "TICKET_TOGGLE_ESCALATE";    payload: string }
  | { type: "TICKET_ADD_REPLY";          payload: { ticketId: string; reply: TicketReply } }
  // Franchises
  | { type: "FRANCHISE_CREATE";          payload: Franchise }
  | { type: "FRANCHISE_UPDATE";          payload: { id: string; updates: Partial<Franchise> } }
  | { type: "FRANCHISE_DELETE";          payload: string }
  // Categories
  | { type: "CATEGORY_CREATE";           payload: Category }
  | { type: "CATEGORY_UPDATE";           payload: { id: string; updates: Partial<Category> } }
  | { type: "CATEGORY_DELETE";           payload: string }
  // Admins
  | { type: "ADMIN_UPDATE_ROLE";         payload: { id: string; role: AdminRole } }
  | { type: "ADMIN_UPDATE_STATUS";       payload: { id: string; status: "active" | "inactive" } }
  | { type: "ADMIN_CREATE";              payload: AdminMember }
  | { type: "ADMIN_DELETE";              payload: string }
  // Anemone
  | { type: "ANEMONE_UPDATE";            payload: Partial<AnemoneSettings> }
  // Settings
  | { type: "SESSION_TIMEOUT_SET";       payload: number }
  // Log
  | { type: "LOG_ADD";                   payload: Omit<LogEntry, "id"> }
  // Leads
  | { type: "LEAD_ADD";                  payload: Lead };

// ─── Reducer ──────────────────────────────────────────────────────

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {

    // ── Products ─────────────────────────────────────────────────
    case "PRODUCTS_HYDRATE":
      // Wholesale replace the products array from localStorage.
      // Only fired once on first client mount.
      return { ...state, products: action.payload };

    case "PRODUCT_CREATE":
      return { ...state, products: [action.payload, ...state.products] };

    case "PRODUCT_UPDATE":
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };

    case "PRODUCT_DELETE":
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };

    case "PRODUCT_TOGGLE_VISIBILITY":
      return {
        ...state,
        products: state.products.map(p => {
          if (p.id !== action.payload) return p;
          const newStatus: ProductStatus = p.status === "listed" ? "unlisted" : "listed";
          return { ...p, status: newStatus };
        }),
      };

    // ── Drops ─────────────────────────────────────────────────────
    case "DROP_CREATE":
      return { ...state, drops: [action.payload, ...state.drops] };

    case "DROP_UPDATE":
      return {
        ...state,
        drops: state.drops.map(d =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
        ),
      };

    case "DROP_DELETE":
      return { ...state, drops: state.drops.filter(d => d.id !== action.payload) };

    // ── Tickets ───────────────────────────────────────────────────
    case "TICKET_CREATE":
      return { ...state, tickets: [action.payload, ...state.tickets] };

    case "TICKET_UPDATE_STATUS":
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.id ? { ...t, status: action.payload.status } : t
        ),
      };

    case "TICKET_TOGGLE_ESCALATE":
      return {
        ...state,
        tickets: state.tickets.map(t => {
          if (t.id !== action.payload) return t;
          const escalating = !t.escalated;
          return {
            ...t,
            escalated: escalating,
            priority: escalating ? "high" : (t.priority === "high" ? "medium" : t.priority),
          };
        }),
      };

    case "TICKET_ADD_REPLY": {
      const existing = state.ticketReplies[action.payload.ticketId] ?? [];
      return {
        ...state,
        ticketReplies: {
          ...state.ticketReplies,
          [action.payload.ticketId]: [...existing, action.payload.reply],
        },
      };
    }

    // ── Franchises ────────────────────────────────────────────────
    case "FRANCHISE_CREATE":
      return { ...state, franchises: [...state.franchises, action.payload] };

    case "FRANCHISE_UPDATE":
      return {
        ...state,
        franchises: state.franchises.map(f =>
          f.id === action.payload.id ? { ...f, ...action.payload.updates } : f
        ),
      };

    case "FRANCHISE_DELETE":
      return { ...state, franchises: state.franchises.filter(f => f.id !== action.payload) };

    // ── Categories ────────────────────────────────────────────────
    case "CATEGORY_CREATE":
      return { ...state, categories: [...state.categories, action.payload] };

    case "CATEGORY_UPDATE":
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };

    case "CATEGORY_DELETE":
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };

    // ── Admins ────────────────────────────────────────────────────
    case "ADMIN_CREATE":
      return { ...state, admins: [...state.admins, action.payload] };

    case "ADMIN_UPDATE_ROLE":
      return {
        ...state,
        admins: state.admins.map(a =>
          a.id === action.payload.id ? { ...a, role: action.payload.role } : a
        ),
      };

    case "ADMIN_UPDATE_STATUS":
      return {
        ...state,
        admins: state.admins.map(a =>
          a.id === action.payload.id ? { ...a, status: action.payload.status } : a
        ),
      };

    case "ADMIN_DELETE":
      return { ...state, admins: state.admins.filter(a => a.id !== action.payload) };

    // ── Anemone ───────────────────────────────────────────────────
    case "ANEMONE_UPDATE":
      return { ...state, anemone: { ...state.anemone, ...action.payload } };

    // ── Settings ──────────────────────────────────────────────────
    case "SESSION_TIMEOUT_SET":
      return { ...state, sessionTimeout: action.payload };

    // ── Log ───────────────────────────────────────────────────────
    case "LOG_ADD": {
      const entry: LogEntry = { ...action.payload, id: `l${Date.now()}` };
      return { ...state, activityLog: [entry, ...state.activityLog].slice(0, 50) };
    }

    // ── Leads ─────────────────────────────────────────────────────
    case "LEAD_ADD": {
      // Deduplicate by phone — skip if phone already captured
      const already = state.leads.some(l => l.phone === action.payload.phone);
      if (already) return state;
      return { ...state, leads: [action.payload, ...state.leads] };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────

const INITIAL_STATE: StoreState = {
  products:       DASHBOARD_PRODUCTS,
  drops:          DASHBOARD_DROPS,
  tickets:        DASHBOARD_TICKETS,
  ticketReplies:  {},
  franchises:     SEED_FRANCHISES,
  categories:     SEED_CATEGORIES,
  admins:         SEED_ADMINS,
  anemone:        SEED_ANEMONE,
  sessionTimeout: 60,
  activityLog:    SEED_LOG,
  leads:          SEED_LEADS,
};

interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  /**
   * False during the brief initial render before localStorage is read.
   * Consumers (e.g. collections page) can gate the product grid on this
   * to avoid a flash of the wrong visibility state.
   */
  hydrated: boolean;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Phase 1 — on first client mount, restore persisted product state.
  // We intentionally do NOT use localStorage in the initial state value so
  // that the server-rendered HTML always matches the first client paint
  // (no React hydration mismatch). The correction happens in this effect.
  useEffect(() => {
    const saved = loadProducts();
    if (saved) {
      dispatch({ type: "PRODUCTS_HYDRATE", payload: saved });
    }
    setHydrated(true);
  }, []); // run once — empty deps is intentional

  // Phase 2 — persist products whenever they change, but only after Phase 1
  // completes so we never write the un-hydrated INITIAL_STATE back over saved data.
  useEffect(() => {
    if (!hydrated) return;
    saveProducts(state.products);
  }, [state.products, hydrated]);

  return (
    <StoreContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// ─── Derived selectors ────────────────────────────────────────────

export function useProducts()    { const { state } = useStore(); return state.products;    }
export function useDrops()       { const { state } = useStore(); return state.drops;       }
export function useTickets()     { const { state } = useStore(); return state.tickets;      }
export function useFranchises()  { const { state } = useStore(); return state.franchises;  }
export function useCategories()  { const { state } = useStore(); return state.categories;  }
export function useLeads()       { const { state } = useStore(); return state.leads;        }
