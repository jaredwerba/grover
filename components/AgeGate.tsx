"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cove_age_verified";

export default function AgeGate({ children }: { children: React.ReactNode }) {
  // Start hidden (not blocking) — show gate only once we confirm unverified
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== "true") {
      setShowGate(true);
    }
  }, []);

  function handleConfirm() {
    localStorage.setItem(STORAGE_KEY, "true");
    setShowGate(false);
  }

  function handleDeny() {
    window.location.href = "https://google.com";
  }

  return (
    <>
      {children}
      {showGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-forest-deep">
          <div className="text-center max-w-xs px-8 py-12">
            <div className="text-7xl font-black text-amber mb-1 leading-none tracking-tighter">
              C
            </div>
            <h1 className="text-3xl font-bold text-cream mb-2 tracking-tight">
              Cove
            </h1>
            <p className="text-cream-muted text-sm mb-10 leading-relaxed">
              Your Vermont cannabis companion
            </p>
            <p className="text-cream mb-6 text-base font-medium">
              You must be 21 or older to enter.
            </p>
            <button
              onClick={handleConfirm}
              className="w-full bg-amber text-forest-deep font-bold py-3.5 rounded-full mb-3 hover:bg-amber-hover transition-colors text-sm"
            >
              I am 21 or older — Enter
            </button>
            <button
              onClick={handleDeny}
              className="w-full text-cream-muted text-sm hover:text-cream transition-colors"
            >
              I am under 21 — Exit
            </button>
          </div>
        </div>
      )}
    </>
  );
}
