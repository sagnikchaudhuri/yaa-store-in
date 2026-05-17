"use client";

import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANEMONE_INTRO_MESSAGES } from "@/lib/constants";

export default function AnemoneIntro() {
  const [msgIdx, setMsgIdx] = useState(0);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/8 border border-primary/20 overflow-hidden p-8 md:p-12">
          {/* Background glow */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Mascot */}
            <div className="flex-shrink-0 relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary/25 to-accent/15 border-2 border-primary/30 flex items-center justify-center text-6xl md:text-7xl select-none shadow-xl">
                🐱
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
            </div>

            {/* Chat bubble */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-1">
                  Meet Anemone
                </p>
                <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-3">
                  Your AI fandom guide
                </h2>
              </div>

              <div className="relative bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm min-h-[64px] flex items-center">
                <p className="text-sm md:text-base leading-relaxed">
                  {ANEMONE_INTRO_MESSAGES[msgIdx]}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {ANEMONE_INTRO_MESSAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMsgIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === msgIdx
                          ? "w-5 bg-primary"
                          : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Button className="gap-2 rounded-xl font-semibold" size="lg">
                <MessageCircle className="h-4 w-4" />
                Chat with Anemone
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
