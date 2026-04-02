"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function JoinForm() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorParam === "invalid_token") {
      setErrorMessage("That sign-in link has expired or is invalid. Request a new one.");
    } else if (errorParam === "missing_token") {
      setErrorMessage("Invalid sign-in link. Please try again.");
    }
  }, [errorParam]);

  const isValid =
    email.includes("@") && email.includes(".") && ageConfirmed && termsAccepted;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setStatus("loading");
    setErrorMessage("");

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-amber flex items-center justify-center text-forest-deep text-2xl font-black mx-auto mb-6">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-cream mb-3">Check your email</h2>
        <p className="text-cream-muted mb-2 text-sm leading-relaxed">
          We sent a sign-in link to
        </p>
        <p className="text-amber font-medium mb-6">{email}</p>
        <p className="text-cream-muted text-xs leading-relaxed max-w-xs mx-auto">
          The link expires in 15 minutes. Check your spam folder if you
          don&apos;t see it.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-8 text-sm text-cream-muted hover:text-cream transition-colors underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="text-5xl font-groovy text-amber leading-none mb-1">
          C
        </div>
        <h1 className="text-3xl font-groovy text-cream mb-2">Join Cove</h1>
        <p className="text-cream-muted text-sm">
          Vermont&apos;s cannabis companion
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm text-cream-muted mb-1.5"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-forest-deep border border-forest-mid rounded-xl px-4 py-3 text-cream text-sm placeholder-cream-muted/40 outline-none focus:border-amber transition-colors"
          />
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                ageConfirmed
                  ? "bg-amber border-amber"
                  : "border-forest-mid group-hover:border-forest-light"
              }`}
            >
              {ageConfirmed && (
                <svg
                  className="w-3 h-3 text-forest-deep"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-cream-muted leading-relaxed">
            I confirm that I am{" "}
            <span className="text-cream font-medium">21 years of age or older</span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                termsAccepted
                  ? "bg-amber border-amber"
                  : "border-forest-mid group-hover:border-forest-light"
              }`}
            >
              {termsAccepted && (
                <svg
                  className="w-3 h-3 text-forest-deep"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-cream-muted leading-relaxed">
            I agree to use Cove responsibly and in accordance with Vermont state
            law
          </span>
        </label>

        <button
          type="submit"
          disabled={!isValid || status === "loading"}
          className="w-full bg-amber text-forest-deep font-bold py-3.5 rounded-full hover:bg-amber-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm mt-2"
        >
          {status === "loading" ? "Sending…" : "Send sign-in link"}
        </button>
      </form>

      <p className="text-center text-xs text-cream-muted mt-6">
        Already have an account? Just enter your email above.
      </p>
      <p className="text-center text-xs text-cream-muted mt-2">
        <Link href="/" className="hover:text-cream transition-colors">
          ← Back to Cove
        </Link>
      </p>
      <p className="text-center text-xs text-cream-muted/40 mt-4">
        <Link href="/login" className="hover:text-cream-muted transition-colors">
          Admin sign in
        </Link>
      </p>
    </>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-forest-deep flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm bg-forest rounded-2xl border border-forest-mid p-8">
        <Suspense>
          <JoinForm />
        </Suspense>
      </div>
    </div>
  );
}
