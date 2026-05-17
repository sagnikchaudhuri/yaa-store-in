"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Zap, MessageCircle, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MarqueeDivider from "@/components/layout/MarqueeDivider";
import { MOCK_DROPS } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Product, ProductCategory } from "@/lib/types";
import type { DashboardProduct } from "@/lib/dashboard-data";

// ── WhatsApp config ─────────────────────────────────────────────
// Placeholder number — replace with Meta WhatsApp Business API
// integration when ready. The number and message template are
// intentionally centralised here so a single change wires up the API.
const WA_NUMBER = "2348000000000"; // TODO: replace with live business number
function buildWaUrl(productName: string): string {
  const short = productName.includes(" — ")
    ? productName.split(" — ").slice(1).join(" — ")
    : productName;
  const msg = `Hi, I'm interested in ${short} from YAA Store.`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// ── Series filter definitions ──────────────────────────────────
const SERIES_FILTERS = [
  { id: "all",            label: "All Drops",     emoji: "✦" },
  { id: "Naruto",         label: "Naruto",         emoji: "🍃" },
  { id: "One Piece",      label: "One Piece",      emoji: "🏴‍☠️" },
  { id: "Jujutsu Kaisen", label: "JJK",            emoji: "⚡" },
  { id: "Demon Slayer",   label: "Demon Slayer",   emoji: "🔥" },
  { id: "Bleach",         label: "Bleach",         emoji: "⚔️" },
  { id: "Chainsaw Man",   label: "Chainsaw Man",   emoji: "🪚" },
  { id: "Studio Ghibli",  label: "Studio Ghibli",  emoji: "🌿" },
] as const;

type SeriesId = (typeof SERIES_FILTERS)[number]["id"];

// ── Per-series visual config ───────────────────────────────────
const SERIES_CONFIG: Record<string, { emoji: string; glow: string; badge: string; bg: string }> = {
  "Naruto":         { emoji: "🍃", glow: "oklch(0.72 0.16 130 / 0.30)", badge: "oklch(0.62 0.16 130)", bg: "oklch(0.72 0.16 130 / 0.12)" },
  "One Piece":      { emoji: "🏴‍☠️", glow: "oklch(0.65 0.18 38 / 0.30)",  badge: "oklch(0.65 0.18 38)",  bg: "oklch(0.65 0.18 38 / 0.12)" },
  "Jujutsu Kaisen": { emoji: "⚡", glow: "oklch(0.68 0.19 44 / 0.30)",  badge: "oklch(0.68 0.19 44)",  bg: "oklch(0.68 0.19 44 / 0.12)" },
  "Demon Slayer":   { emoji: "🔥", glow: "oklch(0.55 0.22 22 / 0.30)",  badge: "oklch(0.55 0.22 22)",  bg: "oklch(0.55 0.22 22 / 0.12)" },
  "Bleach":         { emoji: "⚔️", glow: "oklch(0.58 0.10 240 / 0.30)", badge: "oklch(0.58 0.10 240)", bg: "oklch(0.58 0.10 240 / 0.12)" },
  "Chainsaw Man":   { emoji: "🪚", glow: "oklch(0.50 0.20 15 / 0.30)",  badge: "oklch(0.50 0.20 15)",  bg: "oklch(0.50 0.20 15 / 0.12)" },
  "Studio Ghibli":  { emoji: "🌿", glow: "oklch(0.62 0.14 155 / 0.30)", badge: "oklch(0.62 0.14 155)", bg: "oklch(0.62 0.14 155 / 0.12)" },
  "Attack on Titan":{ emoji: "⚙️", glow: "oklch(0.55 0.08 60 / 0.30)",  badge: "oklch(0.55 0.08 60)",  bg: "oklch(0.55 0.08 60 / 0.12)" },
};

const DEFAULT_CONFIG = { emoji: "📦", glow: "oklch(0.68 0.19 44 / 0.22)", badge: "oklch(0.68 0.19 44)", bg: "oklch(0.68 0.19 44 / 0.10)" };

const SORT_OPTIONS = [
  { value: "featured",   label: "Featured" },
  { value: "price-asc",  label: "Price: Low–High" },
  { value: "price-desc", label: "Price: High–Low" },
];

// ── Convert DashboardProduct → public Product ──────────────────
// Collections page renders directly from shared store state (state.products)
// so that hide/unhide in the dashboard is immediately reflected here without
// any ID-bridging. Every field has a safe fallback so a malformed product
// (e.g. from corrupt localStorage) never crashes a card.
function dashboardToProduct(p: DashboardProduct): Product {
  const franchise = p.franchise ?? "";
  const name      = p.name      ?? "Untitled Product";
  return {
    id:          p.id ?? String(Math.random()),
    name:        franchise ? `${franchise} — ${name}` : name,
    slug:        name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    price:       typeof p.price === "number" && isFinite(p.price) ? p.price : 0,
    images:      (p.images ?? []).filter(
                   (img): img is string =>
                     typeof img === "string" && img.length > 0 && !img.startsWith("__placeholder")
                 ),
    category:    (p.category ?? "collectibles") as ProductCategory,
    tags:        Array.isArray(p.tags) ? p.tags : [],
    series:      franchise,
    inStock:     typeof p.stock === "number" ? p.stock > 0 : false,
    isFeatured:  !!p.isFeatured,
    isDrop:      !!p.isDrop,
    character:   p.character,
    description: "",
  };
}

function sortProducts(products: Product[], sort: string) {
  switch (sort) {
    case "price-asc":  return [...products].sort((a, b) => a.price - b.price);
    case "price-desc": return [...products].sort((a, b) => b.price - a.price);
    default:           return [...products].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }
}

// ── Page ───────────────────────────────────────────────────────
export default function CollectionsPage() {
  const [activeSeries, setActiveSeries] = useState<SeriesId>("all");
  const [sort, setSort] = useState("featured");
  const [preview, setPreview] = useState<Product | null>(null);

  // ── Public product list: read directly from shared store ────
  // Only "listed" products are shown. This is the single source of truth —
  // hide/unhide in the dashboard is reflected here permanently because the
  // store persists visibility state to localStorage across page refreshes.
  const { state, hydrated } = useStore();
  const listedProducts = useMemo(
    () => state.products
      .filter(p => p.status === "listed")
      .map(dashboardToProduct),
    [state.products]
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        SERIES_FILTERS.map((s) => [
          s.id,
          s.id === "all"
            ? listedProducts.length
            : listedProducts.filter((p) => p.series === s.id).length,
        ])
      ),
    [listedProducts]
  );

  const filtered = useMemo(() => {
    const base =
      activeSeries === "all"
        ? listedProducts
        : listedProducts.filter((p) => p.series === activeSeries);
    return sortProducts(base, sort);
  }, [activeSeries, sort, listedProducts]);

  const activeSeriesConfig =
    activeSeries !== "all" ? SERIES_CONFIG[activeSeries] ?? DEFAULT_CONFIG : null;

  const activeMeta = SERIES_FILTERS.find((s) => s.id === activeSeries);

  return (
    <>
      <Navbar />
      {preview && (
        <ProductPreview product={preview} onClose={() => setPreview(null)} />
      )}
      <main>
        {/* ── 01 Hero ──────────────────────────────────── */}
        <HeroSection />

        <MarqueeDivider />

        {/* ── 02 Product Grid ──────────────────────────── */}
        <section
          className="relative py-16 md:py-20 min-h-[80vh]"
          style={{ background: "oklch(0.97 0.012 80)" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section label */}
            <div className="flex items-center gap-3 mb-10">
              <div className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                The Collection
              </span>
            </div>

            {/* ── Series filter bar ──────────────────────── */}
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
              <div className="flex items-center gap-2 w-max sm:w-auto sm:flex-wrap pb-1 sm:pb-0">
                {SERIES_FILTERS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSeries(s.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all duration-150",
                      activeSeries === s.id
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                        : "bg-transparent text-muted-foreground border-foreground/10 hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    <span className="text-sm leading-none">{s.emoji}</span>
                    {s.label}
                    {counts[s.id] > 0 && (
                      <span
                        className={cn(
                          "text-[10px] font-black rounded-full px-1.5 py-0.5 leading-none",
                          activeSeries === s.id ? "bg-white/20 text-white" : "bg-foreground/8 text-foreground/50"
                        )}
                      >
                        {counts[s.id]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Active series banner ──────────────────── */}
            {activeSeriesConfig && activeMeta && (
              <div
                className="relative rounded-2xl overflow-hidden mb-10"
                style={{ border: "1px solid oklch(0.88 0.015 80)" }}
              >
                {/* Background glow */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(120deg, ${activeSeriesConfig.bg} 0%, transparent 60%)`,
                  }}
                />
                <div className="relative flex items-center gap-6 p-5 sm:p-6">
                  <span className="text-5xl sm:text-6xl flex-shrink-0 drop-shadow-md">
                    {activeSeriesConfig.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-heading font-black text-2xl sm:text-3xl text-foreground leading-tight"
                    >
                      {activeSeries}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {filtered.length} product{filtered.length !== 1 ? "s" : ""} · Curated collection
                    </p>
                  </div>
                  {/* Manga bracket */}
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-foreground/10 hidden sm:block" />
                </div>
              </div>
            )}

            {/* ── Sort row ──────────────────────────────── */}
            <div className="flex items-center justify-between mb-7">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{filtered.length}</span>{" "}
                product{filtered.length !== 1 ? "s" : ""}
                {activeSeries !== "all" && (
                  <span className="text-muted-foreground/60"> · {activeSeries}</span>
                )}
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs border border-foreground/10 rounded-lg px-3 py-1.5 bg-transparent text-foreground outline-none focus:border-primary/40 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Product grid ──────────────────────────── */}
            {/* Hydration guard: don't render products until localStorage is loaded.
                This prevents a flash where hidden products briefly appear before
                the persisted visibility state is applied. Resolves in < 1 frame. */}
            {!hydrated ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl animate-pulse"
                    style={{ height: "22rem", background: "oklch(0.92 0.010 80)" }}
                  />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPreview={() => setPreview(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-28 text-center">
                <p className="text-5xl mb-5">😿</p>
                <p className="font-heading font-black text-foreground text-xl">No products here</p>
                <p className="text-muted-foreground text-sm mt-1.5">
                  {activeSeries !== "all"
                    ? "Drops for this series are incoming. Stay registered."
                    : "Check back soon — new drops are on the way."}
                </p>
                {activeSeries !== "all" && (
                  <button
                    onClick={() => setActiveSeries("all")}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-6 rounded-xl")}
                  >
                    Browse all products
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── 03 Featured Drops ────────────────────────── */}
        <FeaturedDropsSection />

        {/* ── 04 Drop Registration CTA ─────────────────── */}
        <DropRegistrationCTA />
      </main>
      <Footer />
    </>
  );
}

// ── Product Preview Modal ──────────────────────────────────────
type ProductPreviewProps = { product: Product; onClose: () => void };

function ProductPreview({ product, onClose }: ProductPreviewProps) {
  const config = SERIES_CONFIG[product.series ?? ""] ?? DEFAULT_CONFIG;

  const shortName = product.name.includes(" — ")
    ? product.name.split(" — ").slice(1).join(" — ")
    : product.name;

  const waUrl = buildWaUrl(product.name);

  const isSoldOut = !product.inStock;
  const statusLabel = isSoldOut ? "Sold Out" : "Live";
  const statusColor = isSoldOut ? "oklch(0.47 0.22 22)" : "oklch(0.38 0.13 160)";
  const statusBg = isSoldOut ? "oklch(0.47 0.22 22 / 0.10)" : "oklch(0.64 0.14 160 / 0.10)";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — flex column with max height so content scrolls inside */}
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          background: "#fff",
          border: "1px solid oklch(0.88 0.015 80)",
          maxHeight: "90dvh",
        }}
      >
        {/* Close button — sits above scrollable area so it is always reachable */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ background: "oklch(0.95 0.008 78)" }}
          aria-label="Close preview"
        >
          <X className="h-4 w-4 text-foreground/60" />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">

          {/* Visual hero */}
          <div
            className="relative h-44 sm:h-52 flex items-center justify-center overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, oklch(0.93 0.020 78) 0%, oklch(0.96 0.014 78) 50%, oklch(0.91 0.024 75) 100%)",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(145deg, ${config.bg} 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute w-40 h-40 rounded-full blur-3xl"
              style={{ background: config.glow }}
            />
            <span className="relative text-8xl select-none z-10 drop-shadow-sm">
              {config.emoji}
            </span>
            {product.character && (
              <div
                className="absolute inset-0 flex items-center justify-center font-heading font-black text-foreground/[0.04] leading-none select-none pointer-events-none uppercase"
                style={{ fontSize: "4rem" }}
              >
                {product.character.split(" ")[0]}
              </div>
            )}
            {/* Status badge — top left */}
            <div className="absolute top-3 left-3 z-10">
              <span
                className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border leading-none"
                style={{
                  background: statusBg,
                  color: statusColor,
                  borderColor: `${statusColor}30`,
                }}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Series + name */}
            <div>
              {product.series && (
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
                  style={{ color: config.badge }}
                >
                  {product.series}
                </p>
              )}
              <h2 className="font-heading font-black text-xl text-foreground leading-tight">
                {shortName}
              </h2>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-2">
              {product.character && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
                    Character
                  </p>
                  <p className="text-foreground font-medium text-xs">{product.character}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
                  Category
                </p>
                <p className="text-foreground font-medium text-xs capitalize">{product.category}</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Price row */}
            <div
              className="flex items-center justify-between pt-3"
              style={{ borderTop: "1px solid oklch(0.92 0.014 80)" }}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-black text-2xl text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: statusBg, color: statusColor }}
              >
                {statusLabel}
              </span>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="h-4 w-4" />
              Inquire on WhatsApp
            </a>

            {/* Disclaimer */}
            <p className="text-[10px] text-muted-foreground/50 text-center leading-relaxed">
              WhatsApp inquiry — our team responds within 24 hours.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────
function ProductCard({
  product,
  onPreview,
}: {
  product: Product;
  onPreview: () => void;
}) {
  const config = SERIES_CONFIG[product.series ?? ""] ?? DEFAULT_CONFIG;

  const shortName = product.name.includes(" — ")
    ? product.name.split(" — ").slice(1).join(" — ")
    : product.name;

  // Only show status-relevant badges (no "Special Drops" / "New Drop" / "Limited Drop")
  const statusBadge =
    !product.inStock ? "Sold Out" :
    product.badge === "Sold Out" ? "Sold Out" :
    null;

  const waUrl = buildWaUrl(product.name);

  return (
    <div
      id={product.id === "1" ? "collection" : undefined}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer"
      style={{
        background: "#fff",
        border: "1px solid oklch(0.88 0.015 80)",
        boxShadow: "0 2px 10px oklch(0 0 0 / 0.055)",
      }}
      onClick={onPreview}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPreview()}
      aria-label={`View details for ${shortName}`}
    >
      {/* ── Visual area ────────────────────────────────── */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.93 0.020 78) 0%, oklch(0.96 0.014 78) 50%, oklch(0.91 0.024 75) 100%)",
        }}
      >
        {/* Series tint gradient */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(145deg, ${config.bg} 0%, transparent 70%)`,
          }}
        />

        {/* Glow orb — appears on hover */}
        <div
          className="absolute w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: config.glow }}
        />

        {/* Main emoji */}
        <span className="relative text-7xl select-none group-hover:scale-110 transition-transform duration-500 z-10 drop-shadow-sm">
          {config.emoji}
        </span>

        {/* Ghost character name background art */}
        {product.character && (
          <div
            className="absolute inset-0 flex items-center justify-center font-heading font-black text-foreground/[0.04] leading-none select-none pointer-events-none uppercase"
            style={{ fontSize: "3.5rem" }}
          >
            {product.character.split(" ")[0]}
          </div>
        )}

        {/* Series badge — top left */}
        {product.series && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full leading-none"
              style={{
                background: `${config.badge}18`,
                color: config.badge,
                border: `1px solid ${config.badge}30`,
              }}
            >
              {product.series === "Jujutsu Kaisen"
                ? "JJK"
                : product.series === "Attack on Titan"
                ? "AoT"
                : product.series === "Studio Ghibli"
                ? "Ghibli"
                : product.series === "Chainsaw Man"
                ? "CSM"
                : product.series}
            </span>
          </div>
        )}

        {/* Status badge — top right (Sold Out only) */}
        {statusBadge && (
          <div className="absolute top-3 right-3 z-10">
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border leading-none bg-foreground/8 text-foreground/40 border-foreground/12">
              {statusBadge}
            </span>
          </div>
        )}

        {/* Sold out overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/55 flex items-center justify-center z-20">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/35">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* ── Info area ──────────────────────────────────── */}
      <div
        className="p-4 flex flex-col flex-1"
        style={{ borderTop: "1px solid oklch(0.90 0.014 80)" }}
      >
        {/* Series label */}
        {product.series && (
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: config.badge }}
          >
            {product.series}
          </p>
        )}

        {/* Product name */}
        <h3 className="font-heading font-bold text-sm text-foreground leading-tight mb-0.5">
          {shortName}
        </h3>

        {/* Character reference */}
        {product.character && (
          <p className="text-[11px] text-muted-foreground italic mb-1 leading-snug">
            {product.character}
          </p>
        )}

        {/* Tags */}
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
              style={{ background: "oklch(0.93 0.018 78)", color: "oklch(0.45 0.012 260)" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price row */}
        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: "1px solid oklch(0.92 0.014 80)" }}
        >
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-black text-base text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          <button
            disabled={!product.inStock}
            aria-label="Save to wishlist"
            className={cn(
              "p-2 rounded-xl transition-all duration-150",
              product.inStock
                ? "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                : "text-foreground/15 cursor-not-allowed"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {/* WhatsApp inquiry button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl border transition-colors hover:opacity-90"
          style={{
            background: product.inStock ? "#25D36612" : "oklch(0.95 0.008 78)",
            color: product.inStock ? "#128C7E" : "oklch(0.55 0.05 260)",
            borderColor: product.inStock ? "#25D36630" : "oklch(0.88 0.015 80)",
          }}
          aria-label={`WhatsApp inquiry for ${shortName}`}
        >
          <MessageCircle className="h-3 w-3" />
          {product.inStock ? "Inquire on WhatsApp" : "Ask about restock"}
        </a>
      </div>
    </div>
  );
}

// ── Hero Section ───────────────────────────────────────────────
function HeroSection() {
  const SERIES_GRID = [
    { emoji: "🍃", label: "Naruto" },
    { emoji: "🏴‍☠️", label: "One Piece" },
    { emoji: "⚡", label: "JJK" },
    { emoji: "🔥", label: "Demon Slayer" },
    { emoji: "⚔️", label: "Bleach" },
    { emoji: "🪚", label: "CSM" },
  ];

  return (
    <section
      className="relative overflow-hidden py-16 md:py-28"
      style={{ background: "#100E0C" }}
    >
      {/* Atmospheric glows */}
      <div
        className="absolute -top-24 right-0 w-[700px] h-[600px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: "oklch(0.68 0.19 44 / 0.12)" }}
      />
      <div
        className="absolute bottom-0 -left-32 w-[500px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: "oklch(0.47 0.22 22 / 0.10)" }}
      />
      <div className="absolute inset-0 bg-halftone opacity-[0.28] pointer-events-none" />

      {/* Ghost "VAULT" watermark */}
      <div
        className="absolute -bottom-8 -right-4 font-heading font-black leading-none text-white/[0.025] select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "clamp(7rem, 20vw, 20rem)" }}
      >
        VAULT
      </div>

      {/* Scattered ★ */}
      <span className="absolute top-[26%] left-[43%] text-primary text-xl hidden lg:block select-none pointer-events-none">★</span>
      <span className="absolute top-[62%] left-[30%] text-primary/20 text-sm hidden lg:block select-none pointer-events-none">★</span>
      <span className="absolute top-[40%] right-[21%] text-accent/30 text-xs hidden lg:block select-none pointer-events-none">★</span>

      {/* Left editorial strip */}
      <div className="absolute left-0 top-0 bottom-0 hidden lg:flex items-center justify-center w-11 border-r border-white/[0.06] z-10 pointer-events-none">
        <span
          className="text-[9px] font-bold uppercase text-white/20 tracking-[0.38em] select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          YAA STORE × COLLECTOR VAULT × 2025
        </span>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-20">
        <div className="grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-12 xl:gap-16 items-center">

          {/* Left: Headline */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-px w-10 bg-primary flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-[0.08em] sm:tracking-[0.25em] text-primary flex items-center gap-1.5 min-w-0 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                Anime Merch × Collector Culture
              </span>
            </div>

            <h1 className="font-heading font-black tracking-tight leading-[0.84]">
              <span className="block text-white" style={{ fontSize: "clamp(4rem, 9.5vw, 8rem)" }}>
                SHOP
              </span>
              <span className="block text-white" style={{ fontSize: "clamp(4rem, 9.5vw, 8rem)" }}>
                THE
              </span>
              <span className="block text-gradient-brand" style={{ fontSize: "clamp(4rem, 9.5vw, 8rem)" }}>
                VAULT.
              </span>
            </h1>

            <p className="text-lg text-white/45 leading-relaxed max-w-md">
              Premium anime merch. Drop-first culture.
              <br />
              Every piece is curated, limited, and earned.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-5 flex-wrap pt-1">
              <div>
                <span className="font-heading font-black text-3xl text-white">500+</span>
                <span className="text-sm text-white/35 ml-1.5">products</span>
              </div>
              <span className="text-primary/35 text-base select-none">★</span>
              <div>
                <span className="font-heading font-black text-3xl text-white">40+</span>
                <span className="text-sm text-white/35 ml-1.5">series</span>
              </div>
              <span className="text-primary/35 text-base select-none">★</span>
              <div>
                <span className="font-heading font-black text-3xl text-white">12+</span>
                <span className="text-sm text-white/35 ml-1.5">exclusive drops</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#collection"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 font-bold rounded-xl px-7 text-base shadow-lg shadow-primary/20"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Browse Collection
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/#drops-signup"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 font-bold rounded-xl px-7 text-base border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-colors"
                )}
              >
                <Zap className="h-4 w-4" />
                Register for Drops
              </Link>
            </div>
          </div>

          {/* Right: Series showcase card */}
          <div className="hidden lg:block">
            <div
              className="relative rounded-3xl overflow-hidden p-6"
              style={{ background: "#1A1614", border: "1px solid oklch(1 0 0 / 0.07)" }}
            >
              {/* Manga brackets */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-primary/55 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-primary/55 pointer-events-none" />

              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
                  Current Series
                </p>
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60 bg-primary/10 border border-primary/15 px-2.5 py-1 rounded-full">
                  40+ Series
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {SERIES_GRID.map((s) => (
                  <div
                    key={s.label}
                    className="group/cell flex flex-col items-center gap-2 py-4 rounded-xl cursor-default transition-all duration-200 hover:scale-105"
                    style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.04)" }}
                  >
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/30 group-hover/cell:text-white/60 transition-colors">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="flex items-center justify-between pt-4"
                style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-white/35">3 drops incoming</span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                  YAA VAULT
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── Featured Drops Section ─────────────────────────────────────
function FeaturedDropsSection() {
  const DROP_EMOJIS: Record<string, string> = { "1": "⚡", "2": "🎌", "3": "🔥" };

  const releaseLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const daysUntil = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: "#100E0C" }}
    >
      {/* Ghost section number */}
      <div
        className="absolute -top-10 -right-6 font-heading font-black leading-none text-white/[0.025] select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "clamp(8rem, 22vw, 22rem)" }}
      >
        03
      </div>

      {/* Atmosphere */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[400px] blur-[130px] pointer-events-none"
        style={{ background: "oklch(0.68 0.19 44 / 0.09)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[300px] blur-[110px] pointer-events-none"
        style={{ background: "oklch(0.47 0.22 22 / 0.08)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.25em] text-primary">
                Upcoming Drops
              </span>
            </div>
            <h2
              className="font-heading font-black text-white leading-[0.86] tracking-tight"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)" }}
            >
              Don&apos;t miss
              <br />
              the drop
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

        {/* Drop cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {MOCK_DROPS.map((drop, i) => (
            <div
              key={drop.id}
              className="group relative flex flex-col rounded-2xl overflow-hidden"
              style={{ background: "#1A1614", border: "1px solid oklch(1 0 0 / 0.06)" }}
            >
              {/* Visual */}
              <div
                className="relative h-44 flex items-center justify-center overflow-hidden"
                style={{
                  background:
                    i % 2 === 0
                      ? "linear-gradient(140deg, oklch(0.68 0.19 44 / 0.22) 0%, oklch(0.14 0.008 260) 65%)"
                      : "linear-gradient(140deg, oklch(0.47 0.22 22 / 0.24) 0%, oklch(0.14 0.008 260) 65%)",
                }}
              >
                <div
                  className="absolute w-32 h-32 rounded-full blur-3xl"
                  style={{
                    background:
                      i % 2 === 0
                        ? "oklch(0.68 0.19 44 / 0.28)"
                        : "oklch(0.47 0.22 22 / 0.30)",
                  }}
                />
                <span className="relative text-6xl select-none group-hover:scale-110 transition-transform duration-500 z-10">
                  {DROP_EMOJIS[drop.id] ?? "📦"}
                </span>

                {/* Status */}
                <div className="absolute top-3 left-3">
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                      drop.isLive
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-primary/15 text-primary border-primary/25"
                    )}
                  >
                    {drop.isLive ? "Live Now" : "Upcoming"}
                  </span>
                </div>

                {/* Edition number */}
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/22">
                    No. 00{i + 1}
                  </span>
                </div>

                {/* Manga brackets */}
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary/40 pointer-events-none" />
              </div>

              {/* Info */}
              <div
                className="p-5 flex flex-col flex-1"
                style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}
              >
                <p className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                  ★ Limited Run
                </p>
                <h3 className="font-heading font-bold text-white text-sm leading-snug mb-2 flex-1">
                  {drop.name}
                </h3>

                {/* Date + days countdown */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-white/35">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    {releaseLabel(drop.releaseDate)}
                  </div>
                  <span className="text-[10px] font-bold text-white/25">
                    {daysUntil(drop.releaseDate)}d away
                  </span>
                </div>

                {drop.registeredCount && (
                  <p className="text-[10px] text-white/25 mb-4">
                    {drop.registeredCount.toLocaleString()} already registered
                  </p>
                )}

                <Link
                  href="/#drops-signup"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "w-full rounded-xl font-bold gap-2 justify-center text-xs"
                  )}
                >
                  Register for Access
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Drop Registration CTA ──────────────────────────────────────
function DropRegistrationCTA() {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-24 text-center"
      style={{ background: "oklch(0.95 0.016 78)", borderTop: "1px solid oklch(0.88 0.015 80)" }}
    >
      {/* Ghost word */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-heading font-black leading-none text-foreground/[0.035] select-none pointer-events-none whitespace-nowrap hidden lg:block"
        style={{ fontSize: "clamp(6rem, 16vw, 16rem)" }}
      >
        ACCESS
      </div>

      <div className="relative max-w-lg mx-auto px-4">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary mb-5">
          ★ First Access · Always
        </p>
        <h2
          className="font-heading font-black text-foreground leading-[0.88] tracking-tight mb-5"
          style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)" }}
        >
          Want to know
          <br />
          before anyone
          <span className="text-primary">?</span>
        </h2>
        <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-sm mx-auto">
          Register your number. Get the drop alert 24 hours before it goes live.
          No spam. Just drops.
        </p>
        <Link
          href="/#drops-signup"
          className={cn(
            buttonVariants({ size: "lg" }),
            "gap-2.5 rounded-xl font-bold px-9 shadow-xl shadow-primary/20 hover:shadow-primary/35 transition-shadow"
          )}
        >
          <Zap className="h-4 w-4" />
          Register for Early Access
        </Link>
        <p className="text-muted-foreground/40 text-xs mt-5">
          Free · No spam · Drop alerts only · Unsubscribe anytime
        </p>
      </div>
    </section>
  );
}
