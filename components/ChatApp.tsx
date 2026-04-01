"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

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
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Error ${res.status}`);
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
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setMessages([
        ...newMessages,
        { role: "assistant", content: `Sorry, I ran into an error: ${msg}` },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-forest-mid shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-amber flex items-center justify-center text-forest-deep text-xs font-black">
            C
          </div>
          <span className="text-cream font-bold text-sm tracking-tight">
            Cove
          </span>
          <span className="text-[10px] text-cream-muted bg-forest-mid px-2 py-0.5 rounded-full">
            AI Concierge
          </span>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-cream-muted hover:text-cream transition-colors text-xs px-3 py-1.5 rounded-lg hover:bg-forest"
            >
              New chat
            </button>
          )}
          <Link
            href="/trail"
            className="text-cream-muted hover:text-cream transition-colors text-xs px-3 py-1.5 rounded-lg hover:bg-forest"
          >
            Cannatrail
          </Link>
        </div>
      </header>

      <ChatWindow messages={messages} isStreaming={isStreaming} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
