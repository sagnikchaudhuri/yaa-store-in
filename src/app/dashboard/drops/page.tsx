"use client";

import { useState } from "react";
import {
  CalendarClock, Users, Plus, Edit2, Trash2, Clock,
  CheckCircle, Zap, AlertCircle, Package, ImagePlus,
  Copy, X,
} from "lucide-react";
import { useStore, useFranchises } from "@/lib/store";
import { useToast } from "@/lib/toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import type { DashboardDrop, DropStatus } from "@/lib/dashboard-data";

// ─── Status config ────────────────────────────────────────────────
const DROP_STATUS_CONFIG: Record<DropStatus, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  draft:     { label: "Draft",     bg: "oklch(0.75 0.04 260 / 0.14)", color: "oklch(0.48 0.05 260)", icon: Edit2       },
  scheduled: { label: "Scheduled", bg: "oklch(0.55 0.22 280 / 0.12)", color: "oklch(0.38 0.18 280)", icon: Clock       },
  live:      { label: "Live",      bg: "oklch(0.68 0.19 44  / 0.12)", color: "oklch(0.52 0.20 38)",  icon: Zap         },
  ended:     { label: "Ended",     bg: "oklch(0.75 0.04 260 / 0.14)", color: "oklch(0.58 0.04 260)", icon: CheckCircle },
};

function DropStatusBadge({ status }: { status: DropStatus }) {
  const cfg  = DROP_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  );
}

function safeDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}
function daysUntil(iso: string) {
  const d = safeDate(iso);
  if (!d) return 0;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
}
function formatDate(iso: string) {
  const d = safeDate(iso);
  if (!d) return "TBD";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatTime(iso: string) {
  const d = safeDate(iso);
  if (!d) return "--:--";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ─── Announcement draft builder ────────────────────────────────────
function buildAnnouncementDraft(title: string, emoji: string, date: string, units: string) {
  const d = safeDate(date);
  const formatted = d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD";
  const time = d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";
  return `${emoji} YAA Store Drop Alert!\n\n${title || "Drop Name"} drops ${formatted} at ${time} UTC.\n\nOnly ${units || "?"} units available — register before it sells out!\n\nyaa-store.com/drops`;
}

// ─── Announcement preview ─────────────────────────────────────────
function AnnouncementPreview({ title, emoji, date, units }: { title: string; emoji: string; date: string; units: string }) {
  const { addToast } = useToast();
  const draft = buildAnnouncementDraft(title, emoji, date, units);
  const d = safeDate(date);
  const time = d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";

  function handleCopy() {
    navigator.clipboard.writeText(draft)
      .then(() => addToast("Announcement draft copied", "success"))
      .catch(() => addToast("Copy failed — please copy manually", "error"));
  }

  return (
    <div>
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
        <div className="px-3 py-2 flex items-center gap-2" style={{ background: "oklch(0.68 0.19 44)" }}>
          <span className="text-sm">{emoji}</span>
          <p className="text-xs font-bold text-white flex-1">Drop Announcement Draft</p>
          <span className="text-[10px] text-white/60">Preview</span>
        </div>
        <div className="p-4 space-y-1.5 text-xs leading-relaxed" style={{ background: "oklch(0.97 0.008 78)" }}>
          <p className="font-bold text-foreground">{emoji} YAA Store Drop Alert!</p>
          <p className="text-muted-foreground">
            <strong style={{ color: "oklch(0.35 0.15 40)" }}>{title || "Drop Name"}</strong> drops{" "}
            {d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "TBD"} at {time} UTC.
          </p>
          <p className="text-muted-foreground">Only <strong>{units || "?"} units</strong> — register before it sells out!</p>
          <p className="text-muted-foreground">yaa-store.com/drops</p>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border hover:bg-white transition-colors"
        style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.48 0.05 260)" }}
      >
        <Copy className="h-3.5 w-3.5" />
        Copy announcement draft
      </button>
    </div>
  );
}

// ─── Drop form ────────────────────────────────────────────────────
interface DropForm {
  title: string;
  franchise: string;
  emoji: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  units: string;
  notifyGroup: string;
  status: DropStatus;
  images: (string | null)[];
}

function blankDropForm(): DropForm {
  return { title: "", franchise: "", emoji: "⚡", description: "", scheduledDate: "", scheduledTime: "18:00", units: "", notifyGroup: "All registered customers", status: "scheduled", images: Array(5).fill(null) };
}

function dropToForm(d: DashboardDrop): DropForm {
  const iso = d.scheduledAt || "";
  const validDate = safeDate(iso);
  return {
    title: d.title, franchise: d.franchise, emoji: d.emoji, description: d.description,
    scheduledDate: validDate ? iso.slice(0, 10) : "",
    scheduledTime: validDate ? (iso.slice(11, 16) || "18:00") : "18:00",
    units: String(d.units || ""), notifyGroup: "All registered customers",
    status: d.status, images: Array(5).fill(null),
  };
}

// ─── Drop composer modal ──────────────────────────────────────────
function DropComposer({
  drop, onClose, onSave,
}: {
  drop?: DashboardDrop;
  onClose: () => void;
  onSave: (form: DropForm) => void;
}) {
  const isEdit = !!drop;
  const franchises = useFranchises();
  const [form, setForm] = useState<DropForm>(drop ? dropToForm(drop) : blankDropForm());
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof DropForm>(key: K, val: DropForm[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function addImageSlot(idx: number) {
    const url = window.prompt("Enter image URL (or blank for placeholder):");
    if (url === null) return;
    const next = [...form.images];
    next[idx] = url.trim() || `__placeholder_${idx + 1}`;
    setForm(prev => ({ ...prev, images: next }));
  }

  function removeImageSlot(idx: number, e: React.MouseEvent) {
    e.stopPropagation();
    const next = [...form.images];
    next[idx] = null;
    setForm(prev => ({ ...prev, images: next }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim())     e.title     = "Title required";
    if (!form.franchise.trim()) e.franchise = "Franchise required";
    if (!form.scheduledDate)    e.scheduledDate = "Date required";
    if (!form.units || isNaN(Number(form.units)) || Number(form.units) <= 0) e.units = "Valid units required";
    return e;
  }

  function handleSubmit(asDraft: boolean) {
    if (!asDraft) {
      const e = validate();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    onSave({ ...form, status: asDraft ? "draft" : form.status });
  }

  const fallbackDate = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  const scheduledAt = `${form.scheduledDate || fallbackDate}T${form.scheduledTime || "18:00"}:00Z`;
  const inputClass  = "w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const border      = (k: string) => ({ borderColor: errors[k] ? "oklch(0.47 0.22 22)" : "oklch(0.88 0.015 80)" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
          <div>
            <h2 className="font-heading font-black text-lg text-foreground">{isEdit ? "Edit Drop" : "Schedule a Drop"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Configure your limited release</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
              style={{ borderColor: showPreview ? "oklch(0.68 0.19 44)" : "oklch(0.88 0.015 80)", color: showPreview ? "oklch(0.52 0.20 38)" : "oklch(0.55 0.05 260)", background: showPreview ? "oklch(0.68 0.19 44 / 0.08)" : "transparent" }}
            >
              <Copy className="h-3.5 w-3.5" />
              Announcement
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors">✕</button>
          </div>
        </div>

        <div className="max-h-[76vh] overflow-y-auto">
          <div className={showPreview ? "grid grid-cols-[1fr_280px]" : ""}>
            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              {/* Title + franchise */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Drop Title *</label>
                  <input className={inputClass} style={border("title")} value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Gear 5 Luffy Figure" />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Franchise *</label>
                  <select className={`${inputClass} bg-white`} style={border("franchise")} value={form.franchise} onChange={e => set("franchise", e.target.value)}>
                    <option value="">Select franchise</option>
                    {franchises.filter(f => f.active).map(f => (
                      <option key={f.id} value={f.name}>{f.emoji} {f.name}</option>
                    ))}
                  </select>
                  {errors.franchise && <p className="text-xs text-red-500 mt-1">{errors.franchise}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Description</label>
                <textarea rows={2} className={`${inputClass} resize-none`} style={{ borderColor: "oklch(0.88 0.015 80)" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Premium details, limited edition notes, bundle contents…" />
              </div>

              {/* Date + time + units */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Drop Date *</label>
                  <input type="date" className={inputClass} style={border("scheduledDate")} value={form.scheduledDate} onChange={e => set("scheduledDate", e.target.value)} />
                  {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Time UTC</label>
                  <input type="time" className={inputClass} style={{ borderColor: "oklch(0.88 0.015 80)" }} value={form.scheduledTime} onChange={e => set("scheduledTime", e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Units *</label>
                  <input type="number" min="1" className={inputClass} style={border("units")} value={form.units} onChange={e => set("units", e.target.value)} placeholder="300" />
                  {errors.units && <p className="text-xs text-red-500 mt-1">{errors.units}</p>}
                </div>
              </div>

              {/* Emoji + target */}
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Drop Emoji</label>
                  <input className="w-20 border rounded-xl px-3 py-2.5 text-xl text-center focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ borderColor: "oklch(0.88 0.015 80)" }} value={form.emoji} onChange={e => set("emoji", e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Notify Target</label>
                  <select className={`${inputClass} bg-white`} style={{ borderColor: "oklch(0.88 0.015 80)" }} value={form.notifyGroup} onChange={e => set("notifyGroup", e.target.value)}>
                    <option value="All registered customers">📢 All registered customers</option>
                    <option value="Broadcast List">📣 Broadcast List</option>
                    <option value="Private Customer">🔒 Private Customer</option>
                    <option value="No notification">🔇 No notification</option>
                  </select>
                </div>
              </div>

              {/* Status (if editing) */}
              {isEdit && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-2">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["draft", "scheduled", "live", "ended"] as DropStatus[]).map(s => {
                      const cfg  = DROP_STATUS_CONFIG[s];
                      const isOn = form.status === s;
                      return (
                        <button key={s} type="button" onClick={() => set("status", s)}
                          className="px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all"
                          style={{ borderColor: isOn ? cfg.color : "oklch(0.90 0.015 80)", background: isOn ? cfg.bg : "transparent", color: isOn ? cfg.color : "oklch(0.55 0.05 260)" }}
                        >{cfg.label}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Images (up to 5)</label>
                  <span className="text-[10px] text-muted-foreground">Slot 1 = hero</span>
                </div>
                <div className="flex gap-2">
                  {/* Hero */}
                  <div
                    className="flex-shrink-0 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary relative"
                    style={{ width: "80px", height: "80px", borderColor: form.images[0] ? "oklch(0.68 0.19 44)" : "oklch(0.88 0.015 80)", background: form.images[0] ? "oklch(0.68 0.19 44 / 0.05)" : "oklch(0.97 0.008 78)" }}
                    onClick={() => !form.images[0] && addImageSlot(0)}
                  >
                    {form.images[0] ? (
                      <>
                        <Package className="h-6 w-6" style={{ color: "oklch(0.68 0.19 44)" }} />
                        <button className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center" onClick={e => removeImageSlot(0, e)}>
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-5 w-5" style={{ color: "oklch(0.68 0.19 44)" }} />
                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: "oklch(0.68 0.19 44)" }}>Hero</span>
                      </>
                    )}
                  </div>
                  {/* Gallery */}
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    {[1, 2, 3, 4].map(idx => (
                      <div key={idx}
                        className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary relative"
                        style={{ borderColor: form.images[idx] ? "oklch(0.68 0.19 44 / 0.50)" : "oklch(0.88 0.015 80)", background: "oklch(0.97 0.008 78)" }}
                        onClick={() => !form.images[idx] && addImageSlot(idx)}
                      >
                        {form.images[idx] ? (
                          <>
                            <Package className="h-4 w-4" style={{ color: "oklch(0.68 0.19 44)" }} />
                            <button className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center" onClick={e => removeImageSlot(idx, e)}>
                              <X className="h-2.5 w-2.5" />
                            </button>
                          </>
                        ) : (
                          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Announcement preview panel */}
            {showPreview && (
              <div className="px-4 py-5 flex-shrink-0" style={{ borderLeft: "1px solid oklch(0.92 0.015 80)", background: "oklch(0.97 0.008 78)" }}>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-3">Announcement Draft</p>
                <AnnouncementPreview title={form.title} emoji={form.emoji} date={scheduledAt} units={form.units} />
                <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                  Copy this draft to use as an announcement when the drop goes live.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3 justify-between" style={{ borderTop: "1px solid oklch(0.92 0.015 80)", background: "oklch(0.98 0.006 78)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold border hover:bg-gray-50 transition-colors" style={{ borderColor: "oklch(0.88 0.015 80)" }}>Cancel</button>
          <div className="flex gap-3">
            <button onClick={() => handleSubmit(true)} className="px-4 py-2 rounded-xl text-sm font-bold border hover:bg-gray-50 transition-colors" style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.48 0.05 260)" }}>Save Draft</button>
            <button onClick={() => handleSubmit(false)} className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "oklch(0.68 0.19 44)" }}>
              {isEdit ? "Update Drop" : "Schedule Drop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Drop card ────────────────────────────────────────────────────
function DropCard({ drop, onEdit, onDelete }: { drop: DashboardDrop; onEdit: () => void; onDelete: () => void }) {
  const days            = daysUntil(drop.scheduledAt);
  const registrationPct = drop.units > 0
    ? Math.min(100, Math.round((drop.registered / drop.units) * 100))
    : 0;
  const isHighDemand    = registrationPct >= 90;
  const statusCfg       = DROP_STATUS_CONFIG[drop.status];

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
      <div className="h-[3px]" style={{ background: drop.status === "live" ? "linear-gradient(90deg, oklch(0.68 0.19 44), oklch(0.50 0.22 22))" : drop.status === "scheduled" ? "oklch(0.55 0.22 280)" : "oklch(0.83 0.02 260)" }} />
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0 mt-0.5">{drop.emoji}</span>
            <div>
              <h3 className="font-heading font-black text-sm text-foreground leading-snug">{drop.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{drop.franchise}</p>
            </div>
          </div>
          <DropStatusBadge status={drop.status} />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{drop.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { label: "Units",      value: drop.units.toLocaleString(),       color: "oklch(0.35 0.08 260)" },
            { label: "Registered", value: drop.registered.toLocaleString(),  color: "oklch(0.38 0.18 280)" },
            { label: "Days left",  value: `${days}d`,                        color: days <= 7 ? "oklch(0.47 0.22 22)" : "oklch(0.35 0.08 260)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-2.5 rounded-xl" style={{ background: "oklch(0.97 0.008 78)" }}>
              <p className="font-heading font-black text-base leading-none" style={{ color }}>{value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Registration bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Pre-registration fill</span>
            <span className="text-[11px] font-black text-foreground">{registrationPct}%</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "oklch(0.92 0.015 80)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${registrationPct}%`, background: isHighDemand ? "oklch(0.47 0.22 22)" : registrationPct >= 60 ? "oklch(0.68 0.19 44)" : "oklch(0.55 0.22 280)" }} />
          </div>
          {isHighDemand && (
            <p className="text-[11px] font-bold mt-1.5 flex items-center gap-1" style={{ color: "oklch(0.47 0.22 22)" }}>
              <AlertCircle className="h-3 w-3" />High demand — consider expanding units
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop: "1px solid oklch(0.93 0.015 80)" }}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDate(drop.scheduledAt)}</span>
            <span>·</span>
            <span>{formatTime(drop.scheduledAt)} UTC</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={onEdit} className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-colors" style={{ color: "oklch(0.68 0.19 44)" }}>
              <Edit2 className="h-3 w-3" />Edit
            </button>
            <button onClick={onDelete} className="flex items-center px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ label, count, pulse }: { label: string; count: number; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      {pulse && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />}
      <p className="text-xs font-black uppercase tracking-[0.20em] text-muted-foreground">{label}</p>
      <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "oklch(0.93 0.015 80)", color: "oklch(0.48 0.05 260)" }}>{count}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function DropsPage() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const drops = state.drops;

  const [modal,         setModal]         = useState<"new" | DashboardDrop | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const scheduled = drops.filter(d => d.status === "scheduled");
  const drafts    = drops.filter(d => d.status === "draft");
  const live      = drops.filter(d => d.status === "live");
  const ended     = drops.filter(d => d.status === "ended");

  function handleSave(form: DropForm) {
    const fallbackDateStr = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    const scheduledAt = `${form.scheduledDate || fallbackDateStr}T${form.scheduledTime || "18:00"}:00Z`;
    if (modal === "new") {
      const newDrop: DashboardDrop = {
        id: `d${Date.now()}`,
        title: form.title, franchise: form.franchise, emoji: form.emoji,
        description: form.description, scheduledAt,
        units: parseInt(form.units) || 0, registered: 0,
        status: form.status,
      };
      dispatch({ type: "DROP_CREATE", payload: newDrop });
      dispatch({ type: "LOG_ADD", payload: { action: "Drop scheduled", details: `${form.title} created`, time: "Just now", severity: "info" } });
      addToast(`"${form.title}" ${form.status === "draft" ? "saved as draft" : "scheduled"}`, "success");
    } else if (modal && typeof modal !== "string") {
      dispatch({
        type: "DROP_UPDATE",
        payload: {
          id: (modal as DashboardDrop).id,
          updates: { title: form.title, franchise: form.franchise, emoji: form.emoji, description: form.description, scheduledAt, units: parseInt(form.units) || 0, status: form.status },
        },
      });
      dispatch({ type: "LOG_ADD", payload: { action: "Drop updated", details: `${form.title} edited`, time: "Just now", severity: "info" } });
      addToast(`"${form.title}" updated`, "success");
    }
    setModal(null);
  }

  function handleDelete(id: string) {
    const d = drops.find(x => x.id === id);
    dispatch({ type: "DROP_DELETE", payload: id });
    dispatch({ type: "LOG_ADD", payload: { action: "Drop deleted", details: `${d?.title} removed`, time: "Just now", severity: "warning" } });
    addToast(`"${d?.title}" deleted`, "warning");
    setConfirmDelete(null);
  }

  return (
    <>
      {modal && <DropComposer drop={modal === "new" ? undefined : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      {confirmDelete && (
        <ConfirmModal
          title="Delete this drop?"
          message="This drop will be permanently removed. Registered users will not be automatically notified."
          confirmLabel="Delete Drop"
          danger
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.68 0.19 44)" }}>Limited Releases</p>
            <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-0.5 leading-tight">Scheduled Drops</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {scheduled.length} scheduled · {drafts.length} draft{drafts.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setModal("new")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: "oklch(0.68 0.19 44)" }}
          >
            <Plus className="h-4 w-4" />New Drop
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Registered", value: drops.reduce((a, d) => a + d.registered, 0).toLocaleString(), icon: Users,         color: "oklch(0.38 0.18 280)" },
            { label: "Units Available",  value: drops.reduce((a, d) => a + d.units, 0).toLocaleString(),       icon: Package,       color: "oklch(0.68 0.19 44)"  },
            { label: "Scheduled",        value: scheduled.length.toString(),                                    icon: CalendarClock, color: "oklch(0.38 0.18 280)" },
            { label: "Drafts",           value: drafts.length.toString(),                                       icon: Edit2,         color: "oklch(0.48 0.05 260)" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border shadow-sm flex items-center gap-4" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + "18" }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p className="font-heading font-black text-2xl text-foreground leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {drops.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <CalendarClock className="h-10 w-10 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-semibold mb-1">No drops yet</p>
            <p className="text-xs mb-4">Create your first limited release drop</p>
            <button onClick={() => setModal("new")} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "oklch(0.68 0.19 44)" }}>
              <Plus className="h-4 w-4 inline mr-1.5" />Schedule Drop
            </button>
          </div>
        )}

        {live.length > 0 && (
          <div className="mb-8">
            <SectionHeading label="Live Now" count={live.length} pulse />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {live.map(d => <DropCard key={d.id} drop={d} onEdit={() => setModal(d)} onDelete={() => setConfirmDelete(d.id)} />)}
            </div>
          </div>
        )}

        {scheduled.length > 0 && (
          <div className="mb-8">
            <SectionHeading label="Scheduled" count={scheduled.length} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduled.map(d => <DropCard key={d.id} drop={d} onEdit={() => setModal(d)} onDelete={() => setConfirmDelete(d.id)} />)}
            </div>
          </div>
        )}

        {drafts.length > 0 && (
          <div className="mb-8">
            <SectionHeading label="Drafts" count={drafts.length} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map(d => <DropCard key={d.id} drop={d} onEdit={() => setModal(d)} onDelete={() => setConfirmDelete(d.id)} />)}
            </div>
          </div>
        )}

        {ended.length > 0 && (
          <div>
            <SectionHeading label="Ended" count={ended.length} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ended.map(d => <DropCard key={d.id} drop={d} onEdit={() => setModal(d)} onDelete={() => setConfirmDelete(d.id)} />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
