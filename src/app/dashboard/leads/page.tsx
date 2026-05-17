"use client";

import { useState, useMemo } from "react";
import { Phone, Users, TrendingUp, Filter, Search, Download, PhoneCall, Mail } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Lead, LeadSource } from "@/lib/store";

// ─── Source config ────────────────────────────────────────────────
const SOURCE_CONFIG: Record<LeadSource, { label: string; color: string; bg: string; dot: string }> = {
  "drops-signup":  { label: "Drop Sign-up",   color: "oklch(0.52 0.20 38)",  bg: "oklch(0.68 0.19 44 / 0.10)", dot: "bg-orange-400" },
  "contact-form":  { label: "Contact Form",   color: "oklch(0.40 0.12 160)", bg: "oklch(0.64 0.14 160 / 0.10)", dot: "bg-green-400"  },
  "hero":          { label: "Hero CTA",        color: "oklch(0.42 0.18 280)", bg: "oklch(0.55 0.22 280 / 0.10)", dot: "bg-violet-400" },
  "collections":   { label: "Collections",    color: "oklch(0.40 0.08 240)", bg: "oklch(0.58 0.18 240 / 0.10)", dot: "bg-blue-400"   },
};

function SourceBadge({ source }: { source: LeadSource }) {
  const cfg = SOURCE_CONFIG[source];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────
function MetricCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl px-5 pt-5 pb-4 border shadow-sm relative overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ background: accent }} />
      <div className="flex items-start justify-between mb-2.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent + "18" }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
      </div>
      <p className="font-heading font-black text-[2rem] text-foreground leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function LeadsPage() {
  const { state } = useStore();
  const { leads } = state;

  const [search,    setSearch]    = useState("");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");

  // ── Computed metrics ──────────────────────────────────────────
  const totalLeads   = leads.length;
  const dropLeads    = leads.filter(l => l.source === "drops-signup").length;
  const contactLeads = leads.filter(l => l.source === "contact-form").length;
  const namedLeads   = leads.filter(l => l.name).length;

  const franchiseCounts = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => {
      if (l.franchise) map[l.franchise] = (map[l.franchise] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [leads]);

  // ── Filter / search ───────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = leads;
    if (sourceFilter !== "all") list = list.filter(l => l.source === sourceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.phone.toLowerCase().includes(q) ||
        (l.name ?? "").toLowerCase().includes(q) ||
        (l.franchise ?? "").toLowerCase().includes(q) ||
        l.section.toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, sourceFilter, search]);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: "oklch(0.68 0.19 44)" }}>Contact Tracking</p>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-0.5 leading-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalLeads} contacts captured · {namedLeads} with name
          </p>
        </div>
        <button
          onClick={() => {/* Export placeholder */}}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border hover:bg-gray-50 transition-colors"
          style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.48 0.05 260)" }}
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <MetricCard label="Total Leads"     value={totalLeads}   sub="All time"              icon={Users}       accent="oklch(0.68 0.19 44)"  />
        <MetricCard label="Drop Sign-ups"   value={dropLeads}    sub="From early access form" icon={PhoneCall}   accent="oklch(0.47 0.22 22)"  />
        <MetricCard label="Contact Forms"   value={contactLeads} sub="From contact page"      icon={Mail}        accent="oklch(0.64 0.14 160)" />
        <MetricCard label="Named Contacts"  value={namedLeads}   sub="With name captured"     icon={TrendingUp}  accent="oklch(0.55 0.22 280)" />
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">

        {/* Left — leads table */}
        <div className="flex flex-col gap-4">

          {/* Controls */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-3.5 flex flex-col sm:flex-row items-center gap-3" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search phone, name, franchise…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ borderColor: "oklch(0.88 0.015 80)" }}
                />
              </div>
              {/* Source filter */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={sourceFilter}
                  onChange={e => setSourceFilter(e.target.value as LeadSource | "all")}
                  className="border rounded-xl px-3 py-2 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ borderColor: "oklch(0.88 0.015 80)" }}
                >
                  <option value="all">All sources</option>
                  {(Object.entries(SOURCE_CONFIG) as [LeadSource, typeof SOURCE_CONFIG[LeadSource]][]).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground flex-shrink-0">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
            </div>

            {/* Table header */}
            <div
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground"
              style={{ background: "oklch(0.975 0.005 78)", borderBottom: "1px solid oklch(0.92 0.015 80)" }}
            >
              <span>Contact</span>
              <span className="w-32 text-center">Source</span>
              <span className="w-28 hidden sm:block">Franchise</span>
              <span className="w-20 text-right">Captured</span>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm font-bold text-foreground">No leads found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "oklch(0.94 0.010 78)" }}>
                {filtered.map((lead: Lead) => (
                  <div
                    key={lead.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-3.5 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Contact info */}
                    <div className="min-w-0">
                      {lead.name && (
                        <p className="text-sm font-bold text-foreground">{lead.name}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs font-mono text-muted-foreground">{lead.phone}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{lead.section}</p>
                    </div>

                    {/* Source badge */}
                    <div className="w-32 flex justify-center">
                      <SourceBadge source={lead.source} />
                    </div>

                    {/* Franchise */}
                    <div className="w-28 hidden sm:block">
                      {lead.franchise ? (
                        <span className="text-xs font-semibold text-foreground">{lead.franchise}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="w-20 text-right">
                      <p className="text-[11px] text-muted-foreground">{lead.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — analytics sidebar */}
        <div className="flex flex-col gap-4">

          {/* Source breakdown */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">By Source</p>
            </div>
            <div className="p-5 space-y-3.5">
              {(Object.entries(SOURCE_CONFIG) as [LeadSource, typeof SOURCE_CONFIG[LeadSource]][]).map(([key, cfg]) => {
                const count = leads.filter(l => l.source === key).length;
                const pct   = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">{count}</span>
                        <span className="text-xs font-black text-foreground w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 rounded-full w-full" style={{ background: "oklch(0.93 0.015 80)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cfg.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top franchises */}
          {franchiseCounts.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Top Franchises</p>
              </div>
              <div className="p-5 space-y-2.5">
                {franchiseCounts.map(([franchise, count]) => (
                  <div key={franchise} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{franchise}</span>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "oklch(0.68 0.19 44 / 0.10)", color: "oklch(0.52 0.20 38)" }}
                    >
                      {count} lead{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "oklch(0.68 0.19 44 / 0.07)", border: "1px solid oklch(0.68 0.19 44 / 0.15)" }}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] mb-2" style={{ color: "oklch(0.52 0.20 38)" }}>Data Capture</p>
            <p className="text-[11px] leading-relaxed" style={{ color: "oklch(0.35 0.10 40)" }}>
              Leads are captured from the Drop Sign-up form, Contact page, and any future
              CTA sections. Each contact is deduplicated by phone number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
