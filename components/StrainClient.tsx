"use client";

import { useState, useMemo, useEffect } from "react";
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
  flower: [
    { value: "all", label: "All Flower" },
    { value: "sativa", label: "Sativa" },
    { value: "indica", label: "Indica" },
    { value: "hybrid", label: "Hybrid" },
  ],
  edible: [
    { value: "all", label: "All Edibles" },
    { value: "gummies", label: "Gummies" },
    { value: "chocolate", label: "Chocolate" },
    { value: "tincture", label: "Tinctures" },
  ],
  concentrate: [
    { value: "all", label: "All Concentrates" },
    { value: "rosin", label: "Rosin" },
    { value: "hash", label: "Hash" },
    { value: "other", label: "Other" },
  ],
  vape: [
    { value: "all", label: "All Vapes" },
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

/**
 * Classify a live product into a sub-category for the active main type.
 * Returns the list of sub-tags it qualifies for. Best-effort name-based
 * heuristic — if we can't classify, the product still appears under
 * the parent's "All" but not under any specific sub-category.
 */
function classifySubcategory(product: LiveProduct, mainType: string): string[] {
  const n = product.displayName.toLowerCase();
  const brands = product.brands.join(" ").toLowerCase();
  const haystack = `${n} ${brands}`;
  const tags: string[] = [];

  if (mainType === "flower") {
    if (/\bsativa\b/.test(haystack)) tags.push("sativa");
    if (/\bindica\b/.test(haystack)) tags.push("indica");
    if (/\bhybrid\b/.test(haystack)) tags.push("hybrid");
  }

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
      className="bg-forest border-2 border-forest-mid rounded-sm hover:border-amber/40 transition-colors px-5 py-4 flex flex-col"
      style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)" }}
    >
      <div className="flex items-start gap-2 mb-2.5">
        <h3 className="flex-1 text-cream text-base sm:text-[17px] font-semibold leading-snug break-words">
          {product.displayName}
        </h3>
        <span className="shrink-0 text-[10px] border border-forest-light/50 text-forest-light px-2 py-0.5 rounded-sm font-bold tracking-widest uppercase">
          {typeLabel}
        </span>
      </div>
      {product.brands.length > 0 && (
        <p className="text-cream-muted text-xs font-medium leading-snug mb-2 line-clamp-1">
          {product.brands.slice(0, 3).join(" · ")}
          {product.brands.length > 3 && ` +${product.brands.length - 3} more`}
        </p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-auto pt-2">
        {thc && <span className="text-amber text-sm font-bold">THC {thc}</span>}
        {price && <span className="text-cream-muted text-sm font-semibold">{price}</span>}
        <span className="text-cream-muted/70 text-[11px] font-medium tracking-wide ml-auto">
          {product.skuCount} SKU{product.skuCount !== 1 ? "s" : ""}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-cream-muted/80 font-medium tracking-wide flex items-start gap-1.5 leading-snug">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-amber/70 mt-1 shrink-0 animate-pulse"
          aria-hidden="true"
        />
        <span>
          <span className="text-amber/90 font-semibold">At: </span>
          {product.shops.join(", ")}
        </span>
      </p>
    </div>
  );
}

/** Horizontal slider with brand styling + haptic tap on every step. */
function HapticSlider({
  label,
  value,
  min,
  max,
  step = 1,
  formatValue,
  formatHint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  formatValue: (v: number) => string;
  formatHint?: () => string;
  onChange: (v: number) => void;
}) {
  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value);
    if (next !== value) {
      onChange(next);
      tapHaptic();
    }
  }
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-[11px] uppercase tracking-widest font-bold text-cream-muted">
          {label}
        </label>
        <span className="text-amber font-bold text-sm tabular-nums">
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handle}
        aria-label={label}
        className="cove-range w-full"
        style={{
          background: `linear-gradient(to right, rgb(255 185 0) 0%, rgb(255 185 0) ${pct}%, rgb(255 255 255 / 0.1) ${pct}%, rgb(255 255 255 / 0.1) 100%)`,
        }}
      />
      {formatHint && (
        <p className="mt-1 text-[10px] text-cream-muted/60 tracking-wide">
          {formatHint()}
        </p>
      )}
    </div>
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
  const [showCards, setShowCards] = useState(false);

  const bounds = useMemo(() => {
    if (!liveProducts || liveProducts.length === 0) {
      return { priceMax: 200 };
    }
    let pMax = 0;
    for (const p of liveProducts) {
      if (p.priceMax !== null && p.priceMax > pMax) pMax = p.priceMax;
    }
    return { priceMax: Math.max(50, Math.ceil(pMax)) };
  }, [liveProducts]);

  const [maxPrice, setMaxPrice] = useState<number>(0);

  useEffect(() => {
    if (maxPrice === 0) setMaxPrice(bounds.priceMax);
  }, [bounds.priceMax, maxPrice]);

  function pickType(value: string) {
    setLiveType(value);
    setLiveSubcat("all");
    setShowCards(true);
    tapHaptic();
  }
  function pickSubcat(value: string) {
    setLiveSubcat(value);
    setShowCards(true);
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

    if (maxPrice > 0 && maxPrice < bounds.priceMax) {
      result = result.filter((p) => (p.priceMin ?? 0) <= maxPrice);
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
    return result;
  }, [liveProducts, liveType, liveSubcat, maxPrice, query, bounds.priceMax]);

  const subcategoryRow = liveType !== "all" ? LIVE_SUBCATEGORIES[liveType] : null;
  const labelForType = LIVE_TYPE_LABELS[liveType] ?? "products";

  // No live data yet (Redis empty / never synced)
  if (!liveProducts || liveProducts.length === 0) {
    return (
      <div className="bg-forest/40 border border-forest-mid/60 rounded-sm px-5 py-8 text-center">
        <p className="text-cream-muted text-sm font-medium">
          Live inventory is syncing. Check back shortly.
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
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
        <p className="text-cream-muted text-sm font-medium mt-1.5">
          <span className="text-amber font-bold tabular-nums">
            {filteredLive.length.toLocaleString()}
          </span>{" "}
          {liveType === "all" ? "products" : labelForType} across connected dispensaries
          {query && <span className="text-amber/70"> · &ldquo;{query}&rdquo;</span>}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted/50 text-sm pointer-events-none"
          aria-hidden="true"
        >
          ⌕
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowCards(true);
          }}
          placeholder="Search strain, brand, or shop…"
          className="w-full bg-forest border-2 border-forest-mid text-cream text-sm font-medium placeholder:text-cream-muted/50 placeholder:font-normal pl-8 pr-4 py-2.5 rounded-sm outline-none focus:border-amber/60 transition-colors min-h-[44px]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted/50 hover:text-cream text-lg leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Main category pills */}
      <div className="flex flex-wrap gap-2">
        {LIVE_TYPE_FILTERS.map((t) => (
          <button
            key={t.value}
            onClick={() => pickType(t.value)}
            className={`px-4 py-2.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors min-h-[44px] ${
              liveType === t.value
                ? "bg-amber text-forest-deep"
                : "border-2 border-forest-mid text-cream-muted hover:border-amber/40 hover:text-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Sub-category pills — only when applicable */}
      {subcategoryRow && (
        <div className="flex flex-wrap gap-2 pl-1 ml-1 border-l-2 border-amber/20">
          {subcategoryRow.map((s) => (
            <button
              key={s.value}
              onClick={() => pickSubcat(s.value)}
              className={`px-3 py-2 rounded-full text-[11px] font-bold tracking-wider uppercase transition-colors ${
                liveSubcat === s.value
                  ? "bg-amber/90 text-forest-deep"
                  : "bg-forest border border-forest-mid text-cream-muted hover:border-amber/50 hover:text-cream"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Price slider */}
      <div className="bg-forest/40 border border-forest-mid/60 rounded-sm px-4 py-4">
        <HapticSlider
          label="Max price"
          value={maxPrice}
          min={0}
          max={bounds.priceMax}
          step={1}
          formatValue={(v) => (v >= bounds.priceMax ? `Any` : `$${v}`)}
          formatHint={() => `Up to $${bounds.priceMax}+ available`}
          onChange={(v) => {
            setMaxPrice(v);
            setShowCards(true);
          }}
        />
      </div>

      {/* Cards — only after user interacts */}
      {showCards ? (
        filteredLive.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredLive.map((p) => (
              <LiveProductCard key={p.key} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-cream-muted/80 text-sm py-6 font-medium">
            No live products match these filters.
          </p>
        )
      ) : (
        <p className="text-cream-muted/70 text-sm py-2 font-medium">
          Tap a category, search, or adjust the price filter to browse products.
        </p>
      )}
    </section>
  );
}
