"use client";

import { useState, useEffect } from "react";

/* ── Types matching the insights API response ── */

interface ShopInsights {
  shop: {
    name: string;
    id: string;
    lastSync: string | null;
    productCount: number;
    platform: string | null;
  };
  productPerformance: {
    name: string;
    type: string;
    price: number | null;
    favorites: number;
  }[];
  marketGaps: {
    name: string;
    type: string;
    favoritedCount: number;
    availableAt: string[];
  }[];
  priceComparison: {
    name: string;
    yourPrice: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    shopsCompared: number;
  }[];
  demandSignals: {
    type: string;
    count: number;
    topProducts: string[];
  }[];
  syncHealth: {
    lastSync: string | null;
    itemCount: number;
    status: string;
    platform: string | null;
  };
}

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
  }, [target, duration, delay]);
  return count;
}

export default function DispenserTab() {
  const [mounted, setMounted] = useState(false);
  const [insights, setInsights] = useState<ShopInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch("/api/business/insights")
      .then((r) => {
        if (r.status === 404) {
          setError("no_claim");
          setLoading(false);
          return null;
        }
        if (!r.ok) throw new Error("Failed to load insights");
        return r.json();
      })
      .then((data) => {
        if (data) setInsights(data);
        setLoading(false);
      })
      .catch(() => {
        setError("error");
        setLoading(false);
      });
  }, []);

  const productCount = useCountUp(insights?.shop.productCount ?? 0, 900, 100);

  function card(delay: number): React.CSSProperties {
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(14px)",
      transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
    };
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-forest rounded-2xl border border-forest-mid p-5 h-28 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // No claim — show claim prompt
  if (error === "no_claim") {
    return <ClaimPrompt onClaimed={() => window.location.reload()} />;
  }

  // Error state
  if (error || !insights) {
    return (
      <div className="text-center py-10">
        <p className="text-cream-muted text-sm">Unable to load insights</p>
      </div>
    );
  }

  const maxFavs = Math.max(
    ...insights.productPerformance.map((p) => p.favorites),
    1
  );

  return (
    <div className="space-y-4">
      {/* Shop header */}
      <div className="grid grid-cols-3 gap-3" style={card(0)}>
        <StatCard label="Products" value={`${productCount}`} unit="in stock" />
        <StatCard
          label="Platform"
          value={insights.shop.platform?.toUpperCase() ?? "—"}
        />
        <StatCard
          label="Sync"
          value={insights.syncHealth.status === "ok" ? "Live" : "Stale"}
          unit={
            insights.shop.lastSync
              ? timeAgo(insights.shop.lastSync)
              : "never"
          }
        />
      </div>

      {/* Product Performance */}
      {insights.productPerformance.length > 0 && (
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(80)}
        >
          <h3 className="text-cream font-semibold text-sm mb-1">
            Top Products by Demand
          </h3>
          <p className="text-cream-muted/60 text-[10px] mb-4">
            Consumer favorites from your inventory
          </p>
          <div className="space-y-3">
            {insights.productPerformance.slice(0, 6).map((p, i) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-cream truncate flex-1 mr-2">
                    {p.name}
                  </span>
                  <span className="text-cream-muted shrink-0">
                    {p.favorites} ♥
                  </span>
                </div>
                <div className="h-2 bg-forest-mid rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber rounded-full"
                    style={{
                      width: mounted
                        ? `${(p.favorites / maxFavs) * 100}%`
                        : "0%",
                      opacity: 1 - i * 0.12,
                      transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${
                        120 + i * 90
                      }ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Gaps */}
      {insights.marketGaps.length > 0 && (
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(160)}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-cream font-semibold text-sm">Market Gaps</h3>
              <p className="text-cream-muted/60 text-[10px]">
                Popular nearby products you don&apos;t carry
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber/20 text-amber">
              {insights.marketGaps.length} gaps
            </span>
          </div>
          <div className="space-y-2.5">
            {insights.marketGaps.slice(0, 5).map((gap) => (
              <div
                key={gap.name}
                className="flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-xs truncate">{gap.name}</p>
                  <p className="text-cream-muted/60 text-[10px] truncate">
                    at {gap.availableAt.join(", ")}
                  </p>
                </div>
                <span className="text-amber text-xs font-bold shrink-0 ml-2">
                  {gap.favoritedCount} ♥
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Comparison */}
      {insights.priceComparison.length > 0 && (
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(240)}
        >
          <h3 className="text-cream font-semibold text-sm mb-1">
            Price Check
          </h3>
          <p className="text-cream-muted/60 text-[10px] mb-4">
            Your pricing vs nearby competitors
          </p>
          <div className="space-y-3">
            {insights.priceComparison.slice(0, 5).map((pc) => {
              const diff = pc.yourPrice - pc.avgPrice;
              const isHigher = diff > 0;
              const isLower = diff < -0.5;
              return (
                <div key={pc.name} className="flex items-center gap-3">
                  <span className="text-xs text-cream truncate flex-1 min-w-0">
                    {pc.name}
                  </span>
                  <span className="text-xs text-cream-muted tabular-nums shrink-0">
                    ${pc.yourPrice}
                  </span>
                  <span
                    className={`text-[10px] font-bold shrink-0 ${
                      isLower
                        ? "text-emerald-400"
                        : isHigher
                        ? "text-rose-400"
                        : "text-cream-muted"
                    }`}
                  >
                    {isLower
                      ? `$${Math.abs(diff).toFixed(0)} below`
                      : isHigher
                      ? `$${diff.toFixed(0)} above`
                      : "at avg"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-cream-muted/40 text-[9px] mt-3">
            Compared across {insights.priceComparison[0]?.shopsCompared ?? 0}{" "}
            nearby shops
          </p>
        </div>
      )}

      {/* Demand Signals */}
      {insights.demandSignals.length > 0 && (
        <div
          className="bg-forest rounded-2xl border border-forest-mid p-5"
          style={card(320)}
        >
          <h3 className="text-cream font-semibold text-sm mb-1">
            Demand Radar
          </h3>
          <p className="text-cream-muted/60 text-[10px] mb-4">
            What Vermont consumers want right now
          </p>
          <div className="space-y-2.5">
            {insights.demandSignals.map((ds) => (
              <div key={ds.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
                  <span className="text-cream text-sm capitalize">
                    {ds.type}
                  </span>
                </div>
                <span className="text-cream-muted/60 text-xs">
                  {ds.count} favorites
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Health */}
      <div
        className="bg-forest rounded-2xl border border-forest-mid p-5"
        style={card(400)}
      >
        <h3 className="text-cream font-semibold text-sm mb-3">
          Cove Connect Status
        </h3>
        <div className="space-y-2">
          <Row label="Platform" value={insights.syncHealth.platform ?? "—"} />
          <Row label="Products Indexed" value={`${insights.syncHealth.itemCount}`} />
          <Row
            label="Last Sync"
            value={
              insights.syncHealth.lastSync
                ? timeAgo(insights.syncHealth.lastSync)
                : "Never"
            }
          />
          <Row
            label="Status"
            value={insights.syncHealth.status}
            highlight={insights.syncHealth.status === "ok"}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Claim Prompt ── */

function ClaimPrompt({ onClaimed }: { onClaimed: () => void }) {
  const [shopId, setShopId] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [shops, setShops] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Load dispensary list client-side
    fetch("/api/business/shops")
      .then((r) => (r.ok ? r.json() : { shops: [] }))
      .then((data) => setShops(data.shops ?? []))
      .catch(() => {});
  }, []);

  async function handleClaim() {
    if (!shopId) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/business/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopId }),
      });
      if (res.ok) onClaimed();
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="text-center py-10 space-y-4">
      <h3 className="text-cream font-semibold text-lg">Claim Your Shop</h3>
      <p className="text-cream-muted text-sm max-w-xs mx-auto">
        Select your dispensary to unlock real-time consumer insights, market
        gaps, and competitive pricing data.
      </p>
      <div className="max-w-xs mx-auto space-y-3">
        <select
          value={shopId}
          onChange={(e) => setShopId(e.target.value)}
          className="w-full bg-forest border border-forest-mid text-cream text-sm rounded-xl px-4 py-3 outline-none focus:border-amber/60"
        >
          <option value="">Select a dispensary…</option>
          {shops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleClaim}
          disabled={!shopId || claiming}
          className="w-full bg-amber text-forest-deep font-bold text-sm py-3 rounded-xl disabled:opacity-50 transition-opacity"
        >
          {claiming ? "Claiming…" : "Claim This Shop"}
        </button>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="bg-forest rounded-2xl border border-forest-mid p-4">
      <p className="text-cream-muted text-[10px] uppercase tracking-widest mb-1.5 leading-none">
        {label}
      </p>
      <p className="text-amber font-bold text-xl leading-none">{value}</p>
      {unit && (
        <p className="text-cream-muted/60 text-[10px] mt-1">{unit}</p>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cream-muted text-xs">{label}</span>
      <span
        className={`text-xs font-medium ${
          highlight ? "text-emerald-400" : "text-cream"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
