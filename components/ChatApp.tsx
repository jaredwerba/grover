"use client";

import { useState, useEffect } from "react";
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
  const [personalSuggestions, setPersonalSuggestions] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  function requestLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        // Persist for future sessions / cross-page reuse (fire-and-forget)
        fetch("/api/user/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        }).catch(() => {});
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    fetch("/api/user/favorites")
      .then((r) => (r.ok ? r.json() : { favorites: [] }))
      .then((data) => {
        const favs: { name: string }[] = data.favorites ?? [];
        if (favs.length === 0) return;
        const chips: string[] = [];
        const recent = favs.slice(-3);
        if (recent[0]) chips.push(`More strains like ${recent[0].name}`);
        chips.push("What's new in stock near me?");
        if (recent[1]) chips.push(`Compare ${recent[0].name} and ${recent[1].name}`);
        chips.push("What should I try next based on my favorites?");
        setPersonalSuggestions(chips);
      })
      .catch(() => {});
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
        body: JSON.stringify({
          messages: newMessages.slice(-HISTORY_LIMIT),
          userLocation,
        }),
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
        personalSuggestions={personalSuggestions}
      />
      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
        onRequestLocation={requestLocation}
        locating={locating}
        locationActive={!!userLocation}
      />
    </div>
  );
}
