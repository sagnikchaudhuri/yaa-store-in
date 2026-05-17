import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MOCK_COLLECTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const collectionEmojis: Record<string, string> = {
  "shonen-legends": "⚔️",
  "demon-slayer": "🔥",
  streetwear: "👕",
  "limited-figures": "🏆",
};

export default function CollectionPreview() {
  return (
    <section className="py-20 bg-secondary/40">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">
              Browse By Series
            </p>
            <h2 className="font-heading font-extrabold text-4xl md:text-5xl">
              Collections
            </h2>
          </div>
          <Link href="/collections" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:flex gap-2 font-medium")}>
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_COLLECTIONS.map((col, i) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm card-hover cursor-pointer"
            >
              {/* Visual */}
              <div
                className={`h-40 flex items-center justify-center text-5xl select-none transition-transform duration-500 group-hover:scale-110 ${
                  i % 2 === 0
                    ? "bg-gradient-to-br from-primary/15 to-secondary"
                    : "bg-gradient-to-br from-accent/15 to-secondary"
                }`}
              >
                {collectionEmojis[col.slug] ?? "📦"}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-heading font-bold text-base leading-snug mb-0.5">
                  {col.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {col.description}
                </p>
                <p className="text-xs font-medium text-primary">
                  {col.productCount} items
                </p>
              </div>

              <div className="absolute inset-0 ring-2 ring-primary/0 group-hover:ring-primary/20 rounded-2xl transition-all duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
