"use client";

import { useState, useMemo } from "react";
import type { LiveProduct } from "@/lib/inventory-public";

interface FilterChoice {
  value: string;
  label: string;
}

const LIVE_TYPE_FILTERS: FilterChoice[] = [
  { value: "all", label: "All" },
  { value: "flower", label: "Flower" },
  { value: "preroll", label: "Pre-Rolls" },
  { value: "vape", label: "Vapes" },
  { value: "edible", label: "Edibles" },
  { value: "concentrate", label: "Concentrates" },
  { value: "drink", label: "Drinks" },
];

/** Sub-categories per main type. "all" is implied. Empty = no sub-pills. */
const LIVE_SUBCATEGORIES: Record<string, FilterChoice[]> = {
  edible: [
    { value: "all", label: "All" },
    { value: "gummies", label: "Gummies" },
    { value: "chocolate", label: "Chocolate" },
    { value: "tincture", label: "Tinctures" },
  ],
  concentrate: [
    { value: "all", label: "All" },
    { value: "rosin", label: "Rosin" },
    { value: "hash", label: "Hash" },
    { value: "other", label: "Other" },
  ],
  vape: [
    { value: "all", label: "All" },
    { value: "live", label: "Rosin / Resin" },
    { value: "solventless", label: "Solventless" },
    { value: "distillate", label: "Distillate" },
  ],
};

const LIVE_TYPE_LABELS: Record<string, string> = {
  flower: "flower",
  preroll: "pre-rolls",
  vape: "vapes",
  concentrate: "concentrates",
  edible: "edibles",
  drink: "drinks",
  tincture: "tinctures",
};

/** Soft-tap haptic on mobile (Android Chrome). iOS Safari ignores. */
function tapHaptic() {
  try {
    if (
      typeof navigator !== "undefined" &&
      "vibrate" in navigator &&
      typeof navigator.vibrate === "function"
    ) {
      navigator.vibrate(8);
    }
  } catch {
    // no-op
  }
}

function classifySubcategory(product: LiveProduct, mainType: string): string[] {
  const n = product.displayName.toLowerCase();
  const brands = product.brands.join(" ").toLowerCase();
  const haystack = `${n} ${brands}`;
  const tags: string[] = [];

  if (mainType === "edible") {
    if (product.type === "tincture") tags.push("tincture");
    if (/\bgumm/i.test(haystack)) tags.push("gummies");
    if (/\bchocolat/i.test(haystack)) tags.push("chocolate");
  }
  if (mainType === "concentrate") {
    if (/\brosin\b/i.test(haystack)) tags.push("rosin");
    else if (/\b(hash|kief|bubble|temple\s*ball|dry\s*sift)\b/i.test(haystack))
      tags.push("hash");
    else tags.push("other");
  }
  if (mainType === "vape") {
    if (/live\s*(resin|rosin)/i.test(haystack)) tags.push("live");
    else if (/\b(solventless|rosin)\b/i.test(haystack)) tags.push("solventless");
    else if (/\bdistillate\b/i.test(haystack)) tags.push("distillate");
  }
  return tags;
}

