"use client";

import { useState } from "react";
import { MessageSquare, AlertCircle, CheckCircle, Clock, Send, Package, Phone, EyeOff, Eye, AlertTriangle, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import { ISSUE_TYPE_CONFIG, generateWaAck } from "@/lib/dashboard-data";
import type { DashboardTicket, TicketStatus, TicketPriority } from "@/lib/dashboard-data";
import type { TicketReply } from "@/lib/store";

// ─── Config ───────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  "open":        { label: "Open",        bg: "oklch(0.47 0.22 22 / 0.12)",  color: "oklch(0.47 0.22 22)",  icon: AlertCircle  },
  "in-progress": { label: "In Progress", bg: "oklch(0.68 0.19 44 / 0.12)",  color: "oklch(0.52 0.20 38)",  icon: Clock        },
  "resolved":    { label: "Resolved",    bg: "oklch(0.64 0.14 160 / 0.12)", color: "oklch(0.40 0.12 160)", icon: CheckCircle  },
  "closed":      { label: "Closed",      bg: "oklch(0.75 0.04 260 / 0.12)", color: "oklch(0.52 0.05 260)", icon: CheckCircle  },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; border: string }> = {
  low:    { label: "Low",    color: "oklch(0.58 0.05 260)", border: "oklch(0.85 0.03 260)" },
  medium: { label: "Medium", color: "oklch(0.62 0.16 50)",  border: "oklch(0.78 0.14 55)"  },
  high:   { label: "High",   color: "oklch(0.47 0.22 22)",  border: "oklch(0.47 0.22 22)"  },
};

const QUICK_REPLIES = [
  { label: "Shipping ETA", text: "Hi! Your order is currently being processed. Estimated delivery is 7–14 business days internationally, 3–5 days locally. You'll receive tracking once dispatched 📦" },
  { label: "Wrong item",   text: "Hi! We're sorry about the mix-up. Please send a photo of the item received and your order number, and we'll arrange a replacement right away 🙏" },
  { label: "Exchange",     text: "Hi! We'd be happy to help with an exchange. Items must be in original condition. Reply with your order number and the size/variant you'd like 📋" },
  { label: "Drop reg.",    text: "Hi! We can confirm your pre-registration for the drop. You'll receive a WhatsApp notification 24h before it goes live. Slots are strictly limited — check in fast! ⚡" },
];

// ─── Status badge ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg  = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  );
}

