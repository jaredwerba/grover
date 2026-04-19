"use client";

import { useState } from "react";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Cap how many prior turns we ship to the model. 16 ≈ 8 exchanges —
// enough for coherent follow-ups, not enough to drift or bloat cost.
const HISTORY_LIMIT = 16;

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
        body: JSON.stringify({ messages: newMessages.slice(-HISTORY_LIMIT) }),
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
      <ChatWindow
        messages={messages}
        isStreaming={isStreaming}
        onSuggest={sendMessage}
      />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
