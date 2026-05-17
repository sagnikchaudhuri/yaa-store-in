"use client";

import { useState } from "react";
import {
  Zap, Settings, ToggleLeft, ToggleRight,
  Send, CheckCircle, Activity, MessageCircle, Smile, Wind, Sparkles,
} from "lucide-react";
import { ANEMONE_STATS } from "@/lib/dashboard-data";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import type { AnemoneMode } from "@/lib/dashboard-data";

// ─── Recent conversations ─────────────────────────────────────────
const ACTIVITY_LOG = [
  { id: "l1", user: "Kira M.",  intent: "drops",        query: "When is the Gear 5 drop?",               response: "Hey! Gear 5 Luffy drops June 15 at 6PM UTC. Only 300 units — register now before it sells out! ⚡",   time: "3m ago",  msgs: 6  },
  { id: "l2", user: "Ryuu K.",  intent: "product",       query: "Do you have Itachi figures in stock?",   response: "Yes! Itachi Uchiha Figure is live at ₹94.99, 50 units available. Moves fast so don't sleep 🔥",        time: "7m ago",  msgs: 3  },
  { id: "l3", user: "Nova X.",  intent: "greeting",      query: "Hey! New here 👋",                       response: "Welcome to YAA Store! ⛩️ I'm Anemone, your fandom guide. Looking for something specific?",           time: "15m ago", msgs: 1  },
  { id: "l4", user: "Suki T.",  intent: "availability",  query: "Is the Akatsuki cloak still available?", response: "The Akatsuki Cloak is listed at ₹89.99 with 31 in stock. Grab it before the ninjas do 😏",             time: "22m ago", msgs: 4  },
  { id: "l5", user: "Hana L.",  intent: "drops",         query: "How do I register for the Nezuko drop?", response: "Head to Drops, find Nezuko Collector Box, and hit Register. See you July 5! 🌸",                      time: "31m ago", msgs: 2  },
  { id: "l6", user: "Zane W.",  intent: "comparison",    query: "Should I get Gojo or Ichigo figure?",    response: "Both are absolute heat 🔥 Gojo's expression is wild, Ichigo's Bankai pose is iconic. Budget say?",     time: "45m ago", msgs: 7  },
  { id: "l7", user: "Aiko S.",  intent: "sizing",        query: "What size should I get for the haori?",  response: "The Tanjiro Haori runs slightly large — we recommend sizing down one. Check the size guide on the product page 📏", time: "1h ago",  msgs: 2  },
];

const INTENT_STYLE: Record<string, { bg: string; color: string }> = {
  drops:        { bg: "oklch(0.68 0.19 44 / 0.12)",  color: "oklch(0.52 0.20 38)"  },
  product:      { bg: "oklch(0.55 0.22 280 / 0.12)", color: "oklch(0.38 0.18 280)" },
  greeting:     { bg: "oklch(0.64 0.14 160 / 0.12)", color: "oklch(0.40 0.12 160)" },
  availability: { bg: "oklch(0.62 0.20 20  / 0.12)", color: "oklch(0.40 0.18 22)"  },
  comparison:   { bg: "oklch(0.58 0.18 240 / 0.12)", color: "oklch(0.40 0.16 240)" },
  sizing:       { bg: "oklch(0.72 0.16 130 / 0.12)", color: "oklch(0.45 0.14 130)" },
};

