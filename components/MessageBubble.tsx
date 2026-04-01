"use client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MessageBubble({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center text-forest-deep text-sm font-black shrink-0 mr-3 mt-1">
          C
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-forest text-cream rounded-br-sm border border-forest-mid"
            : "text-cream rounded-bl-sm"
        }`}
      >
        {message.content}
        {isStreaming && !isUser && (
          <span className="inline-block w-2 h-4 bg-amber/50 ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-forest-mid flex items-center justify-center text-cream text-sm font-bold shrink-0 ml-3 mt-1">
          U
        </div>
      )}
    </div>
  );
}
