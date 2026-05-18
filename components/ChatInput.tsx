"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatInput({
  onSend,
  disabled,
  onRequestLocation,
  locating,
  locationActive,
}: {
  onSend: (message: string) => void;
  disabled: boolean;
  onRequestLocation: () => void;
  locating: boolean;
  locationActive: boolean;
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
          className="flex items-end gap-2 rounded-2xl border-2 px-4 py-2.5 transition-colors focus-within:border-amber/70 focus-within:shadow-[0_0_0_4px_rgba(255,185,0,0.08)]"
          style={{
            background: "#1f4830",
            borderColor: disabled ? "rgba(255,185,0,0.15)" : "rgba(255,185,0,0.35)",
          }}
        >
          <button
            type="button"
            onClick={onRequestLocation}
            disabled={locating || disabled}
            aria-label={locationActive ? "Location enabled — tap to refresh" : "Use my location for nearby recommendations"}
            title={locationActive ? "Location on — Cove can recommend nearby dispensaries" : "Use my location"}
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mb-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              locationActive
                ? "bg-amber/20 text-amber border border-amber/40 hover:bg-amber/30"
                : "bg-forest-mid/40 text-cream-muted border border-forest-mid hover:text-cream hover:bg-forest-mid/60"
            }`}
          >
            {locating ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
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
            className="flex-1 bg-transparent text-cream text-sm placeholder-cream-muted/70 resize-none outline-none leading-relaxed min-h-[24px] max-h-[180px] disabled:opacity-60 font-quicksand"
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
