import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[88vh] flex items-center overflow-hidden bg-background">

      {/* ── Atmosphere ────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none select-none">

        {/* Radial glows — unchanged */}
        <div
          className="absolute -top-40 right-0 w-[760px] h-[760px] rounded-full blur-[140px]"
          style={{ background: "oklch(0.68 0.19 44 / 0.13)" }}
        />
        <div
          className="absolute bottom-0 -left-32 w-[540px] h-[540px] rounded-full blur-[120px]"
          style={{ background: "oklch(0.47 0.22 22 / 0.10)" }}
        />

        {/* Halftone grain */}
        <div className="absolute inset-0 bg-halftone opacity-[0.30]" />

        {/* ── Manga speed lines ─────────────────────
             SVG mask confines lines to the right 45% of the section —
             the typography column stays completely clean.
             Opacity held at 0.038 so lines read as atmosphere, not noise. */}
        <svg
          className="absolute inset-0 w-full h-full hidden md:block animate-manga-fade"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          style={{ opacity: 0.038, mixBlendMode: "multiply" }}
        >
          <defs>
            {/* Mask: black = hide, white = show. Left 55% hidden → lines only right side */}
            <linearGradient id="hero-speed-fade" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="black" />
              <stop offset="50%"  stopColor="black" />
              <stop offset="72%"  stopColor="white" />
              <stop offset="100%" stopColor="white" />
            </linearGradient>
            <mask id="hero-speed-mask">
              <rect width="1440" height="900" fill="url(#hero-speed-fade)" />
            </mask>
          </defs>
          <g stroke="oklch(0.18 0.008 260)" fill="none" mask="url(#hero-speed-mask)">
            <line x1="1090" y1="55" x2="0"    y2="900" strokeWidth="1.0" />
            <line x1="1090" y1="55" x2="0"    y2="700" strokeWidth="0.45"/>
            <line x1="1090" y1="55" x2="0"    y2="500" strokeWidth="0.8" />
            <line x1="1090" y1="55" x2="0"    y2="300" strokeWidth="0.4" />
            <line x1="1090" y1="55" x2="0"    y2="100" strokeWidth="0.55"/>
            <line x1="1090" y1="55" x2="0"    y2="0"   strokeWidth="0.4" />
            <line x1="1090" y1="55" x2="250"  y2="0"   strokeWidth="0.45"/>
            <line x1="1090" y1="55" x2="480"  y2="0"   strokeWidth="0.7" />
            <line x1="1090" y1="55" x2="700"  y2="0"   strokeWidth="0.4" />
            <line x1="1090" y1="55" x2="880"  y2="0"   strokeWidth="0.55"/>
            <line x1="1090" y1="55" x2="980"  y2="0"   strokeWidth="0.35"/>
            <line x1="1090" y1="55" x2="1440" y2="220" strokeWidth="0.45"/>
            <line x1="1090" y1="55" x2="1440" y2="430" strokeWidth="0.65"/>
            <line x1="1090" y1="55" x2="1440" y2="640" strokeWidth="0.4" />
            <line x1="1090" y1="55" x2="1440" y2="850" strokeWidth="0.7" />
            <line x1="1090" y1="55" x2="1280" y2="900" strokeWidth="0.45"/>
            <line x1="1090" y1="55" x2="1060" y2="900" strokeWidth="0.35"/>
            <line x1="1090" y1="55" x2="820"  y2="900" strokeWidth="0.55"/>
            <line x1="1090" y1="55" x2="580"  y2="900" strokeWidth="0.4" />
          </g>
        </svg>

        {/* ── Manga panel frames ────────────────────
             Subtle framing rects — opacities reduced so they read as
             depth/composition cues rather than competing elements.     */}
        <svg
          className="absolute inset-0 w-full h-full hidden lg:block animate-manga-drift"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {/* Large panel — wraps right content zone */}
          <rect
            x="748" y="22" width="572" height="430"
            stroke="oklch(0.18 0.008 260)" strokeWidth="1.0" fill="none"
            opacity="0.044"
            transform="rotate(1.2 1034 237)"
          />
          {/* Secondary — bottom-left, partially off-screen */}
          <rect
            x="-80" y="600" width="310" height="190"
            stroke="oklch(0.18 0.008 260)" strokeWidth="0.7" fill="none"
            opacity="0.028"
            transform="rotate(-1.8 75 695)"
          />
          {/* Micro panel — upper-left, barely there */}
          <rect
            x="60" y="86" width="168" height="116"
            stroke="oklch(0.18 0.008 260)" strokeWidth="0.6" fill="none"
            opacity="0.024"
            transform="rotate(0.9 144 144)"
          />
          {/* Asymmetric vertical panel divider */}
          <line
            x1="694" y1="0" x2="661" y2="900"
            stroke="oklch(0.18 0.008 260)" strokeWidth="0.5"
            opacity="0.025"
          />
        </svg>

        {/* Ghost background word */}
        <div
          className="absolute -bottom-4 -right-6 font-heading font-black leading-none whitespace-nowrap hidden lg:block"
          style={{
            fontSize: "clamp(5rem, 19vw, 19rem)",
            color: "oklch(0.18 0.008 260 / 0.030)",
          }}
        >
          FANDOM
        </div>

        {/* Scattered decorative stars */}
        <span className="absolute top-[22%] left-[43%] text-primary text-xl hidden lg:block">★</span>
        <span className="absolute top-[68%] left-[34%] text-primary/20 text-sm hidden lg:block">★</span>
        <span className="absolute top-[35%] right-[27%] text-accent/20 text-xs hidden lg:block">★</span>
        <span className="absolute bottom-[18%] right-[5%] text-primary/12 text-3xl hidden lg:block">★</span>
      </div>

      {/* ── Left editorial strip (lg+) ────────────── */}
      <div className="absolute left-0 top-0 bottom-0 hidden lg:flex items-center justify-center w-11 border-r border-foreground/[0.06] z-10 pointer-events-none">
        <span
          className="text-[9px] font-bold uppercase text-foreground/20 tracking-[0.38em] select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          YAA STORE × ANIME × COLLECTOR × 2025
        </span>
      </div>

      {/* ── Main content ──────────────────────────── */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-20 py-10 sm:py-16 md:py-24">
        <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-10 xl:gap-16 items-center">

          {/* ── Left: Typography column ───────────── */}
          <div>

            {/* Eyebrow label */}
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-px w-10 bg-primary flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-[0.08em] sm:tracking-[0.25em] text-primary flex items-center gap-1.5 min-w-0 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                Anime Merch × Collector Culture
              </span>
            </div>

            {/* Headline — poster scale
                "COLLECTED." is intentionally ~84% of the headline size,
                creating a natural taper in the stacked word composition. */}
            <h1 className="mt-5 font-heading font-black tracking-tight leading-[0.86]">
              <span
                className="block text-foreground"
                style={{ fontSize: "clamp(2.5rem, 9vw, 7.6rem)" }}
              >
                YOUR
              </span>
              <span
                className="block text-foreground"
                style={{ fontSize: "clamp(2.5rem, 9vw, 7.6rem)" }}
              >
                FANDOM,
              </span>
              <span
                className="block text-gradient-brand"
                style={{
                  fontSize: "clamp(2.1rem, 7.6vw, 6.4rem)",
                  letterSpacing: "-0.01em",
                }}
              >
                COLLECTED.
              </span>
            </h1>

            {/* Description — closer to CTAs than to headline */}
            <p className="mt-8 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-[38rem]">
              Premium anime merchandise. Exclusive limited drops.
              An AI companion who lives and breathes the culture.
            </p>

            {/* CTAs — tight to description, they form a single action block */}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/collections"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 font-bold rounded-xl px-7 text-base shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-shadow"
                )}
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#drops-signup"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 font-bold rounded-xl px-7 text-base border-foreground/15 hover:border-primary/40 hover:text-primary transition-colors"
                )}
              >
                <Sparkles className="h-4 w-4" />
                Special Drops
              </Link>
            </div>

            {/* Stats — thin rule grounds them below the action block */}
            <div className="mt-9 pt-7 border-t border-foreground/[0.07] flex items-center gap-5 flex-wrap">
              <div>
                <span className="font-heading font-black text-2xl text-foreground">2.4K+</span>
                <span className="text-sm text-muted-foreground ml-1.5">fans</span>
              </div>
              <span className="text-primary/30 text-sm select-none">★</span>
              <div>
                <span className="font-heading font-black text-2xl text-foreground">500+</span>
                <span className="text-sm text-muted-foreground ml-1.5">products</span>
              </div>
              <span className="text-primary/30 text-sm select-none">★</span>
              <div>
                <span className="font-heading font-black text-2xl text-foreground">40+</span>
                <span className="text-sm text-muted-foreground ml-1.5">series</span>
              </div>
            </div>
          </div>

          {/* ── Right: Collector display card ─────── */}
          <div className="hidden lg:flex items-center justify-end">
            <div className="relative">

              {/* Card */}
              <div
                className="relative w-72 xl:w-80 rounded-3xl overflow-hidden shadow-2xl"
                style={{ background: "#1A1614", border: "1px solid oklch(1 0 0 / 0.07)" }}
              >
                {/* Edition number */}
                <div className="absolute top-3.5 right-4 z-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                    No. 001
                  </span>
                </div>

                {/* Manga corner brackets */}
                <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-primary/55 z-10 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-primary/55 z-10 pointer-events-none" />

                {/* Visual area */}
                <div
                  className="h-64 flex items-center justify-center relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(140deg, oklch(0.68 0.19 44 / 0.22) 0%, oklch(0.14 0.008 260) 50%, oklch(0.47 0.22 22 / 0.18) 100%)",
                  }}
                >
                  <div
                    className="absolute w-52 h-52 rounded-full blur-3xl"
                    style={{ background: "oklch(0.68 0.19 44 / 0.28)" }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center font-heading font-black text-white/[0.04] leading-none select-none"
                    style={{ fontSize: "5rem" }}
                  >
                    OP
                  </div>
                  <span className="relative text-8xl select-none">⚡</span>
                  <div className="absolute top-3 inset-x-0 flex justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45 bg-white/5 border border-white/8 px-3 py-1 rounded-full">
                      One Piece
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}>
                  <p className="font-heading font-black text-white text-lg leading-tight">
                    Gear 5 Luffy Figure
                  </p>
                  <p className="text-white/35 text-xs mt-0.5">Limited 1/8 Scale · 300 units only</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-white/35">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Drop · Jun 15
                    </div>
                    <span className="font-heading font-black text-primary text-lg">₹79.99</span>
                  </div>
                  <div className="mt-3 pt-3 flex items-center justify-between text-xs" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}>
                    <span className="text-white/30">1,247 fans registered</span>
                    <Link href="/#drops-signup" className="text-primary font-semibold hover:text-primary/75 transition-colors">
                      Register →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Floating sticker badges */}
              <div
                className="absolute -top-5 -right-9 text-[10px] font-black uppercase tracking-widest px-3.5 py-2 rounded-2xl shadow-xl rotate-[4deg]"
                style={{ background: "oklch(0.47 0.22 22)", color: "oklch(0.97 0.012 80)" }}
              >
                Limited Run
              </div>
              <div className="absolute -bottom-5 -left-9 bg-card border border-border rounded-2xl px-3 py-2.5 shadow-xl text-xs font-medium flex items-center gap-2 -rotate-[3deg]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Drops in 18 days
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
