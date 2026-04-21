"use client";

import { useState } from "react";
import TokerTab from "./tabs/TokerTab";
import GrowerTab from "./tabs/GrowerTab";
import DispenserTab from "./tabs/DispenserTab";
import DashboardChat from "./DashboardChat";
import { exportDashboardPdf } from "@/lib/export-pdf";

export type Persona = "toker" | "grower" | "dispenser";

const TABS: { id: Persona; label: string; sub: string }[] = [
  { id: "toker", label: "Toker", sub: "Consumer" },
  { id: "grower", label: "Plant Manager", sub: "Cultivator Manufacture" },
  { id: "dispenser", label: "Sales Manager", sub: "Retail" },
];

export default function DashboardClient({ email }: { email: string }) {
  const [persona, setPersona] = useState<Persona>("toker");

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  function handleExport() {
    exportDashboardPdf({ email, persona });
  }

  return (
    <div className="min-h-screen bg-forest-deep">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-3xl font-groovy text-amber tracking-wide leading-none mb-1">
              Me
            </h1>
            <p className="text-cream-muted text-sm truncate">
              Welcome back,{" "}
              <span className="text-cream font-medium">{email}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExport}
              className="bg-amber text-forest-deep text-[10px] font-bold tracking-widest uppercase px-3 py-2 rounded-sm hover:bg-amber-hover transition-colors flex items-center gap-1.5"
              aria-label="Export data as Cove PDF"
            >
              <DownloadIcon />
              Export
            </button>
            <button
              onClick={handleSignOut}
              className="border border-forest-mid text-cream-muted text-[10px] font-bold tracking-widest uppercase px-3 py-2 rounded-sm hover:border-amber/40 hover:text-cream transition-colors"
            >
              Sign Out
            </button>
          </div>
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

function DownloadIcon() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
