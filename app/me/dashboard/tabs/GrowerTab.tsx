"use client";

import { useState, useEffect } from "react";

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    timeout = setTimeout(() => {
      const steps = 50;
      const stepTime = duration / steps;
      let step = 0;
      interval = setInterval(() => {
        step++;
        const t = step / steps;
        setCount(Math.round(t * (2 - t) * target));
        if (step >= steps) { setCount(target); clearInterval(interval); }
      }, stepTime);
    }, delay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [target, duration, delay]);
  return count;
}

const GROWS = [
  { name: "Blue Dream #3", strain: "Blue Dream", daysIn: 38, totalDays: 56, stage: "Flowering", health: 94 },
  { name: "OG Kush #1", strain: "OG Kush", daysIn: 12, totalDays: 60, stage: "Veg", health: 88 },
  { name: "Sour D Pheno", strain: "Sour Diesel", daysIn: 51, totalDays: 56, stage: "Late Flower", health: 97 },
];

const YIELD_DATA = [
  { month: "Oct", actual: 142, target: 130 },
  { month: "Nov", actual: 118, target: 130 },
  { month: "Dec", actual: 155, target: 140 },
  { month: "Jan", actual: 0, target: 140 },
];

const maxYield = 160;

// Environment targets per room — typical commercial-cannabis setpoints.
// Each room shows 4 live-readout gauges; metrics shift to what matters
// for that stage of the workflow.
const ROOMS = [
  {
    id: "veg",
    name: "Veg Rooms",
    metrics: [
      { label: "Temp", value: 76, unit: "°F", min: 65, max: 85, color: "#FFB900" },
      { label: "Humidity", value: 65, unit: "%", min: 50, max: 75, color: "#10b981" },
      { label: "CO₂", value: 1100, unit: "ppm", min: 800, max: 1500, color: "#818cf8" },
      { label: "VPD", value: 0.9, unit: "kPa", min: 0.4, max: 1.2, color: "#fb7185" },
    ],
  },
  {
    id: "grow",
    name: "Grow Rooms",
    metrics: [
      { label: "Temp", value: 72, unit: "°F", min: 65, max: 80, color: "#FFB900" },
      { label: "Humidity", value: 45, unit: "%", min: 35, max: 60, color: "#10b981" },
      { label: "CO₂", value: 1400, unit: "ppm", min: 1000, max: 1500, color: "#818cf8" },
      { label: "VPD", value: 1.4, unit: "kPa", min: 1.0, max: 1.6, color: "#fb7185" },
    ],
  },
  {
    id: "dry",
    name: "Dry Room",
    metrics: [
      { label: "Temp", value: 64, unit: "°F", min: 60, max: 70, color: "#FFB900" },
      { label: "Humidity", value: 60, unit: "%", min: 55, max: 65, color: "#10b981" },
      { label: "Airflow", value: 2.2, unit: "m/s", min: 0, max: 5, color: "#818cf8" },
      { label: "Dry Day", value: 7, unit: "d", min: 1, max: 14, color: "#fb7185" },
    ],
  },
  {
    id: "trim",
    name: "Trim Room",
    metrics: [
      { label: "Temp", value: 68, unit: "°F", min: 60, max: 75, color: "#FFB900" },
      { label: "Humidity", value: 55, unit: "%", min: 45, max: 65, color: "#10b981" },
      { label: "Stations", value: 6, unit: "/8", min: 0, max: 8, color: "#818cf8" },
      { label: "Output", value: 12, unit: "lb/d", min: 0, max: 20, color: "#fb7185" },
    ],
  },
  {
    id: "package",
    name: "Package Room",
    metrics: [
      { label: "Temp", value: 70, unit: "°F", min: 60, max: 75, color: "#FFB900" },
      { label: "Humidity", value: 55, unit: "%", min: 45, max: 65, color: "#10b981" },
      { label: "Output", value: 145, unit: "/hr", min: 0, max: 200, color: "#818cf8" },
      { label: "Seal QA", value: 99.7, unit: "%", min: 95, max: 100, color: "#fb7185" },
    ],
  },
] as const;

type RoomId = (typeof ROOMS)[number]["id"];

const COMPLIANCE = [
  { label: "Room Count", status: "ok", detail: "3 / 6 limit" },
  { label: "Canopy sq ft", status: "ok", detail: "10,000 sq ft" },
  { label: "License renewal", status: "warn", detail: "Expires in 42 days" },
  { label: "Waste log", status: "ok", detail: "Up to date" },
];

function stageColor(stage: string) {
  if (stage === "Flowering" || stage === "Late Flower") return "#FFB900";
  if (stage === "Veg") return "#10b981";
  return "#818cf8";
}

