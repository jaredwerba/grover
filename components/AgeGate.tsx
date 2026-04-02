"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cove_age_verified";

export default function AgeGate({ children }: { children: React.ReactNode }) {
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
          <div
            className="text-center max-w-xs px-10 py-12 border-2 border-amber/40 relative"
            style={{ boxShadow: "inset 0 0 0 4px rgba(255,185,0,0.1)" }}
          >
            {/* Corner marks */}
            <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber/60" />
            <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber/60" />
            <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber/60" />
            <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber/60" />

            <p className="text-amber/60 text-xs tracking-[0.3em] uppercase mb-4">Vermont · Cannabis</p>
            <div className="text-7xl font-groovy text-amber mb-1 leading-none">
              C
            </div>
            <h1 className="text-3xl font-groovy text-cream mb-3">
              Cove
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-amber/25" />
              <span className="text-amber/40 text-xs">✦</span>
              <div className="flex-1 h-px bg-amber/25" />
            </div>
            <p className="text-cream-muted text-xs tracking-widest uppercase mb-8">
              Adults Only · 21+
            </p>
            <p className="text-cream mb-6 text-sm leading-relaxed">
              You must be 21 or older to enter.
            </p>
            <button
              onClick={handleConfirm}
              className="w-full bg-amber text-forest-deep font-bold py-3.5 rounded-sm mb-3 hover:bg-amber-hover transition-colors text-xs tracking-widest uppercase"
            >
              I am 21 or older — Enter
            </button>
            <button
              onClick={handleDeny}
              className="w-full text-cream-muted text-xs hover:text-cream transition-colors tracking-widest uppercase"
            >
              I am under 21 — Exit
            </button>
          </div>
        </div>
      )}
    </>
  );
}
