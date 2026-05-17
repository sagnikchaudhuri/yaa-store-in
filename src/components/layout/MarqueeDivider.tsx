const TICKER_TEXT =
  "LIMITED DROPS  ×  COLLECTOR CULTURE  ×  ANIME MERCH  ×  FANDOM FIRST  ×  PREMIUM QUALITY  ×  NEW ARRIVALS  ×  ";

export default function MarqueeDivider() {
  const block = TICKER_TEXT.repeat(6);

  return (
    <div
      className="overflow-hidden py-3.5 select-none"
      style={{ background: "oklch(0.68 0.19 44)" }}
      aria-hidden="true"
    >
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="shrink-0 font-heading font-bold text-sm uppercase tracking-[0.18em] text-white/90 px-3">
          {block}
        </span>
        <span
          className="shrink-0 font-heading font-bold text-sm uppercase tracking-[0.18em] text-white/90 px-3"
          aria-hidden="true"
        >
          {block}
        </span>
      </div>
    </div>
  );
}