// ─── Personality modes ────────────────────────────────────────────
const MODE_CONFIG: Record<AnemoneMode, {
  emoji: string; label: string; desc: string;
  vibe: string; sample: string; bg: string; border: string;
}> = {
  casual:  { emoji: "😊", label: "Casual",  desc: "Fan-to-fan energy. Friendly, knowledgeable, low pressure.",                vibe: "Default · Everyday browsing",    sample: "\"The Akatsuki Ring Set is 🔥 btw — super popular right now!\"",                  bg: "oklch(0.64 0.14 160 / 0.08)", border: "oklch(0.64 0.14 160)" },
  hype:    { emoji: "🔥", label: "Hype",    desc: "High energy for drops and restocks. Urgent, exciting, FOMO-focused.",      vibe: "Drop days · Restock alerts",     sample: "\"GEAR 5 IS DROPPING TOMORROW!! Only 300 units — don't sleep 😱⚡\"",           bg: "oklch(0.68 0.19 44  / 0.08)", border: "oklch(0.68 0.19 44)"  },
  calm:    { emoji: "🌿", label: "Calm",    desc: "Measured and helpful. Minimal hype, clear information, patient tone.",     vibe: "Support queries · Late browsing", sample: "\"The Gear 5 drop is scheduled for June 15 at 6PM UTC, 300 units available.\"", bg: "oklch(0.55 0.22 280 / 0.08)", border: "oklch(0.55 0.22 280)" },
  festive: { emoji: "🎊", label: "Festive", desc: "Celebratory and seasonal. Great for events, sales, collab launches.",      vibe: "Events · Seasonal campaigns",    sample: "\"🎉 YAA Summer Collection is LIVE! Limited designs dropping all week! ✨\"",  bg: "oklch(0.62 0.20 20  / 0.08)", border: "oklch(0.62 0.20 20)"  },
};

const ENGAGEMENT_MODES = [
  { id: "auto",       label: "Auto",       desc: "Anemone responds to all user messages automatically" },
  { id: "manual",     label: "Manual",     desc: "Anemone shows widget but waits for user to open chat" },
  { id: "drops-only", label: "Drops Only", desc: "Anemone activates only during active drop periods"  },
] as const;

const MASCOT_MOODS = [
  { id: "energetic", label: "Energetic", emoji: "⚡", desc: "Bouncy, enthusiastic, lots of animation" },
  { id: "calm",      label: "Calm",      emoji: "🌊", desc: "Settled, composed — moves gently"        },
  { id: "festive",   label: "Festive",   emoji: "🎉", desc: "Party mode — sparkles and confetti"       },
] as const;

const ANNOUNCEMENT_STYLES = [
  { id: "banner", label: "Banner",  desc: "Full-width announcement strip at top of page" },
  { id: "bubble", label: "Bubble",  desc: "Chat bubble pop-up from the widget"           },
  { id: "minimal",label: "Minimal", desc: "Badge count only — low distraction"           },
] as const;

const PRESETS = [
  { id: "pr1", label: "Drop Tomorrow",  text: "⚡ BIG ONE TOMORROW! {drop_name} drops at {time} UTC. Only {units} units — pre-registration closes at midnight. Don't sleep on this 🏃💨" },
  { id: "pr2", label: "Restock Alert",  text: "🔄 IT'S BACK! {product_name} just restocked. Went out in days last time — grab yours now while it lasts 🛒" },
  { id: "pr3", label: "New Arrival",    text: "✨ JUST DROPPED! {product_name} is now live in the store. First look 👇 — tap to check it out before everyone else!" },
  { id: "pr4", label: "Last Units",     text: "🚨 LAST CALL! Only {count} units left of {product_name}. After this, it's gone for good 💀" },
  { id: "pr5", label: "Bundle Offer",   text: "🎁 Bundle & save! Grab any 2 items from the same franchise and get priority shipping automatically applied at checkout. Limited time! 🚀" },
];

