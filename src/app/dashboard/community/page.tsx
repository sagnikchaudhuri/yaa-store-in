"use client";

import { Users, BarChart3, MessageSquare, Zap } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  { icon: Users,         label: "Group Insights",       desc: "Member growth, activity trends, and engagement metrics per group" },
  { icon: MessageSquare, label: "Message Analytics",     desc: "Volume, topic clustering, and franchise chatter breakdown"         },
  { icon: BarChart3,     label: "Drop Interest Tracking",desc: "Which drops generate the most buzz before they go live"           },
  { icon: Zap,           label: "Support Detection",     desc: "Flag support queries from community messages before they escalate" },
];

export default function CommunityPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[900px]">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold" style={{ color: "oklch(0.68 0.19 44)" }}>Operations</p>
        <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-0.5 leading-tight">
          Community Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Analytics for your WhatsApp community groups
        </p>
      </div>

      {/* Coming-soon card */}
      <div
        className="rounded-3xl border-2 border-dashed p-10 text-center mb-8"
        style={{ borderColor: "oklch(0.88 0.015 80)", background: "oklch(0.98 0.006 78)" }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl"
          style={{ background: "oklch(0.68 0.19 44 / 0.10)" }}
        >
          💬
        </div>
        <h2 className="font-heading font-black text-xl text-foreground mb-2">
          WhatsApp Business API Required
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">
          Community analytics require a verified WhatsApp Business account and API access.
          Connect your account to unlock real-time group insights.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "oklch(0.68 0.19 44 / 0.60)" }}>
          <span className="w-2 h-2 rounded-full bg-white/60" />
          Coming in Phase 2
        </div>
      </div>

      {/* Feature preview */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground mb-4">
          What you&apos;ll get
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3.5 p-4 rounded-2xl border bg-white"
              style={{ borderColor: "oklch(0.90 0.015 80)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.68 0.19 44 / 0.08)" }}
              >
                <Icon className="h-4 w-4" style={{ color: "oklch(0.68 0.19 44)" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support link */}
      <p className="text-xs text-muted-foreground mt-8 text-center">
        Questions about setup?{" "}
        <Link href="/contact" className="font-semibold hover:underline" style={{ color: "oklch(0.68 0.19 44)" }}>
          Contact support →
        </Link>
      </p>
    </div>
  );
}
