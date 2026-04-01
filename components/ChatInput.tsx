"use client";

import { useRef, useState } from "react";

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
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
    }
  }

  return (
    <div className="border-t border-forest-mid bg-forest-deep px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-forest rounded-2xl border border-forest-mid px-4 py-3 focus-within:border-amber transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask Cove…"
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-cream text-sm placeholder-cream-muted/50 resize-none outline-none leading-relaxed min-h-[24px] max-h-[200px] disabled:opacity-50"
          />
          <button
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="w-8 h-8 rounded-full bg-amber flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-hover transition-colors"
            aria-label="Send message"
          >
            <svg
              className="w-4 h-4 text-forest-deep"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
              />
            </svg>
          </button>
        </div>
        <p className="text-center text-[11px] text-cream-muted/60 mt-2">
          Cove is for informational purposes only. Not medical advice.
        </p>
      </div>
    </div>
  );
}
