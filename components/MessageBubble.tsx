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
        <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-white text-sm font-bold shrink-0 mr-3 mt-1">
          G
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-[#2f2f2f] text-white rounded-br-sm"
            : "text-gray-100 rounded-bl-sm"
        }`}
      >
        {message.content}
        {isStreaming && !isUser && (
          <span className="inline-block w-2 h-4 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[#5c5c5c] flex items-center justify-center text-white text-sm font-bold shrink-0 ml-3 mt-1">
          U
        </div>
      )}
    </div>
  );
}
