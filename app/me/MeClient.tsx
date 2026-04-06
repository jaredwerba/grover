"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Tab = "register" | "signin";
type Status = "idle" | "loading" | "error";

export default function MePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("register");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = email.includes("@") && email.includes(".");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail || status === "loading") return;
    setStatus("loading");
    setErrorMessage("");

    try {
      // 1. Get registration options
      const optRes = await fetch(
        `/api/auth/passkey/register-options?email=${encodeURIComponent(email)}`
      );
      if (!optRes.ok) throw new Error("Failed to start registration");
      const { options, challengeToken } = await optRes.json();

      // 2. Trigger Face ID / Touch ID
      const { startRegistration } = await import("@simplewebauthn/browser");
      const registrationResponse = await startRegistration({ optionsJSON: options });

      // 3. Verify on server
      const verifyRes = await fetch("/api/auth/passkey/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, registrationResponse, email }),
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error ?? "Registration failed");
      }

      router.push("/me/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("NotAllowed") || msg.toLowerCase().includes("cancelled")) {
        setErrorMessage("Face ID was cancelled. Try again.");
      } else {
        setErrorMessage(msg);
      }
      setStatus("idle");
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail || status === "loading") return;
    setStatus("loading");
    setErrorMessage("");

    try {
      // 1. Get auth options
      const optRes = await fetch("/api/auth/passkey/auth-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (optRes.status === 404) {
        setErrorMessage("No passkey found for this email. Create an account first.");
        setTab("register");
        setStatus("idle");
        return;
      }
      if (!optRes.ok) throw new Error("Failed to start sign in");
      const { options, challengeToken } = await optRes.json();

      // 2. Trigger Face ID / Touch ID
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const authResponse = await startAuthentication({ optionsJSON: options });

      // 3. Verify on server
      const verifyRes = await fetch("/api/auth/passkey/auth-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, authResponse, email }),
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        throw new Error(data.error ?? "Sign in failed");
      }

      router.push("/me/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("NotAllowed") || msg.toLowerCase().includes("cancelled")) {
        setErrorMessage("Face ID was cancelled. Try again.");
      } else {
        setErrorMessage(msg);
      }
      setStatus("idle");
    }
  }

  return (
    <div className="min-h-screen bg-forest-deep flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm bg-forest rounded-2xl border border-forest-mid p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-groovy text-cream mb-2 tracking-wide leading-tight">
            Me
          </h1>
          <p className="text-cream-muted text-sm">Your personal Cove space</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl border border-forest-mid overflow-hidden mb-6">
          <button
            onClick={() => { setTab("register"); setErrorMessage(""); }}
            className={`flex-1 text-sm font-medium py-2.5 transition-colors ${
              tab === "register"
                ? "bg-amber text-forest-deep"
                : "text-cream-muted hover:text-cream"
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => { setTab("signin"); setErrorMessage(""); }}
            className={`flex-1 text-sm font-medium py-2.5 transition-colors ${
              tab === "signin"
                ? "bg-amber text-forest-deep"
                : "text-cream-muted hover:text-cream"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-5">
            {errorMessage}
          </div>
        )}

        {/* Register form */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-email" className="block text-sm text-cream-muted mb-1.5">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-forest-deep border border-forest-mid rounded-xl px-4 py-3 text-cream text-sm placeholder-cream-muted/40 outline-none focus:border-amber transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!isValidEmail || status === "loading"}
              className="w-full bg-amber text-forest-deep font-bold py-3.5 rounded-full hover:bg-amber-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                "Setting up Face ID…"
              ) : (
                <>
                  <FaceIdIcon />
                  Create account with Face ID
                </>
              )}
            </button>

            <p className="text-center text-xs text-cream-muted/60 leading-relaxed">
              Your account is secured with Face ID or Touch ID.
              No password required.
            </p>
          </form>
        )}

        {/* Sign in form */}
        {tab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-sm text-cream-muted mb-1.5">
                Email address
              </label>
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-forest-deep border border-forest-mid rounded-xl px-4 py-3 text-cream text-sm placeholder-cream-muted/40 outline-none focus:border-amber transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!isValidEmail || status === "loading"}
              className="w-full bg-amber text-forest-deep font-bold py-3.5 rounded-full hover:bg-amber-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                "Verifying…"
              ) : (
                <>
                  <FaceIdIcon />
                  Sign in with Face ID
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-cream-muted mt-6">
          <Link href="/" className="hover:text-cream transition-colors">
            ← Back to Cove
          </Link>
        </p>
      </div>
    </div>
  );
}

function FaceIdIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 7V5a2 2 0 012-2h2" />
      <path d="M22 7V5a2 2 0 00-2-2h-2" />
      <path d="M2 17v2a2 2 0 002 2h2" />
      <path d="M22 17v2a2 2 0 01-2 2h-2" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
      <path d="M9 13a3 3 0 006 0" />
    </svg>
  );
}
