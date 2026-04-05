"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What's a good strain for a first-timer?",
  "Find me a dispensary near Burlington",
  "Edibles vs smoking — what's the difference?",
  "What are terpenes and why do they matter?",
];

export default function ChatWindow({
  messages,
  isStreaming,
  onSuggest,
}: {
  messages: Message[];
  isStreaming: boolean;
  onSuggest: (msg: string) => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <section
        className="flex-1 flex flex-col items-center justify-center px-4 pb-4"
        aria-label="Start a conversation with Cove AI"
      >
        {/* Wordmark */}
        <p className="font-groovy text-amber text-5xl sm:text-6xl leading-none tracking-wide mb-3">
          Cove
        </p>
        <p className="text-cream-muted text-sm max-w-xs text-center leading-relaxed mb-8">
          Your Vermont cannabis companion. Ask about strains, dispensaries, dosing, or anything cannabis.
        </p>

        {/* Suggestion chips */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md"
          role="list"
          aria-label="Suggested questions"
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              role="listitem"
              onClick={() => onSuggest(s)}
              className="text-left text-sm text-cream-muted bg-forest/60 border border-forest-mid/60 rounded-xl px-4 py-3 hover:border-amber/40 hover:text-cream hover:bg-forest transition-colors leading-snug"
            >
              {s}
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Conversation with Cove AI"
      className="flex-1 overflow-y-auto px-4 py-5"
    >
      <div className="max-w-2xl mx-auto space-y-1">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isStreaming={
              isStreaming &&
              i === messages.length - 1 &&
              msg.role === "assistant"
            }
          />
        ))}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </div>
  );
}
