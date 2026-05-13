"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const AI_GREETING =
  "Hey — I'm Cove. Ask me anything about Vermont cannabis: strains, dispensaries, effects, or dosing.";
const USER_QUERY = "where is the best locally grown blue dragon?";

type Phase =
  | "idle"        // nothing visible yet
  | "ai-done"     // greeting fully visible, pause
  | "user-typing"  // user query typing into input bar
  | "user-sent"    // user message appears as bubble
  | "bot-dots"     // typing indicator dots
  | "done";        // final state — button becomes JOIN

export default function HeroChat() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [aiText, setAiText] = useState("");
  const [inputText, setInputText] = useState("");
  const [userText, setUserText] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRun = useRef(false);

  // ── Sequencer ──
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Start: show AI greeting immediately, then pause before user types
    const start = setTimeout(() => {
      setAiText(AI_GREETING);
      setPhase("ai-done");
    }, 800);
    return () => clearTimeout(start);
  }, []);

  // ── Pause after AI greeting, then user starts typing ──
  useEffect(() => {
    if (phase !== "ai-done") return;
    const t = setTimeout(() => setPhase("user-typing"), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  // ── User query typewriter into the input bar ──
  useEffect(() => {
    if (phase !== "user-typing") return;
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setInputText(USER_QUERY.slice(0, i));
      if (i >= USER_QUERY.length) {
        clearInterval(intervalRef.current!);
        setTimeout(() => {
          // "Send" the message
          setUserText(USER_QUERY);
          setInputText("");
          setPhase("user-sent");
        }, 500);
      }
    }, 38);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase]);

  // ── Show typing dots after user sends ──
  useEffect(() => {
    if (phase !== "user-sent") return;
    const t = setTimeout(() => setPhase("bot-dots"), 600);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Final state ──
  useEffect(() => {
    if (phase !== "bot-dots") return;
    const t = setTimeout(() => setPhase("done"), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  const showAi = phase !== "idle";
  const showUser = !!userText;
  const showDots = phase === "bot-dots" || phase === "done";
  const isDone = phase === "done";

  return (
    <section className="w-full">
      <div className="px-6 pb-16 max-w-2xl mx-auto">
        {/* Chat window */}
        <div
          className={`border border-forest-mid rounded-sm overflow-hidden transition-opacity duration-700 ${
            showAi ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "#071a0e",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,185,0,0.08)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b border-forest-mid/60"
            style={{ background: "#0a2214" }}
          >
            <div className="w-2 h-2 rounded-full bg-amber" />
            <span className="text-amber text-xs tracking-widest uppercase font-bold">
              Cove AI
            </span>
            <span className="text-cream-muted/40 text-xs ml-auto">
              Cannabis Concierge
            </span>
          </div>

          {/* Messages */}
          <div className="px-4 py-5 space-y-4 min-h-[180px]">
            {/* AI greeting */}
            {showAi && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-6 h-6 rounded-sm bg-amber/20 border border-amber/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-amber text-xs font-bold">C</span>
                </div>
                <div
                  className="rounded-sm px-4 py-3 max-w-xs"
                  style={{ background: "#0f2d1c" }}
                >
                  <p className="text-cream text-sm leading-relaxed">
                    {aiText}
                  </p>
                </div>
              </div>
            )}

            {/* User message */}
            {showUser && (
              <div className="flex gap-3 justify-end animate-fade-in">
                <div
                  className="rounded-sm px-4 py-3 max-w-xs"
                  style={{
                    background: "#1a3d28",
                    border: "1px solid rgba(255,185,0,0.15)",
                  }}
                >
                  <p className="text-cream text-sm leading-relaxed">
                    {userText}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-sm bg-forest-mid border border-forest-mid flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-cream-muted text-xs">U</span>
                </div>
              </div>
            )}

            {/* AI typing indicator */}
            {showDots && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-6 h-6 rounded-sm bg-amber/20 border border-amber/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-amber text-xs font-bold">C</span>
                </div>
                <div
                  className="rounded-sm px-4 py-3"
                  style={{ background: "#0f2d1c" }}
                >
                  <div className="flex gap-1 items-center h-4">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input bar */}
          <div
            className="border-t border-forest-mid/60 px-4 py-3 flex gap-3 items-center"
            style={{ background: "#0a2214" }}
          >
            <div className="flex-1 text-sm min-h-[20px]">
              {inputText ? (
                <span className="text-cream">{inputText}<span className="inline-block w-0.5 h-4 bg-cream/70 ml-0.5 animate-pulse align-text-bottom" /></span>
              ) : (
                <span className="text-cream-muted/40">
                  {isDone ? "Ask Cove anything..." : "Type a message..."}
                </span>
              )}
            </div>
            {isDone ? (
              <Link
                href="/join"
                className="bg-amber text-forest-deep text-xs font-bold px-4 py-2 rounded-sm tracking-widest uppercase hover:bg-amber-hover transition-colors"
              >
                Join
              </Link>
            ) : phase === "user-typing" ? (
              <span className="bg-amber/80 text-forest-deep text-xs font-bold px-4 py-2 rounded-sm tracking-widest uppercase">
                Send
              </span>
            ) : (
              <span className="bg-amber/30 text-forest-deep/50 text-xs font-bold px-4 py-2 rounded-sm tracking-widest uppercase">
                Send
              </span>
            )}
          </div>
        </div>

        <p
          className={`text-center text-cream-muted text-sm tracking-wide mt-4 transition-opacity duration-500 ${
            isDone ? "opacity-100" : "opacity-0"
          }`}
        >
          Join to unlock the full Cove experience
        </p>
      </div>
    </section>
  );
}
