"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Phone, Package, CheckCircle, Copy, ChevronDown } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useStore } from "@/lib/store";
import type { Lead } from "@/lib/store";
import {
  ISSUE_TYPE_CONFIG, generateWaAck,
  type IssueType, type DashboardTicket,
} from "@/lib/dashboard-data";

// ─── Franchise list (mirrors store seed) ──────────────────────────
const FRANCHISES = [
  "Naruto", "One Piece", "Jujutsu Kaisen", "Demon Slayer",
  "Bleach", "Studio Ghibli", "Chainsaw Man", "Attack on Titan",
  "Other / Not listed",
];

// ─── Form state ───────────────────────────────────────────────────
interface ContactForm {
  name: string;
  phone: string;
  issueType: IssueType | "";
  orderRef: string;
  franchise: string;
  message: string;
}

function blankForm(): ContactForm {
  return { name: "", phone: "", issueType: "", orderRef: "", franchise: "", message: "" };
}

// ─── Ticket ID generator ──────────────────────────────────────────
function newTicketId(): string {
  const n = Math.floor(Math.random() * 900) + 100;
  return `TKT-${n}`;
}

// ─── Success modal ────────────────────────────────────────────────
function SuccessModal({ ticket, ack, onClose }: {
  ticket: DashboardTicket;
  ack: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(ack).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
        {/* Green top bar */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, oklch(0.64 0.14 160), oklch(0.55 0.18 160))" }} />
        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.64 0.14 160 / 0.12)" }}>
              <CheckCircle className="h-6 w-6" style={{ color: "oklch(0.42 0.14 160)" }} />
            </div>
            <div>
              <p className="font-heading font-black text-lg text-foreground leading-tight">Complaint Received</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ticket <span className="font-bold font-mono">{ticket.id}</span> created</p>
            </div>
          </div>

          <p className="text-sm text-foreground leading-relaxed mb-4">
            Thank you! Our team and <span className="font-bold" style={{ color: "oklch(0.68 0.19 44)" }}>Anemone</span> will respond via <strong>WhatsApp</strong> within 24 hours.
            Keep your number <span className="font-mono font-bold">{ticket.phone}</span> available.
          </p>

          {/* WA ack preview */}
          <div className="rounded-xl overflow-hidden border mb-4" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
            <div className="px-3 py-2 flex items-center gap-2" style={{ background: "oklch(0.32 0.10 155)" }}>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">🐙</div>
              <p className="text-[11px] font-bold text-white">YAA Store · WhatsApp</p>
              <span className="text-[9px] text-white/50 ml-auto">Anemone auto-response</span>
            </div>
            <div className="p-3" style={{ background: "oklch(0.92 0.020 155 / 0.15)" }}>
              <div
                className="rounded-2xl rounded-tl-sm p-3 text-[11px] leading-relaxed whitespace-pre-wrap"
                style={{ background: "white", boxShadow: "0 1px 3px oklch(0 0 0 / 0.10)" }}
              >
                {ack}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border hover:bg-gray-50 transition-colors"
              style={{ borderColor: "oklch(0.88 0.015 80)", color: copied ? "oklch(0.42 0.14 160)" : "oklch(0.48 0.05 260)" }}
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy WA message"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "oklch(0.68 0.19 44)" }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function ContactPage() {
  const { dispatch } = useStore();
  const [form, setForm]       = useState<ContactForm>(blankForm());
  const [errors, setErrors]   = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitted, setSubmitted] = useState<{ ticket: DashboardTicket; ack: string } | null>(null);

  function set<K extends keyof ContactForm>(key: K, val: string) {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const e: Partial<Record<keyof ContactForm, string>> = {};
    if (!form.name.trim())       e.name      = "Name is required";
    if (!form.phone.trim())      e.phone     = "Phone number is required";
    if (!form.issueType)         e.issueType = "Please select an issue type";
    if (!form.message.trim())    e.message   = "Please describe your issue";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const issueCfg = ISSUE_TYPE_CONFIG[form.issueType as IssueType];
    const id       = newTicketId();
    const subject  = `${issueCfg.emoji} ${issueCfg.label}${form.orderRef ? ` — ${form.orderRef}` : ""}`;

    const ticket: DashboardTicket = {
      id,
      user:         form.name.trim().split(" ").map((w, i) => i === 0 ? w : w[0] + ".").join(" "),
      customerName: form.name.trim(),
      avatar:       form.name.trim()[0].toUpperCase(),
      phone:        form.phone.trim(),
      franchise:    form.franchise || undefined,
      subject,
      status:       "open",
      priority:     issueCfg.priority,
      time:         "Just now",
      message:      form.message.trim(),
      orderRef:     form.orderRef.trim() || undefined,
      escalated:    false,
      source:       "contact-form",
      issueType:    form.issueType as IssueType,
    };

    const ack = generateWaAck(ticket);

    dispatch({ type: "TICKET_CREATE", payload: ticket });
    dispatch({
      type: "LOG_ADD",
      payload: { action: "Contact form ticket", details: `${id} from ${ticket.user} — ${issueCfg.label}`, time: "Just now", severity: "info" },
    });

    // Capture lead
    const lead: Lead = {
      id:        `ld${Date.now()}`,
      phone:     form.phone.trim(),
      name:      form.name.trim().split(" ").map((w, i) => i === 0 ? w : w[0] + ".").join(" "),
      source:    "contact-form",
      section:   "Contact Page",
      franchise: form.franchise || undefined,
      timestamp: "Just now",
    };
    dispatch({ type: "LEAD_ADD", payload: lead });

    setSubmitted({ ticket, ack });
    setForm(blankForm());
  }

  const inputCls = "w-full border rounded-xl px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white";
  const errBorder = (k: keyof ContactForm) => ({
    borderColor: errors[k] ? "oklch(0.47 0.22 22)" : "oklch(0.88 0.015 80)",
  });

  return (
    <>
      {submitted && (
        <SuccessModal
          ticket={submitted.ticket}
          ack={submitted.ack}
          onClose={() => setSubmitted(null)}
        />
      )}

      <Navbar />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="pt-16 pb-12 px-4" style={{ background: "oklch(0.97 0.008 78)" }}>
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-5"
              style={{ background: "oklch(0.68 0.19 44 / 0.10)", color: "oklch(0.52 0.20 38)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Support via WhatsApp · Powered by Anemone
            </div>
            <h1 className="font-heading font-black text-4xl md:text-5xl text-foreground leading-tight mb-4">
              Contact & Support
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
              Got an issue with your order? Fill out the form below and our team — along with
              <strong style={{ color: "oklch(0.68 0.19 44)" }}> Anemone</strong> — will reach you via WhatsApp within 24 hours.
            </p>
          </div>
        </section>

        {/* ── Info strip ───────────────────────────────────────── */}
        <div className="border-y" style={{ borderColor: "oklch(0.90 0.015 80)", background: "white" }}>
          <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, label: "WhatsApp Response",    desc: "We reply via WhatsApp within 24h"          },
              { icon: Package,       label: "Order issues welcome",  desc: "Wrong item, damaged, missing — we fix it"  },
              { icon: Phone,         label: "Have your number ready",desc: "We'll reach out on the number you provide" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 py-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "oklch(0.68 0.19 44 / 0.10)" }}>
                  <Icon className="h-4 w-4" style={{ color: "oklch(0.52 0.20 38)" }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form ─────────────────────────────────────────────── */}
        <section className="py-14 px-4">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} noValidate className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              {/* Form header */}
              <div className="px-6 py-5 border-b" style={{ borderColor: "oklch(0.92 0.015 80)", background: "oklch(0.98 0.005 78)" }}>
                <p className="font-heading font-black text-lg text-foreground">Submit a Complaint</p>
                <p className="text-xs text-muted-foreground mt-0.5">Fields marked * are required</p>
              </div>

              <div className="px-6 py-6 space-y-5">
                {/* Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Full Name *</label>
                    <input
                      className={inputCls}
                      style={errBorder("name")}
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                      placeholder="e.g. Kira Matsuda"
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">WhatsApp Number *</label>
                    <input
                      className={inputCls}
                      style={errBorder("phone")}
                      value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                      placeholder="+234-800-000-0000"
                      type="tel"
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Issue type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Issue Type *</label>
                  <div className="relative">
                    <select
                      className={`${inputCls} appearance-none pr-9`}
                      style={errBorder("issueType")}
                      value={form.issueType}
                      onChange={e => set("issueType", e.target.value)}
                    >
                      <option value="">Select issue type…</option>
                      {(Object.entries(ISSUE_TYPE_CONFIG) as [IssueType, typeof ISSUE_TYPE_CONFIG[IssueType]][]).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.issueType && <p className="text-xs text-red-500 mt-1">{errors.issueType}</p>}
                </div>

                {/* Order ref + Franchise */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Order / Drop Reference</label>
                    <input
                      className={inputCls}
                      style={{ borderColor: "oklch(0.88 0.015 80)" }}
                      value={form.orderRef}
                      onChange={e => set("orderRef", e.target.value)}
                      placeholder="YAA-2891 or drop name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Franchise / Series</label>
                    <div className="relative">
                      <select
                        className={`${inputCls} appearance-none pr-9`}
                        style={{ borderColor: "oklch(0.88 0.015 80)" }}
                        value={form.franchise}
                        onChange={e => set("franchise", e.target.value)}
                      >
                        <option value="">Not applicable / Unknown</option>
                        {FRANCHISES.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Your Message / Complaint *</label>
                  <textarea
                    rows={5}
                    className={`${inputCls} resize-none`}
                    style={errBorder("message")}
                    value={form.message}
                    onChange={e => set("message", e.target.value)}
                    placeholder="Describe your issue in as much detail as possible. Include product name, order number, and what went wrong…"
                  />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>

                {/* Anemone note */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ background: "oklch(0.68 0.19 44 / 0.06)", border: "1px solid oklch(0.88 0.015 80)" }}>
                  <span className="text-lg flex-shrink-0">🐙</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Anemone</strong> will send you an automatic WhatsApp acknowledgement when your ticket is created.
                    A human agent will follow up within 24 hours for resolution.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 flex items-center justify-between gap-4 border-t" style={{ borderColor: "oklch(0.92 0.015 80)", background: "oklch(0.98 0.005 78)" }}>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to store</Link>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                  style={{ background: "oklch(0.68 0.19 44)" }}
                >
                  <MessageSquare className="h-4 w-4" />
                  Submit Complaint
                </button>
              </div>
            </form>

            {/* FAQ note */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              For quick answers, try{" "}
              <button
                onClick={() => {
                  // Trigger Anemone widget if available
                  const btn = document.querySelector<HTMLButtonElement>("[data-anemone-open]");
                  btn?.click();
                }}
                className="font-bold hover:underline"
                style={{ color: "oklch(0.68 0.19 44)" }}
              >
                Anemone
              </button>{" "}
              — our AI guide can answer shipping, drop, and product questions instantly.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
