"use client";

import { useState, useRef, useEffect } from "react";
import type { Persona } from "./DashboardClient";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS: Record<Persona, string[]> = {
  toker: [
    "What's my most-used strain?",
    "How much did I spend this month?",
    "Which effect do I log most?",
  ],
  grower: [
    "When does Blue Dream #3 finish?",
    "Is my humidity in range?",
    "How does my yield compare to target?",
  ],
  dispenser: [
    "What's my best-selling product?",
    "When is peak traffic today?",
    "What needs to be reordered?",
  ],
};

const FAKE_RESPONSES: Record<Persona, Record<string, string>> = {
  toker: {
    "What's my most-used strain?":
      "Your most-used strain is **Blue Dream** with 12 sessions this month — that's 44% of your total. It looks like you tend to reach for it on weekend evenings.",
    "How much did I spend this month?":
      "You've spent **$124** so far this month across 3 dispensaries. Ceres Natural Remedies accounts for most of that. You're tracking slightly under your $150 monthly budget.",
    "Which effect do I log most?":
      "**Relaxed** leads at 45%, followed by Creative at 28%. You mostly log effects on weekday evenings — looks like it's part of your wind-down routine.",
  },
  grower: {
    "When does Blue Dream #3 finish?":
      "Blue Dream #3 is on day 38 of a 56-day cycle — **18 days to harvest**. It's deep in flowering right now. Keep your temps in the 68–72°F range and watch the trichomes this week.",
    "Is my humidity in range?":
      "Humidity is at **58%** right now, which is inside your late-flower target of 45–60%. You're in good shape. VPD is sitting at 1.1 kPa — optimal for this stage.",
    "How does my yield compare to target?":
      "You hit **155g** last harvest in December vs a 140g target — that's 10% over. Your October harvest was the strongest of the year. January is still in progress.",
  },
  dispenser: {
    "What's my best-selling product?":
      "**Blue Dream 3.5g** is your top seller with 48 units moved this month, generating $864 in revenue. It outsells your next product by nearly 35%.",
    "When is peak traffic today?":
      "Today's peak hour was **5 PM** with 22 transactions. Your afternoon rush (3–6 PM) accounts for roughly 40% of daily volume. Consider having extra staff on during that window.",
    "What needs to be reordered?":
      "You have **3 products** below your reorder threshold: Gorilla Glue Vape (2 units), Pineapple Express 7g (4 units), and Gelato Pre-Roll 1pk (6 units). Gorilla Glue is most urgent.",
  },
};

function getResponse(persona: Persona, text: string): string {
  const exact = FAKE_RESPONSES[persona][text];
  if (exact) return exact;
  const lower = text.toLowerCase();
  if (lower.includes("strain")) return FAKE_RESPONSES[persona][Object.keys(FAKE_RESPONSES[persona])[0]];
  return "Great question — I'm analyzing your data now. Based on what I see, things are looking solid. Want to dig into a specific metric?";
}

function parseMarkdown(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-cream font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function DashboardChat({ persona }: { persona: Persona }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Reset messages when persona changes
  useEffect(() => {
    setMessages([]);
  }, [persona]);

  function sendMessage(text: string) {
    if (!text.trim() || typing) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = getResponse(persona, text.trim());
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setTyping(false);
    }, 1400);
  }

  const suggestions = SUGGESTIONS[persona];
  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-amber shadow-lg flex items-center justify-center transition-transform active:scale-95"
        aria-label="Open data chat"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="#1a2e1a" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M4 4h14a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 4V5a1 1 0 011-1z"
              fill="#1a2e1a"
            />
          </svg>
        )}
      </button>

      {/* Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 flex flex-col"
        style={{
          height: "65vh",
          maxWidth: 672,
          margin: "0 auto",
          borderRadius: "1.25rem 1.25rem 0 0",
          background: "var(--color-forest, #1e3a1e)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 380ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 shrink-0 border-b border-white/8">
          <p className="text-cream text-sm font-semibold leading-none">Ask your data</p>
          <p className="text-cream-muted/60 text-[10px] mt-0.5 capitalize">{persona} insights</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {isEmpty && (
            <div className="space-y-2 pt-1">
              <p className="text-cream-muted/60 text-xs text-center mb-4">Try asking…</p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs text-cream-muted bg-forest-mid/60 rounded-xl px-4 py-2.5 hover:bg-forest-mid transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-amber text-forest-deep font-medium rounded-br-sm"
                    : "bg-forest-mid text-cream-muted rounded-bl-sm"
                }`}
              >
                {m.role === "assistant" ? parseMarkdown(m.text) : m.text}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-forest-mid rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-cream-muted/50"
                    style={{
                      animation: "bounce 1.2s infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {!isEmpty && !typing && messages[messages.length - 1]?.role === "assistant" && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {suggestions.slice(0, 2).map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] text-cream-muted/70 bg-forest-mid/60 rounded-full px-3 py-1 hover:bg-forest-mid transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-6 pt-2 shrink-0 border-t border-white/8">
          <div className="flex gap-2 items-center bg-forest-mid rounded-xl px-3 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Ask about your data…"
              className="flex-1 bg-transparent text-cream text-sm outline-none placeholder:text-cream-muted/40 min-w-0"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              className="w-7 h-7 rounded-lg bg-amber flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}
