"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ── Count-up hook (same easing as dashboard) ── */
function useCountUp(target: number, duration = 1200, delay = 0, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
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
        if (step >= steps) {
          setCount(target);
          clearInterval(interval);
        }
      }, stepTime);
    }, delay);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [target, duration, delay, active]);
  return count;
}

/* ── Demo data (mirrors dashboard) ── */

const DEMAND_PRODUCTS = [
  { name: "Blue Dream", favorites: 48 },
  { name: "Sour Diesel", favorites: 37 },
  { name: "OG Kush", favorites: 31 },
  { name: "Green Crack", favorites: 24 },
  { name: "Wedding Cake", favorites: 19 },
];

const GROWS = [
  { name: "Blue Dream #3", stage: "Flowering", daysIn: 38, totalDays: 56, health: 94 },
  { name: "OG Kush #1", stage: "Veg", daysIn: 12, totalDays: 60, health: 88 },
  { name: "Sour D Pheno", stage: "Late Flower", daysIn: 51, totalDays: 56, health: 97 },
];

const YIELD_DATA = [
  { month: "Oct", actual: 142, target: 130 },
  { month: "Nov", actual: 118, target: 130 },
  { month: "Dec", actual: 155, target: 140 },
  { month: "Jan", actual: 0, target: 140 },
];

const ENV_METRICS = [
  { label: "Temp", value: 72, unit: "°F", min: 65, max: 80, color: "#FFB900" },
  { label: "Humidity", value: 45, unit: "%", min: 35, max: 60, color: "#10b981" },
  { label: "CO₂", value: 1400, unit: "ppm", min: 1000, max: 1500, color: "#818cf8" },
  { label: "VPD", value: 1.4, unit: "kPa", min: 1.0, max: 1.6, color: "#fb7185" },
];

const maxFavs = DEMAND_PRODUCTS[0].favorites;
const maxYield = 160;

function stageColor(stage: string) {
  if (stage === "Flowering" || stage === "Late Flower") return "#FFB900";
  if (stage === "Veg") return "#10b981";
  return "#818cf8";
}

/* ── Intersection Observer hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Manufacture demo data ── */

const BATCHES = [
  { id: "BD-2026-041", product: "Blue Dream Cartridge 1g", stage: "Filling", pct: 72, units: 2400, target: 3000 },
  { id: "SD-2026-039", product: "Sour Diesel Shatter 1g", stage: "Extraction", pct: 45, units: 680, target: 1500 },
  { id: "GC-2026-042", product: "Green Crack Gummies 10pk", stage: "Packaging", pct: 91, units: 4550, target: 5000 },
];

const EQUIPMENT = [
  { name: "CO₂ Extractor", status: "Running", uptime: 97.2, load: 82 },
  { name: "Short Path Distill", status: "Running", uptime: 94.8, load: 68 },
  { name: "Cartridge Filler", status: "Running", uptime: 99.1, load: 72 },
  { name: "Packaging Line A", status: "Idle", uptime: 88.5, load: 0 },
];

const LAB_TESTS = [
  { batch: "BD-2026-038", test: "Potency", result: "Pass", thc: "24.3%", date: "May 11" },
  { batch: "SD-2026-037", test: "Residual Solvent", result: "Pass", thc: "—", date: "May 10" },
  { batch: "GC-2026-040", test: "Microbial", result: "Pass", thc: "—", date: "May 10" },
  { batch: "OG-2026-036", test: "Heavy Metals", result: "Pass", thc: "—", date: "May 9" },
];

const PRODUCTION_DATA = [
  { month: "Oct", actual: 8400, target: 8000 },
  { month: "Nov", actual: 7200, target: 8000 },
  { month: "Dec", actual: 9100, target: 9000 },
  { month: "Jan", actual: 0, target: 9000 },
];

const maxProduction = 10000;

function batchStageColor(stage: string) {
  if (stage === "Packaging") return "#10b981";
  if (stage === "Filling") return "#FFB900";
  return "#818cf8";
}

/* ── Tab type ── */
type Tab = "dispenser" | "grower" | "manufacture";

