"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "grover", password: "papag" }),
    });
    if (res.ok) {
      router.push("/chat");
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-amber text-forest-deep font-bold px-10 py-4 rounded-full hover:bg-amber-hover transition-colors text-base disabled:opacity-60"
    >
      {loading ? "Signing in…" : "Sign in"}
    </button>
  );
}
