"use client";

import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import SystemPromptDrawer, {
  DEFAULT_PROMPT,
  STORAGE_KEY,
} from "./SystemPromptDrawer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSystemPrompt(saved);
  }, []);

  async function sendMessage(content: string) {
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, systemPrompt }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`API error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantContent },
        ]);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong.";
      setMessages([
        ...newMessages,
        { role: "assistant", content: `Error: ${errorMsg}` },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-[#2f2f2f] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#10a37f] flex items-center justify-center text-white text-xs font-bold">
            G
          </div>
          <span className="text-white font-semibold text-sm">ChatGPT</span>
          <span className="text-[10px] text-gray-500 bg-[#2f2f2f] px-2 py-0.5 rounded-full">
            GPT-4o
          </span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-gray-400 hover:text-white transition-colors text-xs px-3 py-1.5 rounded-lg hover:bg-[#2f2f2f]"
            >
              New chat
            </button>
          )}
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-[#2f2f2f]"
            aria-label="System prompt settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Chat area */}
      <ChatWindow messages={messages} isStreaming={isStreaming} />

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />

      {/* System prompt drawer */}
      <SystemPromptDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={setSystemPrompt}
      />
    </div>
  );
}