export default function HeroAAI() {
  const { ref, visible } = useInView(0.1);
  const [tab, setTab] = useState<Tab>("dispenser");
  // Bumped each time a tab is clicked — forces preview remount and re-animates.
  const [animKey, setAnimKey] = useState(0);

  function selectTab(next: Tab) {
    if (next === tab) {
      setAnimKey((k) => k + 1); // same tab → replay
    } else {
      setTab(next);
      setAnimKey((k) => k + 1);
    }
  }

  function headerCard(delay: number): React.CSSProperties {
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
      transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
    };
  }

  return (
    <section ref={ref} className="w-full">
      <div className="px-6 pt-16 pb-20 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10" style={headerCard(0)}>
          <p className="text-amber/70 text-xs sm:text-sm tracking-[0.3em] uppercase font-semibold mb-3">
            Augmented &amp; Artificial Intelligence
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-groovy text-cream tracking-wide mb-3">
            AAI for Vermont Cannabis
          </h2>
          <p className="text-cream/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Real-time dashboards for dispensaries, growers, and manufacturers — demand signals,
            environment monitoring, yield tracking, batch production, and market intelligence.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mb-8 px-2" style={headerCard(100)}>
          <button
            onClick={() => selectTab("dispenser")}
            className={`text-[11px] sm:text-xs font-bold px-3 sm:px-5 py-2.5 rounded-full border transition-colors tracking-wide sm:tracking-widest uppercase whitespace-nowrap ${
              tab === "dispenser"
                ? "bg-amber text-forest-deep border-amber"
                : "bg-transparent text-cream-muted border-forest-mid hover:border-amber/40 hover:text-cream"
            }`}
          >
            Dispensaries
          </button>
          <button
            onClick={() => selectTab("grower")}
            className={`text-[11px] sm:text-xs font-bold px-3 sm:px-5 py-2.5 rounded-full border transition-colors tracking-wide sm:tracking-widest uppercase whitespace-nowrap ${
              tab === "grower"
                ? "bg-amber text-forest-deep border-amber"
                : "bg-transparent text-cream-muted border-forest-mid hover:border-amber/40 hover:text-cream"
            }`}
          >
            Growers
          </button>
          <button
            onClick={() => selectTab("manufacture")}
            className={`text-[11px] sm:text-xs font-bold px-3 sm:px-5 py-2.5 rounded-full border transition-colors tracking-wide sm:tracking-widest uppercase whitespace-nowrap ${
              tab === "manufacture"
                ? "bg-amber text-forest-deep border-amber"
                : "bg-transparent text-cream-muted border-forest-mid hover:border-amber/40 hover:text-cream"
            }`}
          >
            Manufacture
          </button>
        </div>

        {/* Dashboard cards — key forces remount so each click replays animations */}
        {tab === "dispenser" ? (
          <DispenserPreview key={`d-${animKey}`} visible={visible} />
        ) : tab === "grower" ? (
          <GrowerPreview key={`g-${animKey}`} visible={visible} />
        ) : (
          <ManufacturePreview key={`m-${animKey}`} visible={visible} />
        )}

        {/* CTA */}
        <div className="text-center mt-10" style={headerCard(500)}>
          <Link
            href="/about/cove-ai"
            className="inline-block bg-amber text-forest-deep font-bold px-10 py-4 rounded-full hover:bg-amber-hover transition-colors text-sm tracking-wide uppercase shadow-lg shadow-amber/20"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Shared card helper for previews ── */

function useCardStyler(mounted: boolean) {
  return (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
  });
}

function useMountedAfter(visible: boolean) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [visible]);
  return mounted;
}

/* ── Dispenser Preview ── */

