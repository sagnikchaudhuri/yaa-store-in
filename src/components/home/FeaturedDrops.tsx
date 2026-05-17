import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { MOCK_DROPS } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Drop } from "@/lib/types";

const dropEmojis: Record<string, string> = { "1": "⚡", "2": "🎌", "3": "🔥" };
const editions: Record<string, string> = { "1": "No. 001", "2": "No. 002", "3": "No. 003" };

const releaseLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function BigDropCard({ drop }: { drop: Drop }) {
  return (
    <div
      className="group relative flex flex-col h-full rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: "#1A1614", border: "1px solid oklch(1 0 0 / 0.06)" }}
    >
      {/* Manga brackets — diagonal corners only */}
      <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-primary/55 z-10 pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-primary/55 z-10 pointer-events-none" />

      {/* Visual area */}
      <div
        className="relative flex-1 min-h-[300px] flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, oklch(0.68 0.19 44 / 0.20) 0%, oklch(0.14 0.008 260) 55%, oklch(0.47 0.22 22 / 0.16) 100%)",
        }}
      >
        {/* Glow orb */}
        <div
          className="absolute w-60 h-60 rounded-full blur-3xl"
          style={{ background: "oklch(0.68 0.19 44 / 0.24)" }}
        />

        {/* Ghost series text */}
        <div
          className="absolute inset-0 flex items-center justify-center font-heading font-black text-white/[0.04] leading-none select-none"
          style={{ fontSize: "7rem" }}
        >
          {dropEmojis[drop.id] ?? ""}
        </div>

        <span className="relative text-9xl select-none group-hover:scale-110 transition-transform duration-500 z-10">
          {dropEmojis[drop.id] ?? "📦"}
        </span>

        {/* Status badge */}
        <div className="absolute top-5 left-5">
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border",
              drop.isLive
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-primary/15 text-primary border-primary/25"
            )}
          >
            {drop.isLive ? "Live Now" : "Upcoming"}
          </span>
        </div>

        {/* Edition number — bottom right */}
        <div className="absolute bottom-4 right-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            {editions[drop.id] ?? ""}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-7" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}>
        <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] mb-3">
          ★ Limited Run
        </p>
        <h3 className="font-heading font-black text-white text-2xl xl:text-3xl leading-tight mb-2.5">
          {drop.name}
        </h3>
        <p className="text-white/40 text-sm leading-relaxed mb-6 line-clamp-2">
          {drop.description}
        </p>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-xs text-white/35">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {releaseLabel(drop.releaseDate)}
          </div>
          {drop.registeredCount && (
            <div className="flex items-center gap-1.5 text-xs text-white/35">
              <Users className="h-3 w-3" />
              {drop.registeredCount.toLocaleString()} registered
            </div>
          )}
        </div>

        <Link
          href="/#drops-signup"
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full rounded-xl font-bold gap-2 justify-center"
          )}
        >
          Register for Access
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function SmallDropCard({ drop }: { drop: Drop }) {
  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden shadow-xl flex-1"
      style={{ background: "#1A1614", border: "1px solid oklch(1 0 0 / 0.06)" }}
    >
      {/* Visual */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, oklch(0.47 0.22 22 / 0.22) 0%, oklch(0.14 0.008 260) 55%, oklch(0.68 0.19 44 / 0.12) 100%)",
        }}
      >
        <div
          className="absolute w-32 h-32 rounded-full blur-3xl"
          style={{ background: "oklch(0.47 0.22 22 / 0.28)" }}
        />
        <span className="relative text-6xl select-none group-hover:scale-110 transition-transform duration-500 z-10">
          {dropEmojis[drop.id] ?? "📦"}
        </span>

        {/* Status */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
              drop.isLive
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-accent/20 text-accent border-accent/25"
            )}
          >
            {drop.isLive ? "Live" : "Upcoming"}
          </span>
        </div>

        {/* Edition */}
        <div className="absolute bottom-2.5 right-3.5">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
            {editions[drop.id] ?? ""}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}>
        <h3 className="font-heading font-bold text-white text-base leading-tight mb-1.5">
          {drop.name}
        </h3>
        <p className="text-white/38 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
          {drop.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {releaseLabel(drop.releaseDate)}
            {drop.registeredCount && (
              <span className="ml-0.5 text-white/20">
                · {drop.registeredCount.toLocaleString()}
              </span>
            )}
          </div>
          <Link
            href="/#drops-signup"
            className="text-xs font-bold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
          >
            Register <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedDrops() {
  const [big, ...rest] = MOCK_DROPS;

  return (
    <section className="relative py-20 overflow-hidden" style={{ background: "#100E0C" }}>

      {/* Ghost "01" decoration */}
      <div
        className="absolute -top-10 -left-6 font-heading font-black leading-none text-white/[0.025] select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "clamp(8rem, 22vw, 22rem)" }}
      >
        01
      </div>

      {/* ── Manga overlay: page-composition panel grid ─────────────
           Suggests a manga page's panel structure — the large card on the
           left mirrors a wide panel, the two small cards mirror side panels.
           White strokes on near-black blend in like ink on paper.          */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block animate-manga-drift"
        viewBox="0 0 1440 960"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* Left wide panel — mirrors the BigDropCard column, -0.6° lean */}
        <rect
          x="18" y="170"
          width="800" height="750"
          stroke="white" strokeWidth="0.9" fill="none"
          opacity="0.028"
          transform="rotate(-0.6 418 545)"
        />
        {/* Upper right panel — mirrors SmallDropCard top */}
        <rect
          x="844" y="170"
          width="574" height="360"
          stroke="white" strokeWidth="0.7" fill="none"
          opacity="0.024"
        />
        {/* Lower right panel — mirrors SmallDropCard bottom */}
        <rect
          x="844" y="555"
          width="574" height="365"
          stroke="white" strokeWidth="0.7" fill="none"
          opacity="0.024"
        />
        {/* Horizontal rule separating section header from drop grid */}
        <line
          x1="0" y1="168" x2="1440" y2="168"
          stroke="white" strokeWidth="0.5"
          opacity="0.022"
        />
        {/* Diagonal screentone strip in the ghost "01" zone — top-left */}
        <rect
          x="-10" y="-10"
          width="440" height="320"
          fill="url(#drops-screentone)"
          opacity="0.28"
        />
        <defs>
          <pattern id="drops-screentone" x="0" y="0" width="8" height="8"
            patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8"
              stroke="white" strokeWidth="0.45" />
          </pattern>
        </defs>
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Featured Drops
              </span>
            </div>
            <h2
              className="font-heading font-black text-white leading-[0.86] tracking-tight"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}
            >
              The drops
              <br />
              that matter
              <span className="text-primary">.</span>
            </h2>
          </div>
          <Link
            href="/#drops-signup"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:flex gap-2 font-semibold rounded-xl border-white/12 text-white/50 hover:text-white hover:border-white/25"
            )}
          >
            Register now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Editorial grid */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex flex-col lg:w-[57%]">
            <BigDropCard drop={big} />
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col lg:w-[43%] gap-4">
            {rest.map((drop) => (
              <SmallDropCard key={drop.id} drop={drop} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
