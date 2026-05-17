"use client";

import { TrendingUp, TrendingDown, ShoppingBag, Users, Eye, BarChart3 } from "lucide-react";
import {
  REVENUE_CHART, WEEKLY_ORDERS, FRANCHISE_STATS,
  DASHBOARD_PRODUCTS, OVERVIEW_STATS,
} from "@/lib/dashboard-data";

// ─── Sparkline ───────────────────────────────────────────────────
function Sparkline({ data, color, w = 100, h = 32 }: { data: number[]; color: string; w?: number; h?: number }) {
  const max   = Math.max(...data);
  const min   = Math.min(...data);
  const range = max - min || 1;
  const step  = w / (data.length - 1);
  const pts   = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  const last  = { x: (data.length - 1) * step, y: h - ((data[data.length - 1] - min) / range) * (h - 4) - 2 };
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx={last.x} cy={last.y} r="3" fill={color} />
    </svg>
  );
}

// ─── Full-height bar chart ───────────────────────────────────────
function BarChart({ data, valueKey, color, height = 160 }: {
  data: Array<{ day: string; [k: string]: number | string }>;
  valueKey: string;
  color: string;
  height?: number;
}) {
  const values = data.map(d => Number(d[valueKey]));
  const max    = Math.max(...values);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const pct    = (Number(d[valueKey]) / max) * 100;
        return (
          <div key={String(d.day)} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full flex-1 flex items-end">
              <div
                className="w-full rounded-t-md transition-all duration-300"
                style={{ height: `${pct}%`, background: isLast ? color : color + "40", minHeight: "4px" }}
                title={`${d.day}: ${d[valueKey]}`}
              />
            </div>
            <span className="text-[9px] font-bold text-muted-foreground">{d.day}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Metric card ─────────────────────────────────────────────────
function MetricCard({ label, value, sub, delta, color, icon: Icon, chart }: {
  label: string; value: string; sub?: string; delta?: number;
  color: string; icon: React.ElementType; chart?: number[];
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm relative overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: color }} />
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="font-heading font-black text-3xl text-foreground mt-2 leading-none">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          {delta !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${delta >= 0 ? "text-green-600" : "text-red-500"}`}>
              {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {delta >= 0 ? "+" : ""}{delta}% this week
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "1a" }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
          {chart && <Sparkline data={chart} color={color} />}
        </div>
      </div>
    </div>
  );
}

// ─── Top products table ──────────────────────────────────────────
function TopProducts() {
  const sorted = [...DASHBOARD_PRODUCTS]
    .filter(p => p.status === "listed")
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);
  const maxOrders = sorted[0]?.orders ?? 1;

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
      <div className="px-6 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Top Products by Orders</p>
      </div>
      <div className="divide-y" style={{ borderColor: "oklch(0.94 0.010 78)" }}>
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center gap-4 px-6 py-3.5">
            <span className="text-xs font-black text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{p.franchise}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-24 h-1.5 rounded-full" style={{ background: "oklch(0.92 0.015 80)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(p.orders / maxOrders) * 100}%`, background: "oklch(0.68 0.19 44)" }}
                />
              </div>
              <span className="text-sm font-heading font-black text-foreground w-8 text-right">{p.orders}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Franchise engagement ─────────────────────────────────────────
function FranchiseEngagement() {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
      <div className="px-6 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Franchise Engagement</p>
      </div>
      <div className="p-6 space-y-4">
        {FRANCHISE_STATS.map(({ name, pct, orders, color }) => (
          <div key={name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-foreground">{name}</span>
              <div className="flex items-center gap-3 text-right">
                <span className="text-xs text-muted-foreground">{orders} orders</span>
                <span className="text-xs font-black text-foreground w-8">{pct}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full" style={{ background: "oklch(0.92 0.015 80)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Fake weekly visitors data ────────────────────────────────────
const WEEKLY_VISITORS = [3420, 3890, 3150, 4100, 4420, 5200, 4890];

// ─── Page ─────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium" style={{ color: "oklch(0.68 0.19 44)" }}>Performance</p>
        <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-1 leading-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Last 7 days · All data is illustrative</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Revenue"
          value={`₹${(OVERVIEW_STATS.revenue.month / 1000).toFixed(1)}k`}
          sub="This month"
          delta={OVERVIEW_STATS.revenue.growth}
          color="oklch(0.68 0.19 44)"
          icon={TrendingUp}
          chart={REVENUE_CHART.map(d => d.revenue)}
        />
        <MetricCard
          label="Total Orders"
          value={WEEKLY_ORDERS.reduce((a, b) => a + b, 0).toString()}
          sub="This week"
          delta={6.8}
          color="oklch(0.55 0.22 280)"
          icon={ShoppingBag}
          chart={WEEKLY_ORDERS}
        />
        <MetricCard
          label="Unique Visitors"
          value={WEEKLY_VISITORS.reduce((a, b) => a + b, 0).toLocaleString()}
          sub="This week"
          delta={11.4}
          color="oklch(0.64 0.14 160)"
          icon={Users}
          chart={WEEKLY_VISITORS}
        />
        <MetricCard
          label="Product Views"
          value={DASHBOARD_PRODUCTS.reduce((a, p) => a + p.views, 0).toLocaleString()}
          sub="Across all listings"
          delta={9.2}
          color="oklch(0.62 0.20 20)"
          icon={Eye}
          chart={[880, 920, 840, 1100, 1050, 1340, 1200]}
        />
      </div>

      {/* Revenue + orders charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Revenue — 7 Days</p>
              <p className="font-heading font-black text-2xl text-foreground mt-1">
                ₹{REVENUE_CHART.map(d => d.revenue).reduce((a, b) => a + b, 0).toLocaleString()}
                <span className="text-sm font-sans font-normal text-muted-foreground ml-1.5">total</span>
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground opacity-40" />
          </div>
          <BarChart data={REVENUE_CHART} valueKey="revenue" color="oklch(0.68 0.19 44)" height={160} />
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Orders — 7 Days</p>
              <p className="font-heading font-black text-2xl text-foreground mt-1">
                {WEEKLY_ORDERS.reduce((a, b) => a + b, 0)}
                <span className="text-sm font-sans font-normal text-muted-foreground ml-1.5">orders</span>
              </p>
            </div>
            <ShoppingBag className="h-5 w-5 text-muted-foreground opacity-40" />
          </div>
          <BarChart
            data={REVENUE_CHART.map((d, i) => ({ day: d.day, orders: WEEKLY_ORDERS[i] }))}
            valueKey="orders"
            color="oklch(0.55 0.22 280)"
            height={160}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-[1fr_400px] gap-4">
        <TopProducts />
        <FranchiseEngagement />
      </div>

      {/* Visitor trend */}
      <div className="mt-4 bg-white rounded-2xl p-6 border shadow-sm" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Site Visitors — 7 Days</p>
            <p className="font-heading font-black text-2xl text-foreground mt-1">
              {WEEKLY_VISITORS.reduce((a, b) => a + b, 0).toLocaleString()}
              <span className="text-sm font-sans font-normal text-muted-foreground ml-1.5">total visitors</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-600">
            <TrendingUp className="h-4 w-4" />
            +11.4% week-on-week
          </div>
        </div>
        <BarChart
          data={REVENUE_CHART.map((d, i) => ({ day: d.day, visitors: WEEKLY_VISITORS[i] }))}
          valueKey="visitors"
          color="oklch(0.64 0.14 160)"
          height={100}
        />
      </div>
    </div>
  );
}
