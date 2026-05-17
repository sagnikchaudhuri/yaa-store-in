"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard, Package, MessageSquare,
  BarChart3, Bot, Menu, X, ExternalLink, Zap, Store, Shield, LogOut, PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useAuth, ROLE_LABELS, type Permission } from "@/lib/auth";

// ─── Nav definition (permission-gated) ───────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number | null;
  perm: Permission;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// ─── Sidebar content ──────────────────────────────────────────────
function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname           = usePathname();
  const router             = useRouter();
  const { state }          = useStore();
  const { currentUser, can, logout } = useAuth();

  // Live badges
  const openTickets = state.tickets.filter(t => t.status === "open").length;

  // Next drop countdown (only for admins who can see drops)
  const nextDrop = state.drops
    .filter(d => d.status === "scheduled")
    .sort((a, b) => {
      const ta = new Date(a.scheduledAt).getTime();
      const tb = new Date(b.scheduledAt).getTime();
      return (isNaN(ta) ? Infinity : ta) - (isNaN(tb) ? Infinity : tb);
    })[0];

  const daysUntilNext = nextDrop ? (() => {
    const t = new Date(nextDrop.scheduledAt).getTime();
    return isNaN(t) ? null : Math.max(0, Math.ceil((t - Date.now()) / 86_400_000));
  })() : null;

  const NAV_SECTIONS: NavSection[] = [
    {
      label: "Store",
      items: [
        { label: "Overview",  href: "/dashboard/overview",  icon: LayoutDashboard, badge: null,         perm: "view_dashboard" },
        { label: "Listings",  href: "/dashboard/listings",  icon: Package,         badge: null,         perm: "view_listings"  },
      ],
    },
    {
      label: "Operations",
      items: [
        { label: "Support",   href: "/dashboard/support",   icon: MessageSquare,   badge: openTickets || null, perm: "view_support" },
        { label: "Leads",     href: "/dashboard/leads",     icon: PhoneCall,       badge: null,                perm: "view_leads"   },
      ],
    },
    {
      label: "Insights",
      items: [
        { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3,       badge: null,         perm: "view_analytics" },
      ],
    },
    {
      label: "AI",
      items: [
        { label: "Anemone",   href: "/dashboard/anemone",   icon: Bot,             badge: null,         perm: "manage_anemone" },
      ],
    },
    {
      label: "Admin",
      items: [
        { label: "Security",  href: "/dashboard/security",  icon: Shield,          badge: null,         perm: "view_security"  },
      ],
    },
  ];

  function handleLogout() {
    logout();
    router.push("/dashboard/login");
  }

  const showCountdown = can("manage_drops") && nextDrop && daysUntilNext !== null;

  return (
    <div className="flex flex-col h-full" style={{ background: "oklch(0.12 0.010 260)" }}>
      {/* Brand header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.07)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-heading font-black text-white text-base flex-shrink-0 shadow-lg"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 48), oklch(0.50 0.22 22))", boxShadow: "0 4px 14px oklch(0.68 0.19 44 / 0.40)" }}
            >
              Y
            </div>
            <div>
              <p className="font-heading font-black text-white text-sm leading-none tracking-wide">YAA Store</p>
              <p className="text-[10px] mt-0.5 font-semibold tracking-widest uppercase" style={{ color: "oklch(0.68 0.19 44 / 0.65)" }}>Operations HQ</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/30 hover:text-white/80 transition-colors lg:hidden">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {NAV_SECTIONS.map((section) => {
          const visible = section.items.filter(item => can(item.perm));
          if (!visible.length) return null;
          return (
            <div key={section.label}>
              <p className="text-[9px] font-black uppercase tracking-[0.28em] px-3 mb-1.5" style={{ color: "oklch(1 0 0 / 0.18)" }}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {visible.map(({ label, href, icon: Icon, badge }) => {
                  const active = pathname?.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative",
                        active ? "text-white" : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                      )}
                      style={active ? { background: "linear-gradient(90deg, oklch(0.68 0.19 44 / 0.20), oklch(0.68 0.19 44 / 0.06))", boxShadow: "inset 3px 0 0 oklch(0.68 0.19 44)" } : {}}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 transition-colors" style={{ color: active ? "oklch(0.72 0.20 48)" : "inherit" }} />
                      <span className="flex-1 leading-none">{label}</span>
                      {badge !== null && badge !== undefined && (badge as number) > 0 && (
                        <span
                          className="text-[10px] font-black min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center"
                          style={{ background: "oklch(0.47 0.22 22)", color: "white", boxShadow: "0 1px 4px oklch(0.47 0.22 22 / 0.5)" }}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 flex-shrink-0 space-y-2.5" style={{ borderTop: "1px solid oklch(1 0 0 / 0.07)" }}>
        {/* Next drop countdown — only for admins with drop access */}
        {showCountdown && (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: "oklch(0.68 0.19 44 / 0.09)", border: "1px solid oklch(0.68 0.19 44 / 0.15)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.68 0.19 44 / 0.20)" }}>
              <Zap className="h-3.5 w-3.5" style={{ color: "oklch(0.80 0.18 50)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold leading-none truncate" style={{ color: "oklch(0.82 0.12 55)" }}>{nextDrop!.title}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "oklch(0.68 0.19 44 / 0.55)" }}>
                Drop in {daysUntilNext}d
              </p>
            </div>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: "oklch(0.80 0.18 50)" }} />
          </div>
        )}

        {/* Current user card */}
        {currentUser && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)" }}>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-heading font-black text-xs text-white flex-shrink-0"
              style={{ background: "oklch(0.68 0.19 44)" }}
            >
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold leading-none truncate text-white/80">{currentUser.name}</p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: "oklch(1 0 0 / 0.30)" }}>
                {ROLE_LABELS[currentUser.role]}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors text-white/25 hover:text-white/60 flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Store link */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all hover:bg-white/[0.05] group"
          style={{ color: "oklch(1 0 0 / 0.25)" }}
        >
          <Store className="h-3.5 w-3.5 group-hover:opacity-80" />
          <span className="group-hover:text-white/50 transition-colors">Back to Store</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </Link>
      </div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────
export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0 overflow-hidden">
        <NavContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white shadow-md border"
        style={{ borderColor: "oklch(0.88 0.015 80)" }}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4 text-foreground" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden shadow-2xl">
            <NavContent onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
