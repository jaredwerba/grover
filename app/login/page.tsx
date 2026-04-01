"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/chat");
    } else {
      setError("Invalid username or password.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-forest-deep flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm bg-forest rounded-2xl border border-forest-mid p-8">
        <div className="text-center mb-8">
          <div className="text-5xl font-black text-amber leading-none tracking-tighter mb-1">
            C
          </div>
          <h1 className="text-3xl font-bold text-cream mb-2">Sign in</h1>
          <p className="text-cream-muted text-sm">Admin access</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm text-cream-muted mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              autoComplete="username"
              className="w-full bg-forest-deep border border-forest-mid rounded-xl px-4 py-3 text-cream text-sm placeholder-cream-muted/40 outline-none focus:border-amber transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-cream-muted mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-forest-deep border border-forest-mid rounded-xl px-4 py-3 text-cream text-sm placeholder-cream-muted/40 outline-none focus:border-amber transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-amber text-forest-deep font-bold py-3.5 rounded-full hover:bg-amber-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm mt-2"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-cream-muted mt-6">
          <Link href="/join" className="hover:text-cream transition-colors">
            Sign in with magic link instead
          </Link>
        </p>
        <p className="text-center text-xs text-cream-muted mt-2">
          <Link href="/" className="hover:text-cream transition-colors">
            ← Back to Cove
          </Link>
        </p>
      </div>
    </div>
  );
}
