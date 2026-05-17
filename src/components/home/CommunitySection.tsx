import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const messages = [
  {
    name: "Anemone",
    avatar: "🐱",
    msg: "Gear 5 drop in 18 days 🔥 make sure you're registered!",
    time: "11:42",
    isBot: true,
  },
  {
    name: "Kira",
    avatar: "K",
    msg: "ALREADY ON IT omg 🙌🙌",
    time: "11:43",
    isBot: false,
  },
  {
    name: "Ryuu",
    avatar: "R",
    msg: "what series drops after one piece?",
    time: "11:43",
    isBot: false,
  },
  {
    name: "Anemone",
    avatar: "🐱",
    msg: "Nezuko Collector Box → July 5 👀 stay ready",
    time: "11:44",
    isBot: true,
  },
];

export default function CommunitySection() {
  return (
    <section
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: "#1A1614" }}
    >
      {/* Atmospheric glows */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[400px] blur-[130px] pointer-events-none"
        style={{ background: "oklch(0.68 0.19 44 / 0.10)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[350px] blur-[110px] pointer-events-none"
        style={{ background: "oklch(0.47 0.22 22 / 0.08)" }}
      />

      {/* Ghost section number */}
      <div
        className="absolute -top-10 right-4 font-heading font-black leading-none text-white/[0.025] select-none pointer-events-none hidden lg:block"
        style={{ fontSize: "clamp(8rem, 22vw, 22rem)" }}
      >
        03
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left: Text + CTA ─────────────────────── */}
          <div className="space-y-8">

            {/* Section label */}
            <div className="flex items-center gap-3">
              <div className="h-px w-10 bg-primary/60" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                Community
              </span>
            </div>

            {/* Heading */}
            <h2
              className="font-heading font-black text-white leading-[0.85] tracking-tight"
              style={{ fontSize: "clamp(3.5rem, 8vw, 6.5rem)" }}
            >
              JOIN
              <br />
              THE
              <br />
              <span className="text-primary">PACK.</span>
            </h2>

            <p className="text-white/50 text-lg leading-relaxed max-w-md">
              2,400+ anime fans. Daily drop alerts before they go public.
              First dibs on restocks and exclusive collabs.
              <br />
              <span className="text-white/30 text-sm">The culture lives here.</span>
            </p>

            {/* CTA */}
            <div className="space-y-3">
              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-3 rounded-xl px-7 text-base font-bold shadow-2xl flex w-full sm:w-auto justify-center",
                  "bg-[#25D366] hover:bg-[#20c05c] text-white"
                )}
                style={{ border: "none" }}
              >
                <MessageCircle className="h-5 w-5" />
                Join the WhatsApp Community
              </a>
              <p className="text-white/25 text-xs pl-1">
                Free to join · Drop notifications only · No spam
              </p>
            </div>

            {/* Stats — inline editorial */}
            <div className="flex items-center gap-6 pt-2">
              <div>
                <p className="font-heading font-black text-2xl text-white leading-none">2,400+</p>
                <p className="text-white/30 text-xs mt-0.5">Members</p>
              </div>
              <span className="text-white/15 text-lg select-none">★</span>
              <div>
                <p className="font-heading font-black text-2xl text-white leading-none">Daily</p>
                <p className="text-white/30 text-xs mt-0.5">Drop Alerts</p>
              </div>
              <span className="text-white/15 text-lg select-none">★</span>
              <div>
                <p className="font-heading font-black text-2xl text-white leading-none">40+</p>
                <p className="text-white/30 text-xs mt-0.5">Series</p>
              </div>
            </div>
          </div>

          {/* ── Right: Chat preview ───────────────────── */}
          <div className="flex items-center justify-center lg:justify-end">
            <div
              className="w-full max-w-[300px] rounded-2xl overflow-hidden shadow-2xl lg:rotate-2 hover:rotate-0 transition-transform duration-500"
              style={{ background: "#111", border: "1px solid oklch(1 0 0 / 0.08)" }}
            >
              {/* Chat header */}
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ background: "#1a1a1a", borderBottom: "1px solid oklch(1 0 0 / 0.07)" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "oklch(0.68 0.19 44 / 0.20)" }}
                >
                  🐱
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-xs">YAA Community</p>
                  <p className="text-white/30 text-[10px] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    2,400 members · active now
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-3 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: m.isBot
                          ? "oklch(0.68 0.19 44 / 0.20)"
                          : "oklch(1 0 0 / 0.07)",
                        color: m.isBot ? "oklch(0.68 0.19 44)" : "oklch(1 0 0 / 0.40)",
                      }}
                    >
                      {m.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[10px] font-bold mb-1"
                        style={{
                          color: m.isBot
                            ? "oklch(0.68 0.19 44)"
                            : "oklch(1 0 0 / 0.35)",
                        }}
                      >
                        {m.name}
                      </p>
                      <div
                        className="rounded-xl rounded-tl-sm px-3 py-2 text-[11px] text-white/75 leading-snug"
                        style={{
                          background: m.isBot
                            ? "oklch(0.68 0.19 44 / 0.12)"
                            : "oklch(1 0 0 / 0.06)",
                        }}
                      >
                        {m.msg}
                      </div>
                      <p className="text-[9px] text-white/20 mt-1">{m.time}</p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                <div className="flex gap-2 items-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{ background: "oklch(0.68 0.19 44 / 0.20)" }}
                  >
                    🐱
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 rounded-xl px-3 py-2.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