// ─── Phone masking ────────────────────────────────────────────────
function PhoneDisplay({ phone }: { phone?: string }) {
  const [visible, setVisible] = useState(false);
  if (!phone) return null;
  const masked = phone.replace(/\d(?=\d{4})/g, "•");
  return (
    <div className="flex items-center gap-1.5">
      <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-xs font-mono text-foreground">{visible ? phone : masked}</span>
      <button
        onClick={() => setVisible(!visible)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title={visible ? "Hide number" : "Show number"}
      >
        {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </button>
    </div>
  );
}

// ─── WA ack panel ────────────────────────────────────────────────
function WaAckPanel({ ticket }: { ticket: DashboardTicket }) {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const ack = generateWaAck(ticket);

  function handleCopy() {
    navigator.clipboard.writeText(ack).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="mx-5 mt-3 mb-1 rounded-xl overflow-hidden border" style={{ borderColor: "oklch(0.32 0.10 155 / 0.30)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:opacity-90"
        style={{ background: "oklch(0.32 0.10 155 / 0.08)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🐙</span>
          <span className="text-xs font-bold" style={{ color: "oklch(0.32 0.10 155)" }}>WhatsApp Acknowledgement</span>
          {ticket.source === "contact-form" && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "oklch(0.68 0.19 44 / 0.12)", color: "oklch(0.52 0.20 38)" }}>
              Auto-generated
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-3.5 w-3.5" style={{ color: "oklch(0.32 0.10 155)" }} /> : <ChevronDown className="h-3.5 w-3.5" style={{ color: "oklch(0.32 0.10 155)" }} />}
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 pt-2" style={{ background: "oklch(0.32 0.10 155 / 0.04)" }}>
          <pre
            className="text-[11px] leading-relaxed whitespace-pre-wrap font-sans rounded-lg p-3 mb-2.5"
            style={{ background: "white", border: "1px solid oklch(0.88 0.015 80)", color: "oklch(0.25 0.05 260)" }}
          >
            {ack}
          </pre>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors hover:bg-white"
            style={{ borderColor: "oklch(0.32 0.10 155 / 0.40)", color: copied ? "oklch(0.42 0.14 160)" : "oklch(0.32 0.10 155)" }}
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied to clipboard!" : "Copy WA message"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Ticket detail panel ──────────────────────────────────────────
function TicketPanel({ ticket, replies, onClose }: {
  ticket: DashboardTicket;
  replies: TicketReply[];
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const { addToast } = useToast();
  const [reply, setReply] = useState("");
  const [confirmEscalate, setConfirmEscalate] = useState(false);
  const priorityCfg = PRIORITY_CONFIG[ticket.priority];

  function handleStatusChange(newStatus: TicketStatus) {
    dispatch({ type: "TICKET_UPDATE_STATUS", payload: { id: ticket.id, status: newStatus } });
    dispatch({ type: "LOG_ADD", payload: { action: "Ticket status changed", details: `${ticket.id} → ${STATUS_CONFIG[newStatus].label}`, time: "Just now", severity: "info" } });
    addToast(`Ticket ${ticket.id} marked as ${STATUS_CONFIG[newStatus].label}`, "success");
  }

  function handleSendReply() {
    if (!reply.trim()) return;
    const newReply: TicketReply = {
      id: `r${Date.now()}`,
      text: reply.trim(),
      author: "admin",
      authorName: "YAA Support",
      time: "Just now",
    };
    dispatch({ type: "TICKET_ADD_REPLY", payload: { ticketId: ticket.id, reply: newReply } });
    // Auto-progress status
    if (ticket.status === "open") {
      dispatch({ type: "TICKET_UPDATE_STATUS", payload: { id: ticket.id, status: "in-progress" } });
    }
    addToast("Reply sent", "success");
    setReply("");
  }

  function handleEscalate() {
    dispatch({ type: "TICKET_TOGGLE_ESCALATE", payload: ticket.id });
    dispatch({ type: "LOG_ADD", payload: { action: "Ticket escalated", details: `${ticket.id} priority toggled`, time: "Just now", severity: "warning" } });
    addToast(`${ticket.id} ${ticket.priority === "high" ? "de-escalated" : "escalated to high priority"}`, "warning");
    setConfirmEscalate(false);
  }

  const availableStatuses = (["open", "in-progress", "resolved", "closed"] as TicketStatus[]).filter(s => s !== ticket.status);

  return (
    <>
      {confirmEscalate && (
        <ConfirmModal
          title="Escalate ticket?"
          message={ticket.priority === "high"
            ? "Remove the high-priority flag from this ticket?"
            : "Mark this ticket as high priority? This will move it to the top of the queue."}
          confirmLabel={ticket.priority === "high" ? "De-escalate" : "Escalate"}
          danger={ticket.priority !== "high"}
          onConfirm={handleEscalate}
          onCancel={() => setConfirmEscalate(false)}
        />
      )}

      <div
        className="flex flex-col bg-white rounded-2xl border shadow-sm overflow-hidden"
        style={{ borderColor: "oklch(0.88 0.015 80)", height: "calc(100vh - 260px)", minHeight: "480px" }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid oklch(0.92 0.015 80)", borderLeft: `3px solid ${priorityCfg.border}` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[11px] font-black text-muted-foreground font-mono">{ticket.id}</p>
                {ticket.orderRef && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "oklch(0.68 0.19 44 / 0.10)", color: "oklch(0.52 0.20 38)" }}>
                    {ticket.orderRef}
                  </span>
                )}
                {ticket.escalated && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "oklch(0.47 0.22 22 / 0.10)", color: "oklch(0.47 0.22 22)" }}>
                    <AlertTriangle className="h-2.5 w-2.5" />Escalated
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm text-foreground leading-snug">{ticket.subject}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmEscalate(true)}
                className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-red-50 flex items-center gap-1"
                style={{ borderColor: ticket.priority === "high" ? "oklch(0.47 0.22 22 / 0.40)" : "oklch(0.88 0.015 80)", color: ticket.priority === "high" ? "oklch(0.47 0.22 22)" : "oklch(0.55 0.05 260)" }}
              >
                <AlertTriangle className="h-3 w-3" />
                {ticket.priority === "high" ? "De-escalate" : "Escalate"}
              </button>
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors flex-shrink-0">✕</button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <StatusBadge status={ticket.status} />
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: priorityCfg.color + "15", color: priorityCfg.color }}>
              {priorityCfg.label} priority
            </span>
            {ticket.issueType && ISSUE_TYPE_CONFIG[ticket.issueType] && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "oklch(0.55 0.22 280 / 0.10)", color: "oklch(0.38 0.18 280)" }}>
                {ISSUE_TYPE_CONFIG[ticket.issueType].emoji} {ISSUE_TYPE_CONFIG[ticket.issueType].label}
              </span>
            )}
            {ticket.franchise && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "oklch(0.68 0.19 44 / 0.08)", color: "oklch(0.52 0.20 38)" }}>
                {ticket.franchise}
              </span>
            )}
            {ticket.source === "contact-form" && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "oklch(0.32 0.10 155 / 0.10)", color: "oklch(0.28 0.10 155)" }}>
                🌐 Contact Form
              </span>
            )}
          </div>
        </div>

        {/* Customer info */}
        <div className="px-5 py-3 flex-shrink-0 flex items-center gap-3" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)", background: "oklch(0.985 0.005 78)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ background: "oklch(0.68 0.19 44)" }}>
            {ticket.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{ticket.user}</p>
            <div className="mt-0.5">
              <PhoneDisplay phone={ticket.phone} />
            </div>
          </div>
          {ticket.orderRef && (
            <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "oklch(0.68 0.19 44 / 0.08)" }}>
              <Package className="h-3 w-3" style={{ color: "oklch(0.52 0.20 38)" }} />
              <span className="text-xs font-bold" style={{ color: "oklch(0.52 0.20 38)" }}>{ticket.orderRef}</span>
            </div>
          )}
        </div>

        {/* WA acknowledgement */}
        <WaAckPanel ticket={ticket} />

        {/* Thread */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Initial message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5" style={{ background: "oklch(0.68 0.19 44)" }}>
              {ticket.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-foreground">{ticket.user}</span>
                <span className="text-[11px] text-muted-foreground">{ticket.time}</span>
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-sm text-sm text-foreground leading-relaxed" style={{ background: "oklch(0.95 0.008 78)" }}>
                {ticket.message}
              </div>
            </div>
          </div>

          {/* Prior admin replies from seed state (resolved/closed) */}
          {(ticket.status === "resolved" || ticket.status === "closed") && replies.length === 0 && (
            <div className="flex gap-3 justify-end">
              <div className="flex-1 max-w-[88%]">
                <div className="flex items-center gap-2 mb-1.5 justify-end">
                  <span className="text-[11px] text-muted-foreground">2h ago</span>
                  <span className="text-xs font-bold text-foreground">YAA Support</span>
                </div>
                <div className="p-3.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed" style={{ background: "oklch(0.68 0.19 44 / 0.09)", color: "oklch(0.30 0.12 40)" }}>
                  {ticket.status === "resolved"
                    ? "Thank you for reaching out! We've sorted this for you. Please let us know if there's anything else we can help with 🙏"
                    : "This ticket has been closed. Feel free to open a new one if you need further assistance."}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5" style={{ background: "oklch(0.12 0.010 260)" }}>Y</div>
            </div>
          )}

          {/* Dynamic replies */}
          {replies.map((r) => (
            <div key={r.id} className={`flex gap-3 ${r.author === "admin" ? "justify-end" : ""}`}>
              {r.author === "customer" && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5" style={{ background: "oklch(0.68 0.19 44)" }}>
                  {ticket.avatar}
                </div>
              )}
              <div className={`flex-1 ${r.author === "admin" ? "max-w-[88%]" : ""}`}>
                <div className={`flex items-center gap-2 mb-1.5 ${r.author === "admin" ? "justify-end" : ""}`}>
                  {r.author === "admin" && <span className="text-[11px] text-muted-foreground">{r.time}</span>}
                  <span className="text-xs font-bold text-foreground">{r.author === "admin" ? r.authorName : ticket.user}</span>
                  {r.author === "customer" && <span className="text-[11px] text-muted-foreground">{r.time}</span>}
                </div>
                <div
                  className="p-3.5 rounded-2xl text-sm leading-relaxed"
                  style={{
                    borderRadius: r.author === "admin" ? "1rem 0.25rem 1rem 1rem" : "0.25rem 1rem 1rem 1rem",
                    background: r.author === "admin" ? "oklch(0.68 0.19 44 / 0.09)" : "oklch(0.95 0.008 78)",
                    color: r.author === "admin" ? "oklch(0.30 0.12 40)" : "oklch(0.20 0.05 260)",
                  }}
                >
                  {r.text}
                </div>
              </div>
              {r.author === "admin" && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5" style={{ background: "oklch(0.12 0.010 260)" }}>Y</div>
              )}
            </div>
          ))}
        </div>

        {/* Reply box */}
        {ticket.status !== "closed" && (
          <div className="px-5 py-4 flex-shrink-0 space-y-3" style={{ borderTop: "1px solid oklch(0.92 0.015 80)" }}>
            {/* Quick replies */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map(qr => (
                <button
                  key={qr.label}
                  onClick={() => setReply(qr.text)}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg border hover:bg-orange-50 transition-colors"
                  style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.52 0.20 38)" }}
                >
                  {qr.label}
                </button>
              ))}
            </div>

            <textarea
              value={reply}
              onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSendReply(); }}
              rows={3}
              placeholder="Type your reply… (Ctrl+Enter to send)"
              className="w-full border rounded-xl px-3.5 py-2.5 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              style={{ borderColor: "oklch(0.88 0.015 80)" }}
            />

            <div className="flex items-center justify-between">
              {/* Status change buttons */}
              <div className="flex gap-1.5 flex-wrap">
                {availableStatuses.slice(0, 3).map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "oklch(0.88 0.015 80)", color: STATUS_CONFIG[s].color }}
                  >
                    Mark {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSendReply}
                disabled={!reply.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: "oklch(0.68 0.19 44)" }}
              >
                <Send className="h-3.5 w-3.5" />Send Reply
              </button>
            </div>
          </div>
        )}

        {ticket.status === "closed" && (
          <div className="px-5 py-4 flex-shrink-0 text-center" style={{ borderTop: "1px solid oklch(0.92 0.015 80)", background: "oklch(0.985 0.005 78)" }}>
            <p className="text-xs text-muted-foreground mb-2">This ticket is closed.</p>
            <button
              onClick={() => handleStatusChange("open")}
              className="text-xs font-bold px-4 py-2 rounded-xl border hover:bg-white transition-colors"
              style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.47 0.22 22)" }}
            >
              Reopen ticket
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
const FILTER_STATUSES: Array<"all" | TicketStatus> = ["all", "open", "in-progress", "resolved", "closed"];
type SourceFilter = "all" | "contact-form" | "manual";

export default function SupportPage() {
  const { state } = useStore();
  const tickets = state.tickets;
  const ticketReplies = state.ticketReplies;

  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [selected,     setSelected]     = useState<DashboardTicket | null>(tickets[0] ?? null);

  const filtered = tickets
    .filter(t => statusFilter === "all" || t.status === statusFilter)
    .filter(t => sourceFilter === "all" || (t.source ?? "manual") === sourceFilter);

  const contactFormCount = tickets.filter(t => (t.source ?? "manual") === "contact-form").length;

  const openCount       = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in-progress").length;
  const highPriority    = tickets.filter(t => t.priority === "high" && (t.status === "open" || t.status === "in-progress")).length;

  // Keep selected ticket in sync with store (status changes etc.)
  const selectedLive = selected ? tickets.find(t => t.id === selected.id) ?? null : null;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: "oklch(0.68 0.19 44)" }}>Inbox</p>
          <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-0.5 leading-tight">Customer Support</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {openCount} open · {inProgressCount} in progress
            {highPriority > 0 && (
              <span className="ml-1.5 font-bold" style={{ color: "oklch(0.47 0.22 22)" }}>· {highPriority} high priority</span>
            )}
          </p>
        </div>
      </div>

      {/* Source filter strip */}
      {contactFormCount > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Source:</span>
          {(["all", "contact-form", "manual"] as SourceFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border"
              style={sourceFilter === s
                ? s === "contact-form"
                  ? { background: "oklch(0.32 0.10 155 / 0.10)", borderColor: "oklch(0.32 0.10 155 / 0.40)", color: "oklch(0.28 0.10 155)" }
                  : { background: "oklch(0.68 0.19 44)", borderColor: "oklch(0.68 0.19 44)", color: "white" }
                : { background: "white", borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.52 0.05 260)" }
              }
            >
              {s === "all" ? "All sources" : s === "contact-form" ? `🌐 Contact Form (${contactFormCount})` : "Manual"}
            </button>
          ))}
        </div>
      )}

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
        {(["open", "in-progress", "resolved", "closed"] as TicketStatus[]).map((s) => {
          const count    = tickets.filter(t => t.status === s).length;
          const cfg      = STATUS_CONFIG[s];
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(isActive ? "all" : s)}
              className="bg-white rounded-2xl p-4 border shadow-sm text-left transition-all hover:shadow-md"
              style={{ borderColor: isActive ? cfg.color : "oklch(0.88 0.015 80)", borderLeftWidth: isActive ? "3px" : "1px" }}
            >
              <p className="font-heading font-black text-2xl leading-none" style={{ color: cfg.color }}>{count}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Two-panel layout */}
      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        {/* Ticket list */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
          {/* Filter tabs */}
          <div className="px-4 py-3 flex gap-1 overflow-x-auto" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
            {FILTER_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
                style={statusFilter === s ? { background: "oklch(0.68 0.19 44)", color: "white" } : { color: "oklch(0.52 0.05 260)" }}
              >
                {s === "all" ? "All" : STATUS_CONFIG[s].label}
                {s !== "all" && <span className="ml-1 opacity-70">({tickets.filter(t => t.status === s).length})</span>}
              </button>
            ))}
          </div>

          {/* Rows */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
            {filtered.map((ticket) => {
              const priorityCfg = PRIORITY_CONFIG[ticket.priority];
              const isActive    = selectedLive?.id === ticket.id;
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelected(ticket)}
                  className="w-full text-left px-4 py-4 transition-colors border-b last:border-0"
                  style={{ borderColor: "oklch(0.93 0.015 80)", background: isActive ? "oklch(0.68 0.19 44 / 0.05)" : "transparent", borderLeft: `3px solid ${isActive ? priorityCfg.border : "transparent"}` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: isActive ? "oklch(0.68 0.19 44)" : "oklch(0.90 0.012 78)", color: isActive ? "white" : "oklch(0.48 0.05 260)" }}
                    >
                      {ticket.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          {ticket.user}
                          {ticket.escalated && <AlertTriangle className="h-3 w-3 text-red-400" />}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{ticket.time}</span>
                      </div>
                      <p className="text-xs text-foreground leading-snug line-clamp-2 mb-2">{ticket.subject}</p>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ticket.status} />
                        <span className="text-[10px] font-bold" style={{ color: priorityCfg.color }}>{priorityCfg.label}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-7 w-7 mx-auto mb-2 opacity-25" />
                <p className="text-sm font-medium">No tickets in this view</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedLive ? (
          <TicketPanel
            ticket={selectedLive}
            replies={ticketReplies[selectedLive.id] ?? []}
            onClose={() => setSelected(null)}
          />
        ) : (
          <div className="bg-white rounded-2xl border shadow-sm flex items-center justify-center text-center" style={{ borderColor: "oklch(0.88 0.015 80)", minHeight: "480px" }}>
            <div>
              <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-25" />
              <p className="text-sm font-semibold text-muted-foreground">Select a ticket to view</p>
              <p className="text-xs text-muted-foreground mt-1">Click any ticket from the list</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