// ─── Toggle row ───────────────────────────────────────────────────
function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button onClick={() => onChange(!value)} className="flex-shrink-0 transition-opacity hover:opacity-80" aria-label={value ? "Disable" : "Enable"}>
        {value
          ? <ToggleRight className="h-6 w-6" style={{ color: "oklch(0.40 0.12 160)" }} />
          : <ToggleLeft  className="h-6 w-6 text-muted-foreground" />
        }
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function AnemoneControlPage() {
  const { state, dispatch } = useStore();
  const { addToast } = useToast();
  const anemone = state.anemone;

  const [saved,        setSaved]        = useState(false);
  const [presetText,   setPresetText]   = useState(anemone.activePresetText);
  const [activatedMsg, setActivatedMsg] = useState(false);

  function updateAnemone<K extends keyof typeof anemone>(key: K, val: typeof anemone[K]) {
    dispatch({ type: "ANEMONE_UPDATE", payload: { [key]: val } });
  }

  function handleSaveMode() {
    dispatch({ type: "LOG_ADD", payload: { action: "Anemone mode applied", details: `Mode set to ${anemone.mode}`, time: "Just now", severity: "info" } });
    setSaved(true);
    addToast(`${MODE_CONFIG[anemone.mode].label} mode applied`, "success");
    setTimeout(() => setSaved(false), 2500);
  }

  function handleActivateAnnouncement() {
    if (!presetText.trim()) return;
    dispatch({ type: "ANEMONE_UPDATE", payload: { activePresetText: presetText } });
    dispatch({ type: "LOG_ADD", payload: { action: "Anemone announcement activated", details: presetText.slice(0, 60) + "…", time: "Just now", severity: "info" } });
    setActivatedMsg(true);
    addToast("Announcement activated for all new sessions", "success");
    setTimeout(() => setActivatedMsg(false), 2500);
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: "oklch(0.68 0.19 44)" }}>AI Assistant</p>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-0.5 leading-tight">Anemone</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your site-wide fandom assistant · {ANEMONE_STATS.conversationsToday} sessions today
          </p>
        </div>

        {/* Enable/disable toggle */}
        <button
          onClick={() => updateAnemone("enabled", !anemone.enabled)}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-sm transition-all hover:shadow-md"
          style={{ borderColor: anemone.enabled ? "oklch(0.64 0.14 160)" : "oklch(0.88 0.015 80)", background: anemone.enabled ? "oklch(0.64 0.14 160 / 0.07)" : "white" }}
        >
          {anemone.enabled
            ? <ToggleRight className="h-6 w-6" style={{ color: "oklch(0.40 0.12 160)" }} />
            : <ToggleLeft  className="h-6 w-6 text-muted-foreground" />
          }
          <span className="text-sm font-bold" style={{ color: anemone.enabled ? "oklch(0.38 0.12 160)" : "oklch(0.52 0.05 260)" }}>
            {anemone.enabled ? "Anemone active" : "Anemone paused"}
          </span>
          {anemone.enabled && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Sessions Today",   value: ANEMONE_STATS.conversationsToday.toString(),    color: "oklch(0.68 0.19 44)",  icon: MessageCircle },
          { label: "Msgs / Session",   value: ANEMONE_STATS.avgMessagesPerSession.toString(), color: "oklch(0.55 0.22 280)", icon: Activity      },
          { label: "Top Intent",       value: ANEMONE_STATS.topIntent,                        color: "oklch(0.62 0.20 20)",  icon: Zap           },
          { label: "Satisfaction",     value: `${ANEMONE_STATS.satisfactionPct}%`,            color: "oklch(0.40 0.12 160)", icon: CheckCircle   },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border shadow-sm" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + "18" }}>
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
            </div>
            <p className="font-heading font-black text-2xl leading-none capitalize" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">

        {/* Left: conversation log */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Session Log</p>
              <p className="text-xs text-muted-foreground mt-0.5">Most recent conversations</p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "oklch(0.68 0.19 44 / 0.10)", color: "oklch(0.52 0.20 38)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {ANEMONE_STATS.conversationsToday} today
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "oklch(0.94 0.010 78)" }}>
            {ACTIVITY_LOG.map((entry) => {
              const style = INTENT_STYLE[entry.intent] ?? { bg: "oklch(0.93 0.015 80)", color: "oklch(0.48 0.05 260)" };
              return (
                <div key={entry.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: "oklch(0.68 0.19 44)" }}>
                        {entry.user[0]}
                      </div>
                      <span className="text-xs font-bold text-foreground">{entry.user}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: style.bg, color: style.color }}>{entry.intent}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">{entry.time}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.msgs} msgs</p>
                    </div>
                  </div>
                  <div className="ml-9 space-y-1.5">
                    <div className="text-xs px-3 py-2 rounded-xl rounded-tl-sm leading-relaxed" style={{ background: "oklch(0.95 0.008 78)", color: "oklch(0.30 0.05 260)" }}>
                      <span className="font-bold text-muted-foreground mr-1">Fan:</span>{entry.query}
                    </div>
                    <div className="text-xs px-3 py-2 rounded-xl rounded-tl-sm leading-relaxed" style={{ background: "oklch(0.68 0.19 44 / 0.07)", color: "oklch(0.30 0.12 40)" }}>
                      <span className="font-bold mr-1" style={{ color: "oklch(0.52 0.20 38)" }}>Anemone:</span>{entry.response}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex flex-col gap-4">

          {/* Personality mode */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Personality Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">Current: <span className="font-bold text-foreground capitalize">{anemone.mode}</span></p>
            </div>
            <div className="p-4 space-y-2">
              {(Object.entries(MODE_CONFIG) as Array<[AnemoneMode, (typeof MODE_CONFIG)[AnemoneMode]]>).map(([key, cfg]) => {
                const isActive = anemone.mode === key;
                return (
                  <button key={key} onClick={() => updateAnemone("mode", key)}
                    className="w-full text-left p-3.5 rounded-xl border-2 transition-all hover:shadow-sm"
                    style={{ borderColor: isActive ? cfg.border : "oklch(0.91 0.012 80)", background: isActive ? cfg.bg : "transparent" }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{cfg.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-foreground">{cfg.label}</p>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: isActive ? cfg.border + "20" : "oklch(0.93 0.015 80)", color: isActive ? cfg.border : "oklch(0.55 0.05 260)" }}>
                            {cfg.vibe.split("·")[0].trim()}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{cfg.desc}</p>
                        {isActive && <p className="text-[11px] mt-2 italic leading-relaxed" style={{ color: "oklch(0.42 0.12 40)" }}>{cfg.sample}</p>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="px-4 pb-4">
              <button onClick={handleSaveMode} className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "oklch(0.68 0.19 44)" }}>
                {saved ? <><CheckCircle className="h-4 w-4" />Mode saved!</> : <><Settings className="h-4 w-4" />Apply {MODE_CONFIG[anemone.mode].label} mode</>}
              </button>
            </div>
          </div>

          {/* Engagement mode */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Engagement Mode</p>
            </div>
            <div className="p-4 space-y-2">
              {ENGAGEMENT_MODES.map(em => {
                const isOn = anemone.engagementMode === em.id;
                return (
                  <button key={em.id} onClick={() => { updateAnemone("engagementMode", em.id); addToast(`Engagement: ${em.label}`, "info"); }}
                    className="w-full text-left px-3.5 py-3 rounded-xl border-2 transition-all"
                    style={{ borderColor: isOn ? "oklch(0.55 0.22 280)" : "oklch(0.91 0.012 80)", background: isOn ? "oklch(0.55 0.22 280 / 0.07)" : "transparent" }}
                  >
                    <p className="text-sm font-bold" style={{ color: isOn ? "oklch(0.38 0.18 280)" : "oklch(0.30 0.05 260)" }}>{em.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{em.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mascot mood */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Mascot Mood</p>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2">
              {MASCOT_MOODS.map(mm => {
                const isOn = anemone.mascotMood === mm.id;
                return (
                  <button key={mm.id} onClick={() => { updateAnemone("mascotMood", mm.id); addToast(`Mascot: ${mm.label}`, "info"); }}
                    className="text-center p-3 rounded-xl border-2 transition-all"
                    style={{ borderColor: isOn ? "oklch(0.68 0.19 44)" : "oklch(0.91 0.012 80)", background: isOn ? "oklch(0.68 0.19 44 / 0.08)" : "transparent" }}
                  >
                    <p className="text-xl mb-1">{mm.emoji}</p>
                    <p className="text-[11px] font-bold" style={{ color: isOn ? "oklch(0.52 0.20 38)" : "oklch(0.45 0.05 260)" }}>{mm.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Announcement style */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Announcement Style</p>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2">
              {ANNOUNCEMENT_STYLES.map(as_ => {
                const isOn = anemone.announcementStyle === as_.id;
                return (
                  <button key={as_.id} onClick={() => { updateAnemone("announcementStyle", as_.id); addToast(`Style: ${as_.label}`, "info"); }}
                    className="text-center p-3 rounded-xl border-2 transition-all"
                    style={{ borderColor: isOn ? "oklch(0.64 0.14 160)" : "oklch(0.91 0.012 80)", background: isOn ? "oklch(0.64 0.14 160 / 0.07)" : "transparent" }}
                  >
                    <p className="text-[11px] font-bold" style={{ color: isOn ? "oklch(0.40 0.12 160)" : "oklch(0.45 0.05 260)" }}>{as_.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{as_.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Announcement presets */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Announcement Presets</p>
              <p className="text-[11px] text-muted-foreground mt-1">Inject a banner into all new Anemone sessions</p>
            </div>
            <div className="p-4 space-y-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setPresetText(presetText === preset.text ? "" : preset.text)}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold text-foreground transition-colors hover:bg-orange-50/50"
                  style={{ borderColor: presetText === preset.text ? "oklch(0.68 0.19 44)" : "oklch(0.91 0.012 80)", background: presetText === preset.text ? "oklch(0.68 0.19 44 / 0.06)" : "transparent" }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {presetText && (
              <div className="px-4 pb-4 space-y-2.5">
                <textarea
                  value={presetText}
                  onChange={e => setPresetText(e.target.value)}
                  rows={3}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-xs text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed"
                  style={{ borderColor: "oklch(0.88 0.015 80)" }}
                />
                <button
                  onClick={handleActivateAnnouncement}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: activatedMsg ? "oklch(0.40 0.12 160)" : "oklch(0.55 0.22 280)" }}
                >
                  {activatedMsg ? <><CheckCircle className="h-3.5 w-3.5" />Activated!</> : <><Send className="h-3.5 w-3.5" />Activate announcement</>}
                </button>
              </div>
            )}
          </div>

          {/* Widget settings */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Widget Settings</p>
            </div>
            <div className="divide-y" style={{ borderColor: "oklch(0.94 0.010 78)" }}>
              <ToggleRow label="Show on all pages"   desc="Widget appears site-wide"            value={anemone.showOnAllPages}    onChange={v => { updateAnemone("showOnAllPages", v);    addToast(v ? "Widget enabled site-wide" : "Widget restricted", "info"); }} />
              <ToggleRow label="Auto-open on drops"  desc="Opens chat when a drop is live"      value={anemone.autoOpenOnDrops}   onChange={v => { updateAnemone("autoOpenOnDrops", v);   addToast(v ? "Auto-open on drops enabled" : "Auto-open disabled", "info"); }} />
              <ToggleRow label="Idle notifications"  desc="Shows hint bubbles after 9s idle"    value={anemone.idleNotifications} onChange={v => { updateAnemone("idleNotifications", v); addToast(v ? "Idle notifications on" : "Idle notifications off", "info"); }} />
              <ToggleRow label="Mobile visibility"   desc="Show widget on mobile devices"       value={anemone.mobileVisibility}  onChange={v => { updateAnemone("mobileVisibility", v);  addToast(v ? "Shown on mobile" : "Hidden on mobile", "info"); }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