export default function GrowerTab() {
  const [mounted, setMounted] = useState(false);
  const [activeRoom, setActiveRoom] = useState<RoomId>("grow");
  const activeMetrics =
    ROOMS.find((r) => r.id === activeRoom)?.metrics ?? ROOMS[1].metrics;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const revenue = useCountUp(2050000, 1200, 100);
  const totalGrams = useCountUp(682500, 1000, 200);

  function card(delay: number): React.CSSProperties {
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(14px)",
      transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
    };
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3" style={card(0)}>
        <StatCard label="Active Grow Rooms" value="3" unit="rooms" />
        <StatCard label="Projected Yield" value={`${totalGrams.toLocaleString()}g`} />
        <StatCard label="Estimated Wholesale Revenue" value={`$${revenue.toLocaleString()}`} />
      </div>

      {/* Active Grows */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(80)}>
        <h3 className="text-cream font-semibold text-sm mb-4">Active Strains</h3>
        <div className="space-y-4">
          {GROWS.map((g, i) => {
            const pct = Math.round((g.daysIn / g.totalDays) * 100);
            const daysLeft = g.totalDays - g.daysIn;
            return (
              <div key={g.name}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-cream text-xs font-medium">{g.name}</span>
                    <span
                      className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${stageColor(g.stage)}22`, color: stageColor(g.stage) }}
                    >
                      {g.stage}
                    </span>
                  </div>
                  <span className="text-cream-muted text-[10px]">{daysLeft}d left</span>
                </div>
                <div className="h-2 bg-forest-mid rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: mounted ? `${pct}%` : "0%",
                      backgroundColor: stageColor(g.stage),
                      transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${120 + i * 100}ms`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-cream-muted">Day {g.daysIn}</span>
                  <span className="text-[10px] text-cream-muted">Health {g.health}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Yield vs Target */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(160)}>
        <h3 className="text-cream font-semibold text-sm mb-1">Yield vs Target</h3>
        <p className="text-cream-muted/60 text-[10px] mb-4">Grams per harvest cycle</p>
        <div className="flex items-end gap-3" style={{ height: 90 }}>
          {YIELD_DATA.map((d, i) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end gap-0.5" style={{ height: 72 }}>
                {/* Actual */}
                <div
                  className="flex-1 rounded-t-sm bg-amber/80"
                  style={{
                    height: mounted && d.actual > 0 ? `${(d.actual / maxYield) * 100}%` : "3px",
                    minHeight: 3,
                    transition: `height 600ms cubic-bezier(0.16,1,0.3,1) ${200 + i * 80}ms`,
                  }}
                />
                {/* Target */}
                <div
                  className="flex-1 rounded-t-sm bg-forest-mid border border-forest-mid"
                  style={{
                    height: mounted ? `${(d.target / maxYield) * 100}%` : "3px",
                    minHeight: 3,
                    transition: `height 600ms cubic-bezier(0.16,1,0.3,1) ${250 + i * 80}ms`,
                  }}
                />
              </div>
              <span className="text-[10px] text-cream-muted">{d.month}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-amber/80" />
            <span className="text-[10px] text-cream-muted">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-forest-mid border border-forest-mid" />
            <span className="text-[10px] text-cream-muted">Target</span>
          </div>
        </div>
      </div>

      {/* Environment — per-room switcher */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(240)}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-cream font-semibold text-sm">Environment</h3>
          <span className="text-[10px] text-cream-muted/60 uppercase tracking-widest">Live</span>
        </div>

        {/* Room pill switcher — horizontal scroll on narrow screens */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto -mx-1 px-1 pb-1 scrollbar-none">
          {ROOMS.map((room) => {
            const active = room.id === activeRoom;
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-amber text-forest-deep border-amber"
                    : "bg-forest-mid/30 text-cream-muted border-forest-mid hover:text-cream hover:border-amber/40"
                }`}
              >
                {room.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {activeMetrics.map((e, i) => {
            const rangePct = Math.max(
              0,
              Math.min(100, ((e.value - e.min) / (e.max - e.min)) * 100)
            );
            return (
              <div key={e.label} className="bg-forest-mid/40 rounded-xl p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-cream-muted uppercase tracking-widest">{e.label}</span>
                </div>
                <p className="text-cream font-bold text-lg leading-none mb-2">
                  {e.value}
                  <span className="text-cream-muted/60 text-xs font-normal ml-0.5">{e.unit}</span>
                </p>
                <div className="h-1.5 bg-forest-mid rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: mounted ? `${rangePct}%` : "0%",
                      backgroundColor: e.color,
                      transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 60}ms`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-cream-muted/40">{e.min}{e.unit}</span>
                  <span className="text-[10px] text-cream-muted/40">{e.max}{e.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(320)}>
        <h3 className="text-cream font-semibold text-sm mb-3">Compliance</h3>
        <div className="space-y-2.5">
          {COMPLIANCE.map((c) => (
            <div key={c.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: c.status === "ok" ? "#10b981" : "#FFB900" }}
                />
                <span className="text-cream-muted text-sm">{c.label}</span>
              </div>
              <span
                className="text-xs"
                style={{ color: c.status === "ok" ? "rgba(255,255,255,0.4)" : "#FFB900" }}
              >
                {c.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="bg-forest rounded-2xl border border-forest-mid p-4">
      <p className="text-cream-muted text-[10px] uppercase tracking-widest mb-1.5 leading-none">
        {label}
      </p>
      <p className="text-amber font-bold text-xl leading-none">{value}</p>
      {unit && <p className="text-cream-muted/60 text-[10px] mt-1">{unit}</p>}
    </div>
  );
}
