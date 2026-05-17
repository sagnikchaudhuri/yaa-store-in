import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const productEmojis: Record<string, string> = {
  figures: "🗿",
  apparel: "👕",
  accessories: "💍",
  collectibles: "🧸",
  posters: "🖼️",
  manga: "📚",
};

function ProductCard({ product }: { product: (typeof MOCK_PRODUCTS)[number] }) {
  const discountPct =
    product.comparePrice
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : null;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden card-hover shadow-sm">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-secondary to-muted flex items-center justify-center overflow-hidden">
        <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-500">
          {productEmojis[product.category] ?? "📦"}
        </span>
        {product.badge && (
          <Badge
            className={`absolute top-2 left-2 font-semibold text-xs border-0 ${
              product.badge === "Sold Out"
                ? "bg-muted-foreground text-background"
                : product.badge === "New Drop"
                ? "bg-accent text-accent-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {product.badge}
          </Badge>
        )}
        {discountPct && (
          <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground font-bold border-0">
            -{discountPct}%
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.series}</p>
        <h3 className="font-heading font-semibold text-sm leading-snug mb-2 line-clamp-2 flex-1">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-bold text-base">
              ₹{product.price.toFixed(2)}
            </span>
            {product.comparePrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant={product.inStock ? "default" : "outline"}
            disabled={!product.inStock}
            className="rounded-xl h-8 px-3 gap-1.5 text-xs font-semibold"
          >
            <ShoppingBag className="h-3 w-3" />
            {product.inStock ? "Add" : "Sold Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts() {
  const featured = MOCK_PRODUCTS.filter((p) => p.isFeatured);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
            Hand-Picked
          </p>
          <h2 className="font-heading font-extrabold text-4xl md:text-5xl">
            Fan Favorites
          </h2>
        </div>
        <Link href="/shop" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:flex gap-2 font-medium")}>
          Browse all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/shop" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-xl gap-2 font-semibold")}>
          See all products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
