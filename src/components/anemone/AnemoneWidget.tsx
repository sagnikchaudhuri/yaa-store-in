"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { IDLE_PROMPTS, ALL_STARTERS, GREETING_CONTENT, shuffleArray } from "@/lib/anemone";
import { useStore } from "@/lib/store";

// ─── Types ──────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content: GREETING_CONTENT,
};

// ─── Main widget ────────────────────────────────────────────────
export default function AnemoneWidget() {
  // Respect the dashboard "Anemone enabled" toggle — driven by store so any
  // toggle in Overview or the Anemone page is immediately reactive.
  const { state } = useStore();

  const [open,          setOpen]          = useState(false);
  const [messages,      setMessages]      = useState<Message[]>([GREETING]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [idleText,      setIdleText]      = useState<string | null>(null);
  const [idleVisible,   setIdleVisible]   = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idleIndexRef = useRef(0);

  const hasUserMessages = messages.some((m) => m.role === "user");

  // Start with first 4 starters (deterministic — no hydration mismatch with SSR).
  // Reshuffle on the client each time the panel opens so users see variety.
  const [sessionStarters, setSessionStarters] = useState(ALL_STARTERS.slice(0, 4));
  useEffect(() => {
    if (open) {
      setSessionStarters(shuffleArray([...ALL_STARTERS]).slice(0, 4));
    }
  }, [open]);

  // Scroll to latest message
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // Idle bubble cycling — stops when panel is open
  useEffect(() => {
    if (open) {
      setIdleVisible(false);
      return;
    }

    let hideTimer: ReturnType<typeof setTimeout>;

    const showNext = () => {
      setIdleText(IDLE_PROMPTS[idleIndexRef.current % IDLE_PROMPTS.length]);
      idleIndexRef.current++;
      setIdleVisible(true);
      hideTimer = setTimeout(() => setIdleVisible(false), 5500);
    };

    // Delay first appearance so it doesn't fire while user is reading the hero
    const firstTimer = setTimeout(showNext, 9000);
    const cycleTimer = setInterval(showNext, 18000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(hideTimer!);
      clearInterval(cycleTimer);
    };
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim(),
      };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/anemone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next
              .filter((m) => m.id !== "greeting")
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok) throw new Error("api");
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message ?? "Nyan~ something went wrong. Try again! 🐱",
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "Nyan~ something went wrong. Try again! 🐱",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const resetChat = () => setMessages([GREETING]);

  const toggleOpen = () => {
    setOpen((v) => !v);
    setIdleVisible(false);
  };

  // Hidden by dashboard toggle — render nothing.
  // state.anemone.enabled is driven by the Overview and Anemone page toggles,
  // so this is immediately reactive within the same session.
  if (!state.anemone.enabled) return null;

  return (
    <div className="fixed bottom-6 left-5 z-50">

      {/* ─── Idle speech bubble ──────────────────────────────── */}
      <div
        className={cn(
          "absolute left-0 w-[230px] transition-all duration-300",
          idleVisible && !open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-2 pointer-events-none"
        )}
        style={{ bottom: "calc(56px + 16px)" }}
      >
        <div
          className="relative px-4 py-3 rounded-2xl rounded-bl-none shadow-2xl animate-bubble-pop"
          style={{
            background: "#1E1B18",
            border: "1px solid oklch(0.68 0.19 44 / 0.30)",
            boxShadow: "0 8px 32px oklch(0 0 0 / 0.4), 0 0 0 1px oklch(0.68 0.19 44 / 0.15)",
          }}
        >
          {/* Dismiss button */}
          <button
            onClick={() => setIdleVisible(false)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white/50 hover:text-white transition-colors z-10"
            style={{ background: "#2a2a2a", border: "1px solid oklch(1 0 0 / 0.10)" }}
          >
            ✕
          </button>

          <p className="text-[12px] text-white/80 leading-snug">{idleText}</p>

          {/* Tail pointing toward button */}
          <div
            className="absolute -bottom-2 left-4 w-4 h-4 rotate-45"
            style={{
              background: "#1E1B18",
              borderRight: "1px solid oklch(0.68 0.19 44 / 0.30)",
              borderBottom: "1px solid oklch(0.68 0.19 44 / 0.30)",
            }}
          />
        </div>
      </div>

      {/* ─── Chat panel ──────────────────────────────────────── */}
      <div
        className={cn(
          "absolute left-0 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-left",
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-4 scale-[0.96] pointer-events-none"
        )}
        style={{
          bottom: "calc(56px + 16px)",
          width: "min(360px, calc(100vw - 40px))",
          maxHeight: "min(520px, calc(100dvh - 110px))",
          background: "#111",
          border: "1px solid oklch(1 0 0 / 0.10)",
          boxShadow: "0 24px 80px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.68 0.19 44 / 0.08)",
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className="relative px-4 py-3.5 flex items-center justify-between flex-shrink-0 overflow-hidden"
          style={{ background: "#1a1a1a", borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          {/* Warm glow wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.68 0.19 44 / 0.09) 0%, transparent 55%)",
            }}
          />

          <div className="relative flex items-center gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.68 0.19 44 / 0.35) 0%, oklch(0.47 0.22 22 / 0.25) 100%)",
                  border: "1.5px solid oklch(0.68 0.19 44 / 0.45)",
                }}
              >
                🐱
              </div>
              {/* Online pulse ring */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 flex-shrink-0"
                style={{ border: "2px solid #1a1a1a" }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="font-heading font-black text-white text-sm">Anemone</p>
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded leading-none"
                  style={{ background: "oklch(0.68 0.19 44 / 0.20)", color: "oklch(0.68 0.19 44)" }}
                >
                  AI
                </span>
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: "oklch(1 0 0 / 0.30)" }}>
                YAA fandom guide · always online 🐾
              </p>
            </div>
          </div>

          {/* Header actions */}
          <div className="relative flex items-center gap-1">
            {hasUserMessages && (
              <button
                onClick={resetChat}
                title="New chat"
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "oklch(1 0 0 / 0.25)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(1 0 0 / 0.70)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(1 0 0 / 0.25)")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "oklch(1 0 0 / 0.25)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(1 0 0 / 0.80)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(1 0 0 / 0.25)")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Messages ───────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-0"
          style={{ scrollbarWidth: "none" }}
        >
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} msg={msg} isNew={i === messages.length - 1 && i > 0} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5 items-end animate-msg-in">
              <AvatarBubble />
              <div
                className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex flex-col gap-1"
                style={{ background: "oklch(1 0 0 / 0.06)" }}
              >
                <span
                  className="text-[11px]"
                  style={{ color: "oklch(0.68 0.19 44 / 0.65)" }}
                >
                  Anemone is thinking~
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "oklch(0.68 0.19 44 / 0.55)", animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "oklch(0.68 0.19 44 / 0.55)", animationDelay: "160ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "oklch(0.68 0.19 44 / 0.55)", animationDelay: "320ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Starter prompts — visible before first user message ── */}
        {!hasUserMessages && !loading && (
          <div
            className="px-4 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2.5"
              style={{ color: "oklch(1 0 0 / 0.22)" }}
            >
              Quick prompts
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {sessionStarters.map((s) => (
                <button
                  key={s.label}
                  onClick={() => send(s.msg)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "oklch(0.68 0.19 44 / 0.10)",
                    color: "oklch(0.68 0.19 44)",
                    border: "1px solid oklch(0.68 0.19 44 / 0.18)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.68 0.19 44 / 0.18)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(0.68 0.19 44 / 0.30)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.68 0.19 44 / 0.10)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(0.68 0.19 44 / 0.18)";
                  }}
                >
                  <span className="text-base leading-none flex-shrink-0">{s.emoji}</span>
                  <span className="leading-tight">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input ──────────────────────────────────────────── */}
        <div
          className="px-3 py-3 flex items-center gap-2 flex-shrink-0"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Anemone anything~"
            disabled={loading}
            className="flex-1 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none transition-all duration-200 disabled:opacity-50"
            style={{
              background: "oklch(1 0 0 / 0.05)",
              border: "1px solid oklch(1 0 0 / 0.08)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "oklch(0.68 0.19 44 / 0.50)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)")}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150",
              input.trim() && !loading
                ? "hover:scale-105 active:scale-95"
                : "cursor-not-allowed opacity-40"
            )}
            style={{
              background:
                input.trim() && !loading
                  ? "linear-gradient(135deg, oklch(0.72 0.20 48), oklch(0.55 0.22 28))"
                  : "oklch(1 0 0 / 0.06)",
              color: input.trim() && !loading ? "#fff" : "oklch(1 0 0 / 0.30)",
              boxShadow:
                input.trim() && !loading
                  ? "0 4px 14px oklch(0.68 0.19 44 / 0.35)"
                  : "none",
            }}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div
          className="px-4 py-2 flex-shrink-0 flex items-center justify-center gap-1.5"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.05)" }}
        >
          <span className="text-[9px]" style={{ color: "oklch(1 0 0 / 0.15)" }}>
            Anemone · YAA Store · Powered by{" "}
          </span>
          <span
            className="text-[9px] font-bold"
            style={{ color: "oklch(0.68 0.19 44 / 0.35)" }}
          >
            Claude
          </span>
        </div>
      </div>

      {/* ─── Floating button ─────────────────────────────────── */}
      <button
        onClick={toggleOpen}
        className={cn(
          "relative w-14 h-14 rounded-full flex items-center justify-center text-2xl",
          "transition-all duration-200 hover:scale-110 active:scale-90",
          !open && "animate-float"
        )}
        style={{
          background: "linear-gradient(135deg, oklch(0.72 0.20 48) 0%, oklch(0.55 0.22 28) 100%)",
          boxShadow: open
            ? "0 4px 20px oklch(0.68 0.19 44 / 0.40)"
            : "0 8px 32px oklch(0.68 0.19 44 / 0.55), 0 2px 8px oklch(0 0 0 / 0.3)",
        }}
        aria-label={open ? "Close Anemone chat" : "Chat with Anemone"}
      >
        {/* Icon */}
        <span
          className="transition-all duration-200 select-none leading-none"
          style={{ transform: open ? "scale(0.80) rotate(90deg)" : "scale(1) rotate(0deg)" }}
        >
          {open ? "✕" : "🐱"}
        </span>

        {/* Online dot */}
        {!open && (
          <span
            className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400"
            style={{ border: "2.5px solid oklch(0.55 0.22 28)" }}
          />
        )}

        {/* Notification badge when idle bubble is active */}
        {!open && idleVisible && (
          <span
            className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white animate-bubble-pop"
            style={{ background: "oklch(0.47 0.22 22)" }}
          >
            !
          </span>
        )}
      </button>
    </div>
  );
}

// ─── Avatar bubble ──────────────────────────────────────────────
function AvatarBubble() {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mb-0.5"
      style={{ background: "oklch(0.68 0.19 44 / 0.20)" }}
    >
      🐱
    </div>
  );
}

// ─── Message bubble ─────────────────────────────────────────────
function MessageBubble({ msg, isNew }: { msg: Message; isNew: boolean }) {
  const isAssistant = msg.role === "assistant";

  // Parse **bold** markdown
  function renderContent(text: string) {
    return text.split("\n").map((line, li) => {
      if (!line) return <br key={li} />;
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={li} className={li > 0 ? "mt-1.5" : ""}>
          {parts.map((part, pi) =>
            pi % 2 === 1 ? (
              <strong key={pi} className="font-bold" style={{ color: isAssistant ? "oklch(1 0 0 / 0.90)" : "#fff" }}>
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    });
  }

  return (
    <div
      className={cn(
        "flex gap-2.5 items-end",
        !isAssistant && "flex-row-reverse",
        isNew && "animate-msg-in"
      )}
    >
      {isAssistant && <AvatarBubble />}

      <div className={cn("flex flex-col gap-1", !isAssistant && "items-end", "max-w-[82%]")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
            isAssistant ? "rounded-bl-sm" : "rounded-br-sm"
          )}
          style={{
            background: isAssistant ? "oklch(1 0 0 / 0.07)" : "oklch(0.68 0.19 44 / 0.80)",
            color: isAssistant ? "oklch(1 0 0 / 0.75)" : "oklch(1 0 0 / 0.95)",
          }}
        >
          {renderContent(msg.content)}
        </div>
      </div>
    </div>
  );
}
