"use client";

import { useEffect, useState } from "react";

const DEFAULT_PROMPT = "You are ChatGPT, a helpful AI assistant made by OpenAI.";
const STORAGE_KEY = "chatgpt_system_prompt";

export default function SystemPromptDrawer({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (prompt: string) => void;
}) {
  const [value, setValue] = useState(DEFAULT_PROMPT);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setValue(saved);
  }, []);

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, value);
    onSave(value);
    onClose();
  }

  function handleReset() {
    setValue(DEFAULT_PROMPT);
    localStorage.setItem(STORAGE_KEY, DEFAULT_PROMPT);
    onSave(DEFAULT_PROMPT);
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#1a1a1a] border-l border-[#2f2f2f] z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2f2f2f]">
          <h2 className="text-white font-semibold text-base">System Prompt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto">
          <p className="text-gray-400 text-xs mb-3">
            Customize how the assistant behaves across the conversation.
          </p>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={12}
            className="w-full bg-[#0d0d0d] text-gray-100 text-sm border border-[#3f3f3f] rounded-xl p-3 resize-none outline-none focus:border-[#10a37f] transition-colors leading-relaxed"
            placeholder="Enter system instructions…"
          />
        </div>

        <div className="px-5 py-4 border-t border-[#2f2f2f] flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl border border-[#3f3f3f] text-gray-300 text-sm hover:bg-[#2f2f2f] transition-colors"
          >
            Reset to default
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#10a37f] text-white text-sm font-medium hover:bg-[#0d8f6e] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}

export { STORAGE_KEY, DEFAULT_PROMPT };
