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
    <article
      aria-label={isUser ? "Your message" : "Cove AI response"}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {/* Cove avatar */}
      {!isUser && (
        <div
          aria-hidden="true"
          className="w-7 h-7 rounded-full bg-amber flex items-center justify-center text-forest-deep text-xs font-groovy shrink-0 mr-2.5 mt-1"
        >
          C
        </div>
      )}

      <div
        className={`max-w-[82%] sm:max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-forest border border-forest-mid text-cream rounded-tr-sm"
            : "bg-forest-deep/80 border border-forest-mid/40 text-cream rounded-tl-sm"
        }`}
      >
        {message.content || (isStreaming ? null : null)}
        {isStreaming && (
          <span
            aria-label="Cove is typing"
            className="inline-flex gap-1 ml-1 align-middle"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        )}
      </div>
    </article>
  );
}
