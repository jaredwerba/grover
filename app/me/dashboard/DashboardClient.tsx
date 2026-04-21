"use client";

import { useState, useEffect } from "react";
import TokerTab from "./tabs/TokerTab";
import GrowerTab from "./tabs/GrowerTab";
import DispenserTab from "./tabs/DispenserTab";
import DashboardChat from "./DashboardChat";

export type Persona = "toker" | "grower" | "dispenser";

const TABS: { id: Persona; label: string; sub: string }[] = [
  { id: "toker", label: "Toker", sub: "Consumer" },
  { id: "grower", label: "Plant Manager", sub: "Cultivator Manufacture" },
  { id: "dispenser", label: "Sales Manager", sub: "Retail" },
];

function isPersona(v: string | null): v is Persona {
  return v === "toker" || v === "grower" || v === "dispenser";
}

export default function DashboardClient({ email }: { email: string }) {
  const [persona, setPersona] = useState<Persona>("toker");

  // On mount, hydrate persona from URL (?tab=…). Default is "toker".
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (isPersona(tab)) setPersona(tab);
  }, []);

  // Sync persona to URL so the Nav's Export button can read it.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", persona);
    window.history.replaceState(null, "", url.toString());
  }, [persona]);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-forest-deep">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-groovy text-amber tracking-wide leading-none mb-1">
              Me
            </h1>
            <p className="text-cream-muted text-sm break-all">
              Welcome back,{" "}
              <span className="text-cream font-medium">{email}</span>
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="shrink-0 border border-forest-mid text-cream-muted text-[10px] font-bold tracking-widest uppercase px-3 py-2 rounded-sm hover:border-amber/40 hover:text-cream transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex rounded-xl border border-forest-mid overflow-hidden">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPersona(tab.id)}
              className={`flex-1 py-3 transition-colors ${
                persona === tab.id
                  ? "bg-amber text-forest-deep"
                  : "text-cream-muted hover:text-cream"
              }`}
            >
              <p className={`text-sm font-bold leading-none ${persona === tab.id ? "text-forest-deep" : ""}`}>
                {tab.label}
              </p>
              <p className={`text-[10px] mt-0.5 ${persona === tab.id ? "text-forest-deep/70" : "text-cream-muted/60"}`}>
                {tab.sub}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content — key forces remount + re-animation on switch */}
      <div className="max-w-2xl mx-auto px-4 pb-32">
        {persona === "toker" && <TokerTab key="toker" />}
        {persona === "grower" && <GrowerTab key="grower" />}
        {persona === "dispenser" && <DispenserTab key="dispenser" />}
      </div>

      <DashboardChat persona={persona} />
    </div>
  );
}
