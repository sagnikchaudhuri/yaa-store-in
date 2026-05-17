const stats = [
  { num: "2.4K+", label: "Community Fans" },
  { num: "500+", label: "Products Curated" },
  { num: "40+", label: "Anime Series" },
  { num: "12+", label: "Exclusive Drops" },
];

const pillars = [
  { n: "01", label: "Premium Quality", desc: "Curated, not mass-produced. Every piece earns its place." },
  { n: "02", label: "Fandom-First", desc: "We buy what we love. We sell what we'd collect ourselves." },
  { n: "03", label: "Limited Drops", desc: "Scarcity is intentional. Collector value is the point." },
  { n: "04", label: "AI-Powered", desc: "Anemone knows the culture. She'll find your next obsession." },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative py-16 md:py-28 overflow-hidden"
      style={{ background: "oklch(0.95 0.016 78)" }}
    >
      {/* Ghost section number — background decoration */}
      <div
        className="absolute -top-12 -right-8 font-heading font-black leading-none text-foreground/[0.04] select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "clamp(8rem, 22vw, 22rem)" }}
      >
        02
      </div>

      {/* ── Manga overlay ───────────────────────────────────────────
           Warm cream bg → multiply blend works perfectly.
           Screentone fills the ghost-number zone, two tilted panel
           frames echo the editorial grid, one partial frame crops in
           from the right — like a page that keeps going.              */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{ mixBlendMode: "multiply" }}
      >
        <defs>
          <pattern id="about-screentone" x="0" y="0" width="7" height="7"
            patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="7"
              stroke="oklch(0.18 0.008 260)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Screentone fill — top-right zone behind the ghost "02" */}
        <rect
          x="840" y="-20"
          width="620" height="380"
          fill="url(#about-screentone)"
          opacity="0.30"
        />

        {/* Left panel frame — anchors the brand story column, +0.7° */}
        <rect
          x="28" y="90"
          width="580" height="540"
          stroke="oklch(0.18 0.008 260)"
          strokeWidth="1.0" fill="none"
          opacity="0.055"
          transform="rotate(0.7 318 360)"
        />

        {/* Right panel frame — pillars column, –1.1°, partial crop */}
        <rect
          x="760" y="70"
          width="580" height="500"
          stroke="oklch(0.18 0.008 260)"
          strokeWidth="0.8" fill="none"
          opacity="0.042"
          transform="rotate(-1.1 1050 320)"
        />

        {/* Thin horizontal register mark — top of content area */}
        <line
          x1="28" y1="92"
          x2="220" y2="92"
          stroke="oklch(0.18 0.008 260)"
          strokeWidth="0.5"
          opacity="0.05"
        />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-10 md:mb-16">
          <div className="h-px w-10 bg-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            About YAA Store
          </span>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 xl:gap-24 items-start">

          {/* ── Left: Brand story ─────────────────── */}
          <div className="space-y-7 md:space-y-10">

            {/* Heading */}
            <h2 className="font-heading font-black text-5xl md:text-6xl xl:text-7xl leading-[0.86] tracking-tight">
              Born from
              <br />
              <span className="text-gradient-brand">fandom.</span>
            </h2>

            {/* Pullquote */}
            <blockquote className="pl-5 border-l-[3px] border-primary">
              <p
                className="font-heading text-xl sm:text-2xl leading-snug text-foreground"
                style={{ fontStyle: "italic" }}
              >
                &ldquo;Not a marketplace.
                <br />A fandom that ships boxes.&rdquo;
              </p>
            </blockquote>

            {/* Copy */}
            <p className="text-muted-foreground text-base leading-relaxed max-w-lg">
              YAA Store was built because anime culture deserves better than
              generic merch sites. Every piece is chosen with intention.
              Every drop celebrates a series we actually love.
            </p>

            {/* Stats — editorial list with expanding rule */}
            <div className="space-y-5 pt-2">
              {stats.map(({ num, label }) => (
                <div key={label} className="flex items-center gap-4 group">
                  <span className="font-heading font-black text-4xl text-foreground leading-none w-28 shrink-0">
                    {num}
                  </span>
                  <div className="flex-1 h-px bg-foreground/10 group-hover:bg-primary/50 transition-colors duration-300" />
                  <span className="text-sm text-muted-foreground text-right shrink-0 w-36">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Brand pillars — editorial list ─ */}
          <div className="lg:pt-2">
            {pillars.map(({ n, label, desc }) => (
              <div
                key={n}
                className="group flex items-start gap-6 py-7 border-b border-foreground/8 last:border-0 first:pt-0 hover:bg-foreground/[0.02] -mx-4 px-4 rounded-xl transition-colors duration-150"
              >
                <span className="font-heading font-bold text-xs text-primary/45 mt-0.5 shrink-0 w-6 tabular-nums">
                  {n}
                </span>
                <div>
                  <p className="font-heading font-bold text-base text-foreground mb-1.5 group-hover:text-primary transition-colors duration-150">
                    {label}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
