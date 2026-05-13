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

/* ── Tab type ── */
type Tab = "dispenser" | "grower";

export default function HeroAAI() {
  const { ref, visible } = useInView(0.1);
  const [tab, setTab] = useState<Tab>("dispenser");

  const productCount = useCountUp(142, 900, 200, visible);
  const revenue = useCountUp(2050000, 1200, 200, visible);
  const totalGrams = useCountUp(682500, 1000, 300, visible);

  function card(delay: number): React.CSSProperties {
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
      transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
    };
  }

  return (
    <section ref={ref} className="w-full">
      <div className="px-6 pb-20 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10" style={card(0)}>
          <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-3">
            Augmented &amp; Artificial Intelligence
          </p>
          <h2 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide mb-3">
            AAI for Vermont Cannabis
          </h2>
          <p className="text-cream-muted text-sm max-w-lg mx-auto leading-relaxed">
            Real-time dashboards for dispensaries and growers — demand signals,
            environment monitoring, yield tracking, and market intelligence.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center gap-2 mb-8" style={card(100)}>
          <button
            onClick={() => setTab("dispenser")}
            className={`text-xs font-bold px-5 py-2.5 rounded-full border transition-colors tracking-widest uppercase ${
              tab === "dispenser"
                ? "bg-amber text-forest-deep border-amber"
                : "bg-transparent text-cream-muted border-forest-mid hover:border-amber/40 hover:text-cream"
            }`}
          >
            Dispensaries
          </button>
          <button
            onClick={() => setTab("grower")}
            className={`text-xs font-bold px-5 py-2.5 rounded-full border transition-colors tracking-widest uppercase ${
              tab === "grower"
                ? "bg-amber text-forest-deep border-amber"
                : "bg-transparent text-cream-muted border-forest-mid hover:border-amber/40 hover:text-cream"
            }`}
          >
            Growers
          </button>
        </div>

        {/* Dashboard cards */}
        {tab === "dispenser" ? (
          <DispenserPreview visible={visible} card={card} productCount={productCount} />
        ) : (
          <GrowerPreview visible={visible} card={card} revenue={revenue} totalGrams={totalGrams} />
        )}

        {/* CTA */}
        <div className="text-center mt-10" style={card(500)}>
          <Link
            href="/about/cove-ai"
            className="inline-block bg-amber text-forest-deep font-bold px-10 py-4 rounded-full hover:bg-amber-hover transition-colors text-sm tracking-wide uppercase shadow-lg shadow-amber/20"
          >
            Get AAI Access
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Dispenser Preview ── */

function DispenserPreview({
  visible,
  card,
  productCount,
}: {
  visible: boolean;
  card: (d: number) => React.CSSProperties;
  productCount: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left column */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3" style={card(150)}>
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
          <p className="text-cream-muted/60 text-[10px] mb-4">Consumer favorites from inventory</p>
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
                      width: visible ? `${(p.favorites / maxFavs) * 100}%` : "0%",
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
              <p className="text-cream-muted/60 text-[10px]">Popular products you don&apos;t carry</p>
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
          <p className="text-cream-muted/60 text-[10px] mb-4">What Vermont consumers want</p>
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

function GrowerPreview({
  visible,
  card,
  revenue,
  totalGrams,
}: {
  visible: boolean;
  card: (d: number) => React.CSSProperties;
  revenue: number;
  totalGrams: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left column */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3" style={card(150)}>
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
                        width: visible ? `${pct}%` : "0%",
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
          <p className="text-cream-muted/60 text-[10px] mb-4">Grams per harvest cycle</p>
          <div className="flex items-end gap-3" style={{ height: 90 }}>
            {YIELD_DATA.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end gap-0.5" style={{ height: 72 }}>
                  <div
                    className="flex-1 rounded-t-sm bg-amber/80"
                    style={{
                      height: visible && d.actual > 0 ? `${(d.actual / maxYield) * 100}%` : "3px",
                      minHeight: 3,
                      transition: `height 600ms cubic-bezier(0.16,1,0.3,1) ${400 + i * 80}ms`,
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-sm bg-forest-mid border border-forest-mid"
                    style={{
                      height: visible ? `${(d.target / maxYield) * 100}%` : "3px",
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
                        width: visible ? `${rangePct}%` : "0%",
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

/* ── Mini stat card ── */

function MiniStat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  const valueSize =
    value.length >= 9
      ? "text-[13px] sm:text-base"
      : value.length >= 7
      ? "text-sm sm:text-lg"
      : "text-xl";
  return (
    <div className="bg-forest rounded-2xl border border-forest-mid p-4 min-w-0">
      <p className="text-cream-muted text-[10px] uppercase tracking-widest mb-1.5 leading-none">
        {label}
      </p>
      <p className={`text-amber font-bold leading-none tabular-nums truncate ${valueSize}`}>
        {value}
      </p>
      {unit && <p className="text-cream-muted/60 text-[10px] mt-1">{unit}</p>}
    </div>
  );
}