function LiveProductCard({ product }: { product: LiveProduct }) {
  const typeLabel = product.type[0].toUpperCase() + product.type.slice(1);
  const thc =
    product.thcMin !== null && product.thcMax !== null
      ? product.thcMin === product.thcMax
        ? `${product.thcMin}%`
        : `${product.thcMin}–${product.thcMax}%`
      : null;
  const price =
    product.priceMin !== null && product.priceMax !== null
      ? product.priceMin === product.priceMax
        ? `$${product.priceMin}`
        : `$${product.priceMin}–$${product.priceMax}`
      : null;

  return (
    <div
      className="bg-forest border border-forest-mid rounded-md hover:border-amber/40 transition-colors px-4 py-3.5 flex flex-col"
      style={{ boxShadow: "inset 0 0 0 2px rgba(255,185,0,0.05)" }}
    >
      <div className="flex items-start gap-2 mb-2">
        <h3 className="flex-1 text-cream text-[15px] sm:text-base font-semibold leading-snug break-words">
          {product.displayName}
        </h3>
        <span className="shrink-0 text-[10px] border border-forest-light/50 text-forest-light px-1.5 py-0.5 rounded font-bold tracking-widest uppercase">
          {typeLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
        {price && <span className="text-cream text-base font-bold">{price}</span>}
        {thc && <span className="text-amber text-xs font-bold tracking-wide">THC {thc}</span>}
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto pt-1 text-[11px] text-cream-muted/85">
        <span className="font-medium leading-snug truncate flex-1 min-w-0">
          {product.brands.length > 0 && (
            <>
              <span className="text-cream-muted">by </span>
              {product.brands.slice(0, 2).join(", ")}
              {product.brands.length > 2 && ` +${product.brands.length - 2}`}
            </>
          )}
        </span>
        <span className="text-cream-muted/70 font-medium tabular-nums shrink-0">
          {product.skuCount} SKU{product.skuCount !== 1 ? "s" : ""}
        </span>
      </div>

      <p className="mt-1.5 text-[11px] text-amber/90 font-medium tracking-wide flex items-center gap-1.5 leading-snug">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-amber/80 shrink-0 animate-pulse"
          aria-hidden="true"
        />
        <span className="truncate">{product.shops.join(" · ")}</span>
      </p>
    </div>
  );
}

/** Pill — touch-friendly, used in horizontal scroll strips. */
function Pill({
  active,
  onClick,
  children,
  size = "lg",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "lg" | "sm";
}) {
  const sizeClasses =
    size === "lg"
      ? "px-4 py-2 text-xs min-h-[40px]"
      : "px-3 py-1.5 text-[11px] min-h-[32px]";
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full font-bold tracking-widest uppercase transition-colors ${sizeClasses} ${
        active
          ? "bg-amber text-forest-deep"
          : "bg-forest border border-forest-mid text-cream-muted hover:border-amber/50 hover:text-cream"
      }`}
    >
      {children}
    </button>
  );
}

export default function StrainClient({
  liveProducts,
}: {
  liveProducts?: LiveProduct[];
}) {
  const [query, setQuery] = useState("");
  const [liveType, setLiveType] = useState<string>("all");
  const [liveSubcat, setLiveSubcat] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">(
    "default"
  );

  /**
   * Sorted list of every product's minimum price. The price slider
   * indexes into this array so each step on the slider corresponds
   * to ~1% of products, not ~$X. That way dragging the slider feels
   * meaningful across the whole range — no "dead zone" between $50
   * and the $500 outlier price ceiling.
   */
  const sortedPrices = useMemo(() => {
    if (!liveProducts) return [];
    const arr: number[] = [];
    for (const p of liveProducts) {
      if (p.priceMin !== null && p.priceMin > 0) arr.push(p.priceMin);
    }
    arr.sort((a, b) => a - b);
    return arr;
  }, [liveProducts]);

  // Slider position 0..STEPS. STEPS means "no filter" (Any).
  const STEPS = 100;
  const [pricePct, setPricePct] = useState<number>(STEPS);

  /** Translate slider pct into an actual price cap (or null = no cap). */
  const priceCap = useMemo(() => {
    if (pricePct >= STEPS) return null;
    if (sortedPrices.length === 0) return null;
    const idx = Math.min(
      sortedPrices.length - 1,
      Math.floor((pricePct / STEPS) * sortedPrices.length)
    );
    return sortedPrices[Math.max(0, idx)];
  }, [sortedPrices, pricePct]);

  function pickType(value: string) {
    setLiveType(value);
    setLiveSubcat("all");
    tapHaptic();
  }
  function pickSubcat(value: string) {
    setLiveSubcat(value);
    tapHaptic();
  }

  const filteredLive = useMemo(() => {
    if (!liveProducts || liveProducts.length === 0) return [];
    let result = liveProducts;

    if (liveType !== "all") {
      if (liveType === "edible") {
        result = result.filter((p) => p.type === "edible" || p.type === "tincture");
      } else {
        result = result.filter((p) => p.type === liveType);
      }
    }

    if (liveSubcat !== "all" && liveType !== "all") {
      result = result.filter((p) =>
        classifySubcategory(p, liveType).includes(liveSubcat)
      );
    }

    if (priceCap !== null) {
      result = result.filter((p) => (p.priceMin ?? 0) <= priceCap);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.brands.some((b) => b.toLowerCase().includes(q)) ||
          p.shops.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort. Products without a price are always pushed to the bottom
    // so the sort visually reflects "by price" without N/As cluttering
    // the top.
    if (sortBy !== "default") {
      const dir = sortBy === "price-asc" ? 1 : -1;
      result = [...result].sort((a, b) => {
        const ap = a.priceMin;
        const bp = b.priceMin;
        if (ap === null && bp === null) return 0;
        if (ap === null) return 1;
        if (bp === null) return -1;
        return dir * (ap - bp);
      });
    }

    return result;
  }, [liveProducts, liveType, liveSubcat, priceCap, query, sortBy]);

  const subcategoryRow = liveType !== "all" ? LIVE_SUBCATEGORIES[liveType] : null;
  const labelForType = LIVE_TYPE_LABELS[liveType] ?? "products";

  if (!liveProducts || liveProducts.length === 0) {
    return (
      <div className="bg-forest/40 border border-forest-mid/60 rounded-md px-5 py-8 text-center">
        <p className="text-cream-muted text-sm font-medium">
          Live inventory is syncing. Check back shortly.
        </p>
      </div>
    );
  }

  // Slider gradient progress
  const sliderPct = (pricePct / STEPS) * 100;

  return (
    <section className="flex flex-col gap-4">
      {/* Heading */}
      <div>
        <p className="text-amber/80 text-[10px] tracking-[0.3em] uppercase font-bold mb-2 flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-amber/80 animate-pulse"
            aria-hidden="true"
          />
          Live · Synced from dispensary menus
        </p>
        <h2 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide leading-tight">
          In Stock in Vermont
        </h2>
        <div className="flex items-center justify-between gap-3 mt-1.5">
          <p className="text-cream-muted text-sm font-medium min-w-0">
            <span className="text-amber font-bold tabular-nums">
              {filteredLive.length.toLocaleString()}
            </span>{" "}
            {liveType === "all" ? "products" : labelForType}
            {query && (
              <span className="text-amber/70"> · &ldquo;{query}&rdquo;</span>
            )}
          </p>

          {/* Sort dropdown — native select for mobile-friendly OS picker */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as typeof sortBy);
                tapHaptic();
              }}
              aria-label="Sort products"
              className="appearance-none bg-forest border border-forest-mid text-cream text-xs font-bold tracking-widest uppercase pl-3 pr-8 py-2 rounded-full hover:border-amber/50 focus:border-amber/60 outline-none transition-colors min-h-[36px] cursor-pointer"
            >
              <option value="default">Sort</option>
              <option value="price-asc">Price ↑ Low–High</option>
              <option value="price-desc">Price ↓ High–Low</option>
            </select>
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber/70 text-[10px] pointer-events-none"
              aria-hidden="true"
            >
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted/60 text-base pointer-events-none"
          aria-hidden="true"
        >
          ⌕
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search strain, brand, or shop"
          className="w-full bg-forest border border-forest-mid text-cream text-[15px] font-medium placeholder:text-cream-muted/55 placeholder:font-normal pl-9 pr-9 py-3 rounded-full outline-none focus:border-amber/60 transition-colors min-h-[44px]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-cream-muted/60 hover:text-cream hover:bg-forest-mid/40 text-lg leading-none transition-colors"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Category strip — horizontal scroll on mobile, no wrap.
          Negative margin trick lets pills extend to the screen edge so
          there's a natural "more →" affordance when content overflows. */}
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hidden">
        <div className="flex gap-2 min-w-max">
          {LIVE_TYPE_FILTERS.map((t) => (
            <Pill
              key={t.value}
              active={liveType === t.value}
              onClick={() => pickType(t.value)}
            >
              {t.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Sub-category strip — also horizontal-scrollable */}
      {subcategoryRow && (
        <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hidden">
          <div className="flex gap-2 min-w-max items-center">
            <span className="text-[10px] text-cream-muted/60 tracking-widest uppercase font-bold shrink-0 pl-1">
              ↳
            </span>
            {subcategoryRow.map((s) => (
              <Pill
                key={s.value}
                size="sm"
                active={liveSubcat === s.value}
                onClick={() => pickSubcat(s.value)}
              >
                {s.label}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {/* Compact inline price slider — full width, label inline, no card. */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-[10px] uppercase tracking-widest font-bold text-cream-muted shrink-0">
          Max
        </span>
        <input
          type="range"
          min={0}
          max={STEPS}
          step={1}
          value={pricePct}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (next !== pricePct) {
              setPricePct(next);
              tapHaptic();
            }
          }}
          aria-label="Maximum price"
          className="cove-range flex-1"
          style={{
            background: `linear-gradient(to right, rgb(255 185 0) 0%, rgb(255 185 0) ${sliderPct}%, rgb(255 255 255 / 0.1) ${sliderPct}%, rgb(255 255 255 / 0.1) 100%)`,
          }}
        />
        <span className="text-amber font-bold text-sm tabular-nums min-w-[52px] text-right shrink-0">
          {priceCap === null ? "Any" : `$${priceCap}`}
        </span>
      </div>

      {/* Cards — visible by default. Mobile = 1 col, tablet = 2, desktop = 3. */}
      {filteredLive.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredLive.map((p) => (
            <LiveProductCard key={p.key} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-cream-muted/80 text-sm py-6 font-medium text-center">
          No live products match these filters.
        </p>
      )}
    </section>
  );
}
