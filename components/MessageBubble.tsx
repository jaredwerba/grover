"use client";

import { Fragment, ReactNode } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Match markdown links [text](url) first, then bare http(s) URLs.
const LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;

function renderWithLinks(content: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  LINK_REGEX.lastIndex = 0;
  while ((match = LINK_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`t-${key++}`}>{content.slice(lastIndex, match.index)}</Fragment>
      );
    }

    const [full, mdText, mdUrl, bareUrl] = match;
    const href = mdUrl ?? bareUrl;
    const label = mdText ?? (bareUrl ? bareUrl.replace(/^https?:\/\//, "") : full);

    nodes.push(
      <a
        key={`l-${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber underline underline-offset-2 hover:text-amber-hover break-all"
      >
        {label}
      </a>
    );

    lastIndex = match.index + full.length;
  }

  if (lastIndex < content.length) {
    nodes.push(<Fragment key={`t-${key++}`}>{content.slice(lastIndex)}</Fragment>);
  }

  return nodes;
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
        {message.content ? renderWithLinks(message.content) : null}
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
