"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="font-heading font-black text-primary-foreground text-xs leading-none">
                Y
              </span>
            </div>
            <span className="font-heading font-black text-xl tracking-tight group-hover:text-primary transition-colors duration-200">
              YAA<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Special Drops CTA + mobile trigger */}
          <div className="flex items-center gap-3">
            <Link
              href="/#drops-signup"
              className={cn(
                buttonVariants({ size: "sm" }),
                "hidden md:inline-flex gap-1.5 rounded-full px-4 font-semibold text-xs shadow-md shadow-primary/20"
              )}
            >
              <Sparkles className="h-3 w-3" />
              Special Drops
            </Link>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border/50",
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="px-4 pt-3 pb-4 flex flex-col gap-1 bg-background/95 backdrop-blur-md">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 mt-1 border-t border-border/50">
            <Link
              href="/#drops-signup"
              onClick={() => setMenuOpen(false)}
              className={cn(
                buttonVariants({ size: "sm" }),
                "w-full gap-2 rounded-xl font-semibold justify-center"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Special Drops
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
