"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }

  const canSend = !!value.trim() && !disabled;

  return (
    <div
      className="border-t border-forest-mid/50 px-3 py-3 shrink-0"
      style={{ background: "rgba(11,45,27,0.95)" }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="flex items-end gap-2 rounded-2xl border px-4 py-2.5 transition-colors"
          style={{
            background: "#1a3d28",
            borderColor: disabled ? "rgba(39,94,60,0.5)" : "rgba(39,94,60,0.8)",
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Message Cove AI
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Cove is responding…" : "Ask Cove anything…"}
            disabled={disabled}
            rows={1}
            aria-label="Message Cove AI"
            aria-multiline="true"
            className="flex-1 bg-transparent text-cream text-sm placeholder-cream-muted/40 resize-none outline-none leading-relaxed min-h-[24px] max-h-[180px] disabled:opacity-60 font-quicksand"
          />
          <button
            onClick={submit}
            disabled={!canSend}
            aria-label={disabled ? "Waiting for response" : "Send message"}
            aria-busy={disabled}
            className="w-8 h-8 rounded-full bg-amber flex items-center justify-center shrink-0 mb-0.5 disabled:opacity-25 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          >
            {disabled ? (
              /* Spinner while streaming */
              <svg
                className="w-4 h-4 text-forest-deep animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              /* Send arrow */
              <svg
                className="w-4 h-4 text-forest-deep"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-cream-muted/40 mt-2 leading-tight">
          Informational only · Not medical advice
        </p>
      </div>
    </div>
  );
}