function DispenserPreview({ visible }: { visible: boolean }) {
  const mounted = useMountedAfter(visible);
  const card = useCardStyler(mounted);
  const productCount = useCountUp(142, 900, 200, mounted);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left column */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3" style={card(150)}>
          <MiniStat label="Products" value={`${productCount}`} unit="in stock" />
          <MiniStat label="Platform" value="CoveDB" />
          <MiniStat label="Sync" value="Live" unit="12m ago" />
        </div>

        {/* Top Products */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(200)}
        >
          <h3 className="text-cream font-semibold text-sm mb-1">Top Products by Demand</h3>
          <p className="text-cream-muted/60 text-xs sm:text-[10px] mb-4">Consumer favorites from inventory</p>
          <div className="space-y-3">
            {DEMAND_PRODUCTS.map((p, i) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-cream truncate flex-1 mr-2">{p.name}</span>
                  <span className="text-cream-muted shrink-0">{p.favorites} ♥</span>
                </div>
                <div className="h-2 bg-forest-mid rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber rounded-full"
                    style={{
                      width: mounted ? `${(p.favorites / maxFavs) * 100}%` : "0%",
                      opacity: 1 - i * 0.12,
                      transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 90}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Market Gaps */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(250)}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-cream font-semibold text-sm">Market Gaps</h3>
              <p className="text-cream-muted/60 text-xs sm:text-[10px]">Popular products you don&apos;t carry</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber/20 text-amber">
              8 gaps
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: "Purple Haze", at: "Green State, NECANN", favs: 22 },
              { name: "Jack Herer", at: "Mountain High", favs: 18 },
              { name: "Gelato #33", at: "Ceres, Summit", favs: 15 },
              { name: "Northern Lights", at: "Valley Green", favs: 12 },
            ].map((g) => (
              <div key={g.name} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-xs truncate">{g.name}</p>
                  <p className="text-cream-muted/60 text-[10px] truncate">at {g.at}</p>
                </div>
                <span className="text-amber text-xs font-bold shrink-0 ml-2">{g.favs} ♥</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demand Radar */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(300)}
        >
          <h3 className="text-cream font-semibold text-sm mb-1">Demand Radar</h3>
          <p className="text-cream-muted/60 text-xs sm:text-[10px] mb-4">What Vermont consumers want</p>
          <div className="space-y-2.5">
            {[
              { type: "flower", count: 64 },
              { type: "concentrate", count: 42 },
              { type: "edible", count: 38 },
              { type: "vape", count: 27 },
              { type: "pre-roll", count: 19 },
            ].map((ds) => (
              <div key={ds.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
                  <span className="text-cream text-sm capitalize">{ds.type}</span>
                </div>
                <span className="text-cream-muted/60 text-xs">{ds.count} favorites</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Grower Preview ── */

function GrowerPreview({ visible }: { visible: boolean }) {
  const mounted = useMountedAfter(visible);
  const card = useCardStyler(mounted);
  const revenue = useCountUp(2050000, 1200, 200, mounted);
  const totalGrams = useCountUp(682500, 1000, 300, mounted);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left column */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3" style={card(150)}>
          <MiniStat label="Grow Rooms" value="3" unit="active" />
          <MiniStat label="Yield" value={`${totalGrams.toLocaleString()}g`} />
          <MiniStat label="Revenue" value={`$${revenue.toLocaleString()}`} />
        </div>

        {/* Active Strains */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(200)}
        >
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
                        style={{
                          backgroundColor: `${stageColor(g.stage)}22`,
                          color: stageColor(g.stage),
                        }}
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
                        transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 100}ms`,
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
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Yield vs Target */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(250)}
        >
          <h3 className="text-cream font-semibold text-sm mb-1">Yield vs Target</h3>
          <p className="text-cream-muted/60 text-xs sm:text-[10px] mb-4">Grams per harvest cycle</p>
          <div className="flex items-end gap-3" style={{ height: 90 }}>
            {YIELD_DATA.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end gap-0.5" style={{ height: 72 }}>
                  <div
                    className="flex-1 rounded-t-sm bg-amber/80"
                    style={{
                      height: mounted && d.actual > 0 ? `${(d.actual / maxYield) * 100}%` : "3px",
                      minHeight: 3,
                      transition: `height 600ms cubic-bezier(0.16,1,0.3,1) ${400 + i * 80}ms`,
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-sm bg-forest-mid border border-forest-mid"
                    style={{
                      height: mounted ? `${(d.target / maxYield) * 100}%` : "3px",
                      minHeight: 3,
                      transition: `height 600ms cubic-bezier(0.16,1,0.3,1) ${450 + i * 80}ms`,
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

        {/* Environment */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(300)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cream font-semibold text-sm">Environment</h3>
            <span className="text-[10px] text-cream-muted/60 uppercase tracking-widest">Live</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ENV_METRICS.map((e, i) => {
              const rangePct = Math.max(
                0,
                Math.min(100, ((e.value - e.min) / (e.max - e.min)) * 100)
              );
              return (
                <div key={e.label} className="bg-forest-mid/40 rounded-xl p-3">
                  <span className="text-[10px] text-cream-muted uppercase tracking-widest">
                    {e.label}
                  </span>
                  <p className="text-cream font-bold text-lg leading-none my-2">
                    {e.value}
                    <span className="text-cream-muted/60 text-xs font-normal ml-0.5">
                      {e.unit}
                    </span>
                  </p>
                  <div className="h-1.5 bg-forest-mid rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: mounted ? `${rangePct}%` : "0%",
                        backgroundColor: e.color,
                        transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${500 + i * 60}ms`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-cream-muted/40">
                      {e.min}
                      {e.unit}
                    </span>
                    <span className="text-[10px] text-cream-muted/40">
                      {e.max}
                      {e.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Manufacture Preview ── */

function ManufacturePreview({ visible }: { visible: boolean }) {
  const mounted = useMountedAfter(visible);
  const card = useCardStyler(mounted);
  const unitsProduced = useCountUp(24800, 1000, 200, mounted);
  const extractionYield = useCountUp(92, 800, 300, mounted);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left column */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3" style={card(150)}>
          <MiniStat label="Units / Mo" value={unitsProduced.toLocaleString()} unit="produced" />
          <MiniStat label="Extraction" value={`${extractionYield}%`} unit="yield" />
          <MiniStat label="Lab Tests" value="4/4" unit="passing" />
        </div>

        {/* Active Batches */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(200)}
        >
          <h3 className="text-cream font-semibold text-sm mb-4">Active Batches</h3>
          <div className="space-y-4">
            {BATCHES.map((b, i) => {
              const unitsLeft = b.target - b.units;
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-cream text-xs font-medium">{b.product}</span>
                      <span
                        className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${batchStageColor(b.stage)}22`,
                          color: batchStageColor(b.stage),
                        }}
                      >
                        {b.stage}
                      </span>
                    </div>
                    <span className="text-cream-muted text-[10px]">{unitsLeft} remaining</span>
                  </div>
                  <div className="h-2 bg-forest-mid rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: mounted ? `${b.pct}%` : "0%",
                        backgroundColor: batchStageColor(b.stage),
                        transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 100}ms`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-cream-muted">{b.units.toLocaleString()} units</span>
                    <span className="text-[10px] text-cream-muted">{b.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* Production Output */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(250)}
        >
          <h3 className="text-cream font-semibold text-sm mb-1">Production Output</h3>
          <p className="text-cream-muted/60 text-xs sm:text-[10px] mb-4">Units per month</p>
          <div className="flex items-end gap-3" style={{ height: 90 }}>
            {PRODUCTION_DATA.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end gap-0.5" style={{ height: 72 }}>
                  <div
                    className="flex-1 rounded-t-sm bg-amber/80"
                    style={{
                      height: mounted && d.actual > 0 ? `${(d.actual / maxProduction) * 100}%` : "3px",
                      minHeight: 3,
                      transition: `height 600ms cubic-bezier(0.16,1,0.3,1) ${400 + i * 80}ms`,
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-sm bg-forest-mid border border-forest-mid"
                    style={{
                      height: mounted ? `${(d.target / maxProduction) * 100}%` : "3px",
                      minHeight: 3,
                      transition: `height 600ms cubic-bezier(0.16,1,0.3,1) ${450 + i * 80}ms`,
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

        {/* Equipment Status */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(300)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-cream font-semibold text-sm">Equipment</h3>
            <span className="text-[10px] text-cream-muted/60 uppercase tracking-widest">Live</span>
          </div>
          <div className="space-y-3">
            {EQUIPMENT.map((eq, i) => (
              <div key={eq.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: eq.status === "Running" ? "#10b981" : "#FFB900" }}
                    />
                    <span className="text-cream text-xs">{eq.name}</span>
                  </div>
                  <span className="text-cream-muted/60 text-[10px]">{eq.uptime}% uptime</span>
                </div>
                {eq.load > 0 && (
                  <div className="h-1.5 bg-forest-mid rounded-full overflow-hidden ml-4">
                    <div
                      className="h-full rounded-full bg-amber/70"
                      style={{
                        width: mounted ? `${eq.load}%` : "0%",
                        transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${400 + i * 70}ms`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lab Testing */}
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(350)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-cream font-semibold text-sm">Lab Testing</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
              All Clear
            </span>
          </div>
          <div className="space-y-2.5">
            {LAB_TESTS.map((t) => (
              <div key={t.batch} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-xs truncate">{t.batch}</p>
                  <p className="text-cream-muted/60 text-[10px]">{t.test} · {t.date}</p>
                </div>
                <span className="text-emerald-400 text-xs font-bold shrink-0 ml-2">{t.result}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mini stat card ── */

function MiniStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  // Mobile cards are ~78px wide on a 375px screen — shrink longer values
  // hard at the small breakpoint to avoid truncation, restore size at sm+.
  const valueSize =
    value.length >= 9
      ? "text-[11px] sm:text-base"
      : value.length >= 7
      ? "text-xs sm:text-lg"
      : value.length >= 5
      ? "text-sm sm:text-xl"
      : "text-base sm:text-xl";
  return (
    <div className="bg-forest rounded-2xl border border-forest-mid p-3 sm:p-4 min-w-0">
      <p className="text-cream-muted text-[10px] uppercase tracking-widest mb-1.5 leading-none truncate">
        {label}
      </p>
      <p className={`text-amber font-bold leading-none tabular-nums truncate ${valueSize}`}>
        {value}
      </p>
      {unit && <p className="text-cream-muted/60 text-[10px] mt-1 truncate">{unit}</p>}
    </div>
  );
}
