"use client";

import {
  TrendingUp, TrendingDown, Users, ShoppingBag, MessageSquare,
  ArrowRight, ShoppingCart, UserPlus, Headphones, RefreshCw, Package,
  ToggleLeft, ToggleRight, Bot,
} from "lucide-react";
import Link from "next/link";
import {
  OVERVIEW_STATS, FRANCHISE_STATS, ACTIVITY_FEED,
  REVENUE_CHART, WEEKLY_ORDERS,
} from "@/lib/dashboard-data";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";

// Shared key with RootProviders (AnemoneInit) and AnemoneWidget
const ANEMONE_LS_KEY = "yaa_dashboard_anemone_enabled";

// ─── Sparkline ────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max   = Math.max(...data);
  const min   = Math.min(...data);
  const range = max - min || 1;
  const w = 80; const h = 28;
  const step  = w / (data.length - 1);
  const pts   = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 6) - 3}`).join(" ");
  const lastX = (data.length - 1) * step;
  const lastY = h - ((data[data.length - 1] - min) / range) * (h - 6) - 3;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible flex-shrink-0">
      <defs>
        <linearGradient id={`sg-${color.slice(-4)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${lastX},${h}`} fill={`url(#sg-${color.slice(-4)})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
}

// ─── Stat card ────────────────────────────────────────────────────
function StatCard({ label, value, sub, trend, icon: Icon, accent, chartData }: {
  label: string; value: string; sub?: string; trend?: number;
  icon: React.ElementType; accent: string; chartData?: number[];
}) {
  const trendUp = (trend ?? 0) >= 0;
  return (
    <div className="bg-white rounded-2xl px-5 pt-5 pb-4 border shadow-sm relative overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: accent }} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: accent + "18" }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
      </div>
      <p className="font-heading font-black text-[2rem] text-foreground leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
      <div className="flex items-end justify-between mt-3">
        {trend !== undefined ? (
          <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? "text-green-600" : "text-red-500"}`}>
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trendUp ? "+" : ""}{trend}% vs yesterday
          </div>
        ) : <span />}
        {chartData && <Sparkline data={chartData} color={accent} />}
      </div>
    </div>
  );
}

// ─── Revenue bar chart ────────────────────────────────────────────
function RevenueChart() {
  const max = Math.max(...REVENUE_CHART.map(d => d.revenue));
  return (
    <div className="flex items-end gap-2 h-36">
      {REVENUE_CHART.map((d, i) => {
        const isToday = i === REVENUE_CHART.length - 1;
        const pct     = (d.revenue / max) * 100;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full flex-1 flex items-end relative">
              {isToday && (
                <p className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black whitespace-nowrap" style={{ color: "oklch(0.68 0.19 44)" }}>
                  ₹{(d.revenue / 1000).toFixed(1)}k
                </p>
              )}
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{ height: `${pct}%`, background: isToday ? "oklch(0.68 0.19 44)" : "oklch(0.68 0.19 44 / 0.22)", minHeight: "4px" }}
              />
            </div>
            <span className="text-[9px] font-bold" style={{ color: isToday ? "oklch(0.68 0.19 44)" : "oklch(0.60 0.04 260)" }}>{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Activity icon map ────────────────────────────────────────────
const ACTIVITY_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  order:        { icon: ShoppingCart, color: "oklch(0.68 0.19 44)"  },
  registration: { icon: UserPlus,     color: "oklch(0.55 0.22 280)" },
  support:      { icon: Headphones,   color: "oklch(0.47 0.22 22)"  },
  community:    { icon: Users,        color: "oklch(0.64 0.14 160)" },
  restock:      { icon: RefreshCw,    color: "oklch(0.72 0.16 130)" },
};

function daysUntil(iso: string) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (isNaN(t)) return 0;
  return Math.max(0, Math.ceil((t - Date.now()) / 86_400_000));
}

function PageHeader({ firstName }: { firstName: string }) {
  const now      = new Date();
  const hour     = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
      <div>
        <p className="text-sm font-semibold" style={{ color: "oklch(0.68 0.19 44)" }}>{greeting}, {firstName}</p>
        <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-0.5 leading-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: "oklch(0.64 0.14 160 / 0.10)", color: "oklch(0.40 0.12 160)" }}>
          All systems operational
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function OverviewPage() {
  const { state, dispatch } = useStore();
  const { currentUser }     = useAuth();
  const { products, drops, tickets } = state;
  const firstName = currentUser?.name.split(" ")[0] ?? "Admin";

  // Anemone toggle: drives the store (reactive widget) + persists to localStorage.
  // RootProviders/AnemoneInit restores the stored value on page load.
  function toggleAnemone() {
    const next = !state.anemone.enabled;
    dispatch({ type: "ANEMONE_UPDATE", payload: { enabled: next } });
    try { localStorage.setItem(ANEMONE_LS_KEY, String(next)); } catch { /* ignore */ }
  }

  // Live computed counts from store
  const liveListings   = products.filter(p => p.status === "listed").length;
  const scheduledDrops = drops.filter(d => d.status === "scheduled" || d.status === "live").length;
  const openTickets    = tickets.filter(t => t.status === "open").length;
  const highPriority   = tickets.filter(t => t.priority === "high" && (t.status === "open" || t.status === "in-progress")).length;
  const totalLeads     = state.leads.length;

  const revenueWeekly = REVENUE_CHART.map(d => d.revenue);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <PageHeader firstName={firstName} />

      {/* ── KPI cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          label="Active Users"
          value={OVERVIEW_STATS.activeUsers.toLocaleString()}
          sub="Browsing now"
          trend={8.3}
          icon={Users}
          accent="oklch(0.68 0.19 44)"
          chartData={[820, 910, 870, 1040, 1100, 1200, OVERVIEW_STATS.activeUsers]}
        />
        <StatCard
          label="Orders Today"
          value={OVERVIEW_STATS.ordersToday.toString()}
          sub={`₹${OVERVIEW_STATS.revenue.today.toLocaleString()} revenue`}
          trend={14.2}
          icon={ShoppingBag}
          accent="oklch(0.55 0.22 280)"
          chartData={WEEKLY_ORDERS}
        />
        <StatCard
          label="Monthly Revenue"
          value={`₹${(OVERVIEW_STATS.revenue.month / 1000).toFixed(1)}k`}
          sub={`+${OVERVIEW_STATS.revenue.growth}% MoM growth`}
          trend={OVERVIEW_STATS.revenue.growth}
          icon={TrendingUp}
          accent="oklch(0.64 0.14 160)"
          chartData={revenueWeekly}
        />
        <StatCard
          label="Open Tickets"
          value={openTickets.toString()}
          sub={highPriority > 0 ? `${highPriority} high priority` : "All clear"}
          icon={MessageSquare}
          accent="oklch(0.47 0.22 22)"
          chartData={[3, 5, 4, 7, 6, 9, openTickets]}
        />
      </div>

      {/* ── Anemone toggle ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl px-5 py-4 border shadow-sm mb-5 flex items-center gap-4" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.55 0.22 280 / 0.10)" }}>
          <Bot className="h-5 w-5" style={{ color: "oklch(0.55 0.22 280)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-none">Anemone AI Widget</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {state.anemone.enabled ? "Active on public store — responding to customer queries" : "Disabled — widget hidden from public store visitors"}
          </p>
        </div>
        <button
          onClick={toggleAnemone}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all hover:shadow-sm flex-shrink-0"
          style={{
            borderColor: state.anemone.enabled ? "oklch(0.64 0.14 160 / 0.40)" : "oklch(0.88 0.015 80)",
            background:  state.anemone.enabled ? "oklch(0.64 0.14 160 / 0.08)" : "transparent",
            color:       state.anemone.enabled ? "oklch(0.40 0.12 160)" : "oklch(0.55 0.05 260)",
          }}
        >
          {state.anemone.enabled
            ? <ToggleRight className="h-4 w-4" />
            : <ToggleLeft  className="h-4 w-4" />
          }
          {state.anemone.enabled ? "Enabled" : "Disabled"}
        </button>
        <Link
          href="/dashboard/anemone"
          className="text-xs font-bold hover:underline flex-shrink-0"
          style={{ color: "oklch(0.68 0.19 44)" }}
        >
          Configure →
        </Link>
      </div>

      {/* ── Mid row ───────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4 mb-4">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Revenue — 7 Days</p>
              <p className="font-heading font-black text-2xl text-foreground mt-1 leading-none">
                ₹{OVERVIEW_STATS.revenue.today.toLocaleString()}
                <span className="text-sm font-sans font-normal text-muted-foreground ml-2">today</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">₹{REVENUE_CHART.map(d => d.revenue).reduce((a, b) => a + b).toLocaleString()} this week</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg">
              <TrendingUp className="h-3.5 w-3.5" />+14.2%
            </div>
          </div>
          <RevenueChart />
        </div>

        {/* Franchise breakdown */}
        <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-4">Top Franchises</p>
          <div className="space-y-3.5">
            {FRANCHISE_STATS.map(({ name, pct, orders, color }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{orders}</span>
                    <span className="text-xs font-black text-foreground w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full w-full" style={{ background: "oklch(0.93 0.015 80)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        {/* Activity feed */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Live Activity</p>
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "oklch(0.64 0.14 160 / 0.10)", color: "oklch(0.40 0.12 160)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Live
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "oklch(0.94 0.010 78)" }}>
            {ACTIVITY_FEED.slice(0, 8).map((item) => {
              const ai = ACTIVITY_ICON[item.type] ?? { icon: Package, color: "oklch(0.60 0.05 260)" };
              const AI = ai.icon;
              return (
                <div key={item.id} className="flex items-center gap-3.5 px-6 py-3.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ai.color + "18" }}>
                    <AI className="h-3.5 w-3.5" style={{ color: ai.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      <span className="font-semibold">{item.user}</span>
                      <span className="text-muted-foreground"> {item.description.replace(item.user, "").trim()}</span>
                    </p>
                    {item.franchise && <p className="text-[11px] text-muted-foreground mt-0.5">{item.franchise}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {item.amount && <p className="font-heading font-black text-sm" style={{ color: "oklch(0.68 0.19 44)" }}>₹{item.amount}</p>}
                    <p className="text-[11px] text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Upcoming drops — live from store */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Upcoming Drops</p>
              <Link href="/dashboard/drops" className="text-[10px] font-bold flex items-center gap-1 hover:opacity-75 transition-opacity" style={{ color: "oklch(0.68 0.19 44)" }}>
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {drops.filter(d => d.status !== "ended").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-xs font-semibold">No upcoming drops</p>
                <Link href="/dashboard/drops" className="text-xs font-bold mt-2 block" style={{ color: "oklch(0.68 0.19 44)" }}>Schedule one →</Link>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "oklch(0.93 0.015 80)" }}>
                {drops.filter(d => d.status !== "ended").slice(0, 3).map((drop) => {
                  const days = daysUntil(drop.scheduledAt);
                  const pct  = drop.units > 0 ? Math.min(100, Math.round((drop.registered / drop.units) * 100)) : 0;
                  return (
                    <div key={drop.id} className="px-5 py-3.5">
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-lg flex-shrink-0 mt-0.5">{drop.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{drop.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{drop.registered.toLocaleString()} registered</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-black" style={{ color: days <= 7 ? "oklch(0.47 0.22 22)" : "oklch(0.68 0.19 44)" }}>{days}d</p>
                          <p className="text-[10px] text-muted-foreground">left</p>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "oklch(0.93 0.015 80)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? "oklch(0.47 0.22 22)" : "oklch(0.68 0.19 44)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Support queue — live from store */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Support Queue</p>
              <Link href="/dashboard/support" className="text-[10px] font-bold flex items-center gap-1 hover:opacity-75 transition-opacity" style={{ color: "oklch(0.47 0.22 22)" }}>
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {tickets.filter(t => t.status === "open" || t.status === "in-progress").length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-xs font-semibold">All clear 🎉</p>
                <p className="text-xs mt-1">No open tickets</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "oklch(0.93 0.015 80)" }}>
                {tickets.filter(t => t.status === "open" || t.status === "in-progress").slice(0, 3).map(ticket => (
                  <div key={ticket.id} className="flex items-start gap-3 px-5 py-3">
                    <div
                      className="w-1 h-8 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: ticket.priority === "high" ? "oklch(0.47 0.22 22)" : "oklch(0.88 0.015 80)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">{ticket.user}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{ticket.subject}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-shrink-0">{ticket.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Summary strip — live from store ───────────────────── */}
      <div className="mt-4 bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x" style={{ borderColor: "oklch(0.92 0.015 80)" }}>
          {[
            { label: "Products listed",  value: liveListings.toString(),     icon: "📦", color: "oklch(0.68 0.19 44)"  },
            { label: "Leads captured",   value: totalLeads.toString(),       icon: "📞", color: "oklch(0.55 0.22 280)" },
            { label: "Drops scheduled",  value: scheduledDrops.toString(),   icon: "⚡", color: "oklch(0.47 0.22 22)"  },
            { label: "Anemone today",    value: "47 chats",                  icon: "🐙", color: "oklch(0.64 0.14 160)" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="px-5 py-4 text-center">
              <p className="text-xl mb-1.5">{icon}</p>
              <p className="font-heading font-black text-xl text-foreground leading-none">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
