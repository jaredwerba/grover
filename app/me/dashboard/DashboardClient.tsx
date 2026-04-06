"use client";

import { useState } from "react";
import TokerTab from "./tabs/TokerTab";
import GrowerTab from "./tabs/GrowerTab";
import DispenserTab from "./tabs/DispenserTab";
import DashboardChat from "./DashboardChat";

export type Persona = "toker" | "grower" | "dispenser";

const TABS: { id: Persona; label: string; sub: string }[] = [
  { id: "toker", label: "Toker", sub: "Consumer" },
  { id: "grower", label: "Grower", sub: "Cultivator" },
  { id: "dispenser", label: "Dispenser", sub: "Retail" },
];

export default function DashboardClient({ email }: { email: string }) {
  const [persona, setPersona] = useState<Persona>("toker");

  return (
    <div className="min-h-screen bg-forest-deep">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-4">
        <h1 className="text-3xl font-groovy text-amber tracking-wide leading-none mb-1">
          Me
        </h1>
        <p className="text-cream-muted text-sm">
          Welcome back,{" "}
          <span className="text-cream font-medium">{email}</span>
        </p>
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
