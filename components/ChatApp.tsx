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

      if (!res.ok || !res.body) throw new Error(`Error ${res.status}`);

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
    <div
      className="flex flex-col bg-forest-deep"
      style={{ height: "calc(100dvh - 56px)" }}
    >
      {/* Slim header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b border-forest-mid/50 shrink-0"
        style={{ background: "rgba(11,45,27,0.9)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2">
          <span className="font-groovy text-amber text-xl leading-none tracking-wide">
            Cove
          </span>
          <span className="text-[10px] text-cream-muted/70 bg-forest-mid/50 px-2 py-0.5 rounded-full tracking-widest uppercase font-semibold">
            AI
          </span>
        </div>

        <nav className="flex items-center gap-1" aria-label="Chat navigation">
          <Link
            href="/trail"
            className="text-cream-muted hover:text-cream transition-colors text-xs px-3 py-1.5 rounded-lg hover:bg-forest-mid/40"
          >
            Cannatrail
          </Link>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              aria-label="Start a new conversation"
              className="text-cream-muted hover:text-cream transition-colors text-xs px-3 py-1.5 rounded-lg hover:bg-forest-mid/40"
            >
              New chat
            </button>
          )}
        </nav>
      </header>

      <ChatWindow
        messages={messages}
        isStreaming={isStreaming}
        onSuggest={sendMessage}
      />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
