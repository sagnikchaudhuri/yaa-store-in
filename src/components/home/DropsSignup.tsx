"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import type { Lead } from "@/lib/store";

export default function DropsSignup() {
  const { dispatch } = useStore();
  const [phone,   setPhone]   = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);

    // Capture lead in shared store
    const lead: Lead = {
      id:        `ld${Date.now()}`,
      phone:     phone.trim(),
      source:    "drops-signup",
      section:   "Homepage — Early Access",
      timestamp: "Just now",
    };
    dispatch({ type: "LEAD_ADD", payload: lead });

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <section
      id="drops-signup"
      className="relative py-16 md:py-28 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.68 0.19 44) 0%, oklch(0.54 0.21 38) 45%, oklch(0.47 0.22 22) 100%)",
      }}
    >
      {/* Halftone overlay */}
      <div className="absolute inset-0 bg-halftone opacity-25 pointer-events-none" />

      {/* Soft radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, oklch(0.18 0.008 260 / 0.25) 100%)",
        }}
      />

      {/* Manga speed lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none animate-manga-fade"
        viewBox="0 0 1440 700"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{ opacity: 0.55, mixBlendMode: "soft-light" }}
      >
        <g stroke="white" fill="none">
          <line x1="720" y1="350" x2="0"    y2="0"   strokeWidth="0.9" />
          <line x1="720" y1="350" x2="180"  y2="0"   strokeWidth="0.5" />
          <line x1="720" y1="350" x2="360"  y2="0"   strokeWidth="0.7" />
          <line x1="720" y1="350" x2="540"  y2="0"   strokeWidth="0.4" />
          <line x1="720" y1="350" x2="720"  y2="0"   strokeWidth="1.0" />
          <line x1="720" y1="350" x2="900"  y2="0"   strokeWidth="0.4" />
          <line x1="720" y1="350" x2="1080" y2="0"   strokeWidth="0.7" />
          <line x1="720" y1="350" x2="1260" y2="0"   strokeWidth="0.5" />
          <line x1="720" y1="350" x2="1440" y2="0"   strokeWidth="0.8" />
          <line x1="720" y1="350" x2="1440" y2="175" strokeWidth="0.5" />
          <line x1="720" y1="350" x2="1440" y2="350" strokeWidth="0.6" />
          <line x1="720" y1="350" x2="1440" y2="525" strokeWidth="0.4" />
          <line x1="720" y1="350" x2="1440" y2="700" strokeWidth="0.8" />
          <line x1="720" y1="350" x2="1260" y2="700" strokeWidth="0.5" />
          <line x1="720" y1="350" x2="1080" y2="700" strokeWidth="0.7" />
          <line x1="720" y1="350" x2="900"  y2="700" strokeWidth="0.4" />
          <line x1="720" y1="350" x2="720"  y2="700" strokeWidth="0.9" />
          <line x1="720" y1="350" x2="540"  y2="700" strokeWidth="0.5" />
          <line x1="720" y1="350" x2="360"  y2="700" strokeWidth="0.7" />
          <line x1="720" y1="350" x2="180"  y2="700" strokeWidth="0.4" />
          <line x1="720" y1="350" x2="0"    y2="700" strokeWidth="0.8" />
          <line x1="720" y1="350" x2="0"    y2="525" strokeWidth="0.5" />
          <line x1="720" y1="350" x2="0"    y2="350" strokeWidth="0.6" />
          <line x1="720" y1="350" x2="0"    y2="175" strokeWidth="0.4" />
        </g>
      </svg>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section label */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="h-px w-10 bg-white/35" />
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
            Early Access
          </span>
          <div className="h-px w-10 bg-white/35" />
        </div>

        {/* Headline */}
        <h2 className="font-heading font-black text-5xl sm:text-6xl md:text-7xl text-white leading-[0.88] tracking-tight mb-6">
          BE FIRST.
          <br />
          ALWAYS.
        </h2>

        <p className="text-white/65 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
          Register your number to get drop alerts before they go public.
          Limited runs sell out in minutes — be in the first wave.
        </p>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center gap-5 py-4">
            <div className="w-16 h-16 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="font-heading font-bold text-2xl text-white">
                You&apos;re on the list!
              </p>
              <p className="text-white/55 text-sm mt-1">
                We&apos;ll text you before the next drop goes live.
              </p>
            </div>
            <button
              onClick={() => { setSuccess(false); setPhone(""); }}
              className="text-white/40 text-xs underline underline-offset-4 hover:text-white/70 transition-colors mt-1"
            >
              Register another number
            </button>
          </div>
        ) : (
          /* Form state */
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              className="flex-1 h-12 rounded-xl text-base text-white placeholder:text-white/35 border-white/20 focus-visible:border-white/50 focus-visible:ring-white/15"
              style={{ background: "oklch(1 0 0 / 0.12)" }}
            />
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="h-12 rounded-xl px-6 font-bold text-sm flex items-center justify-center gap-2 bg-white text-[#1A1614] hover:bg-white/90 transition-colors shadow-2xl shrink-0 disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px]"
            >
              {loading ? (
                "Registering..."
              ) : (
                <>
                  Get Early Access
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-white/35 text-xs mt-6">
          No spam. Drop notifications only. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
