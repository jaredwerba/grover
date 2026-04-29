"use client";

import { useState, useMemo, useEffect } from "react";
import { Strain } from "@/lib/strains";
import type { LiveProduct } from "@/lib/inventory-public";

const TYPE_COLORS: Record<Strain["type"], string> = {
  Indica: "border-sky/50 text-sky/80",
  Sativa: "border-amber/50 text-amber/80",
  Hybrid: "border-forest-light/60 text-forest-light",
};

const TYPE_FILTERS: Array<Strain["type"] | "All"> = ["All", "Indica", "Sativa", "Hybrid"];

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

function StrainCard({
  strain,
  availableAt,
}: {
  strain: Strain;
  availableAt?: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="bg-forest border-2 border-forest-mid rounded-sm transition-all"
      style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)" }}
    >
      {/* Card header — always visible, click to expand */}
      <button
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:border-amber/40 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-cream font-groovy text-xl leading-tight tracking-wide">
              {strain.name}
            </h3>
            <span className={`text-[10px] border px-2 py-0.5 rounded-sm font-bold tracking-widest uppercase shrink-0 ${TYPE_COLORS[strain.type]}`}>
              {strain.type}
            </span>
          </div>
          <p className="text-cream-muted text-xs leading-relaxed line-clamp-2">
            {strain.description}
          </p>
          {/* Quick stats */}
          <div className="flex gap-4 mt-2">
            <span className="text-amber text-xs font-bold">THC {strain.thc}</span>
            <span className="text-cream-muted text-xs">CBD {strain.cbd}</span>
          </div>
          {/* Live "available at" badge — only when we have ingest data */}
          {availableAt && availableAt.length > 0 && (
            <p className="mt-2 text-[10px] text-cream-muted/70 tracking-wide flex items-start gap-1.5 leading-snug">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-amber/60 mt-1 shrink-0 animate-pulse"
                aria-hidden="true"
              />
              <span>
                <span className="text-amber/80 font-semibold">Available at: </span>
                {availableAt.slice(0, 3).join(", ")}
                {availableAt.length > 3 && ` +${availableAt.length - 3} more`}
              </span>
            </p>
          )}
        </div>
        <span className="text-amber/60 text-lg shrink-0 mt-0.5 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ↓
        </span>
      </button>

      {/* Expanded data table */}
      {open && (
        <div className="border-t border-forest-mid">
          <div className="px-5 py-4 border-b border-forest-mid/60">
            <p className="text-xs text-amber/70 font-bold tracking-widest uppercase mb-2">Effects</p>
            <div className="flex flex-wrap gap-1.5">
              {strain.effects.map((e) => (
                <span key={e} className="text-xs bg-forest-mid/40 text-cream px-2.5 py-1 rounded-sm">
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div className="px-5 py-4 border-b border-forest-mid/60">
            <p className="text-xs text-amber/70 font-bold tracking-widest uppercase mb-2">Terpenes</p>
            <div className="flex flex-wrap gap-1.5">
              {strain.terpenes.map((t) => (
                <span key={t} className="text-xs border border-sky/30 text-sky/80 px-2.5 py-1 rounded-sm">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="px-5 py-4 border-b border-forest-mid/60">
            <p className="text-xs text-amber/70 font-bold tracking-widest uppercase mb-2">Flavors</p>
            <div className="flex flex-wrap gap-1.5">
              {strain.flavors.map((f) => (
                <span key={f} className="text-xs border border-rust/30 text-rust/80 px-2.5 py-1 rounded-sm">
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-amber/70 font-bold tracking-widest uppercase mb-3">Potency</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-forest-deep/60 rounded-sm p-3 text-center">
                <p className="text-amber font-bold text-lg leading-none mb-1">{strain.thc}</p>
                <p className="text-cream-muted text-[10px] tracking-widest uppercase">THC</p>
              </div>
              <div className="bg-forest-deep/60 rounded-sm p-3 text-center">
                <p className="text-sky font-bold text-lg leading-none mb-1">{strain.cbd}</p>
                <p className="text-cream-muted text-[10px] tracking-widest uppercase">CBD</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  // Range thumb fires onInput on every value step. Vibrate on each.
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
          // Tailwind v4 doesn't ship range-thumb utilities; fill via gradient.
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
  strains,
  availability,
  liveProducts,
}: {
  strains: Strain[];
  availability?: Record<string, string[]>;
  liveProducts?: LiveProduct[];
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Strain["type"] | "All">("All");
  const [liveType, setLiveType] = useState<string>("all");
  const [liveSubcat, setLiveSubcat] = useState<string>("all");
  const [showCards, setShowCards] = useState(false);

  // Slider bounds derived from the data.
  const bounds = useMemo(() => {
    if (!liveProducts || liveProducts.length === 0) {
      return { priceMax: 200, thcMax: 100 };
    }
    let pMax = 0;
    let tMax = 0;
    for (const p of liveProducts) {
      if (p.priceMax !== null && p.priceMax > pMax) pMax = p.priceMax;
      if (p.thcMax !== null && p.thcMax > tMax) tMax = p.thcMax;
    }
    return {
      priceMax: Math.max(50, Math.ceil(pMax)),
      thcMax: Math.max(35, Math.ceil(tMax)),
    };
  }, [liveProducts]);

  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [minThc, setMinThc] = useState<number>(0);

  // Initialize sliders to "no filter" values once we know the bounds.
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

  const filteredFeatured = useMemo(() => {
    let result = strains;
    if (typeFilter !== "All") result = result.filter((s) => s.type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.effects.some((e) => e.toLowerCase().includes(q)) ||
          s.terpenes.some((t) => t.toLowerCase().includes(q)) ||
          s.flavors.some((f) => f.toLowerCase().includes(q))
      );
    }
    return result;
  }, [strains, query, typeFilter]);

  const filteredLive = useMemo(() => {
    if (!liveProducts || liveProducts.length === 0) return [];
    let result = liveProducts;

    // Main category — Edibles also includes tinctures per the new spec.
    if (liveType !== "all") {
      if (liveType === "edible") {
        result = result.filter((p) => p.type === "edible" || p.type === "tincture");
      } else {
        result = result.filter((p) => p.type === liveType);
      }
    }

    // Sub-category
    if (liveSubcat !== "all" && liveType !== "all") {
      result = result.filter((p) =>
        classifySubcategory(p, liveType).includes(liveSubcat)
      );
    }

    // Price max — only filter when user has dragged below the cap.
    if (maxPrice > 0 && maxPrice < bounds.priceMax) {
      result = result.filter((p) => (p.priceMin ?? 0) <= maxPrice);
    }

    // THC min — only filter when user has dragged above 0.
    if (minThc > 0) {
      result = result.filter((p) => (p.thcMax ?? 0) >= minThc);
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
  }, [liveProducts, liveType, liveSubcat, maxPrice, minThc, query, bounds.priceMax]);

  const subcategoryRow = liveType !== "all" ? LIVE_SUBCATEGORIES[liveType] : null;
  const labelForType = LIVE_TYPE_LABELS[liveType] ?? "products";

  return (
    <div className="flex flex-col gap-8">
      {/* In Stock in Vermont — TOP. Cards appear after the user clicks any pill. */}
      {liveProducts && liveProducts.length > 0 && (
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

          {/* Price + THC sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-forest/40 border border-forest-mid/60 rounded-sm px-4 py-4">
            <HapticSlider
              label="Max price"
              value={maxPrice}
              min={0}
              max={bounds.priceMax}
              step={1}
              formatValue={(v) => (v >= bounds.priceMax ? `Any` : `$${v}`)}
              formatHint={() =>
                `Up to $${bounds.priceMax}+ available`
              }
              onChange={(v) => {
                setMaxPrice(v);
                setShowCards(true);
              }}
            />
            <HapticSlider
              label="Min THC"
              value={minThc}
              min={0}
              max={bounds.thcMax}
              step={1}
              formatValue={(v) => (v === 0 ? `Any` : `${v}%`)}
              formatHint={() => `Up to ${bounds.thcMax}% in stock`}
              onChange={(v) => {
                setMinThc(v);
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
              Tap a category or adjust a filter to browse products.
            </p>
          )}
        </section>
      )}

      {/* Search + Indica/Sativa/Hybrid filter for the Featured section */}
      <div className="flex flex-col gap-3 pt-4 border-t border-forest-mid/40">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted/50 text-sm pointer-events-none">⌕</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search strain, brand, shop, effect, terpene, or flavor…"
              className="w-full bg-forest border-2 border-forest-mid text-cream text-sm font-medium placeholder:text-cream-muted/50 placeholder:font-normal pl-8 pr-4 py-2.5 rounded-sm outline-none focus:border-amber/60 transition-colors min-h-[44px]"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted/50 hover:text-cream text-lg leading-none">
                ×
              </button>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {TYPE_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors min-h-[44px] ${
                  typeFilter === t
                    ? "bg-amber text-forest-deep"
                    : "border-2 border-forest-mid text-cream-muted hover:border-amber/40 hover:text-cream"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured strains section */}
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <h2 className="text-amber/80 text-xs font-bold tracking-[0.3em] uppercase">
            Featured Strains
          </h2>
          <p className="text-cream-muted text-xs font-medium">
            {filteredFeatured.length} of {strains.length}
            {query && <span className="text-amber/70"> · &ldquo;{query}&rdquo;</span>}
          </p>
        </div>
        {filteredFeatured.length === 0 ? (
          <p className="text-cream-muted/80 text-sm py-6 font-medium">
            No featured strains match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatured.map((s) => (
              <StrainCard
                key={s.id}
                strain={s}
                availableAt={availability?.[s.id]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
