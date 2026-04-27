"use client";

import { useState, useMemo } from "react";
import { Strain } from "@/lib/strains";
import type { LiveProduct } from "@/lib/inventory-public";

const TYPE_COLORS: Record<Strain["type"], string> = {
  Indica: "border-sky/50 text-sky/80",
  Sativa: "border-amber/50 text-amber/80",
  Hybrid: "border-forest-light/60 text-forest-light",
};

const TYPE_FILTERS: Array<Strain["type"] | "All"> = ["All", "Indica", "Sativa", "Hybrid"];

// Friendly labels for the live-product chip.
const LIVE_TYPE_LABELS: Record<string, string> = {
  flower: "Flower",
  preroll: "Pre-Roll",
  vape: "Vape",
  concentrate: "Concentrate",
  edible: "Edible",
  drink: "Drink",
  tincture: "Tincture",
};

const LIVE_TYPE_FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "flower", label: "Flower" },
  { value: "preroll", label: "Pre-Rolls" },
  { value: "vape", label: "Vapes" },
  { value: "edible", label: "Edibles" },
  { value: "concentrate", label: "Concentrates" },
  { value: "drink", label: "Drinks" },
];

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
          {/* Effects */}
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

          {/* Terpenes */}
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

          {/* Flavors */}
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

          {/* Data table */}
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
  const typeLabel = LIVE_TYPE_LABELS[product.type] ?? product.type;
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
      <div className="flex items-start gap-2 mb-2">
        <h3 className="flex-1 text-cream text-base sm:text-lg font-groovy leading-tight tracking-wide break-words">
          {product.displayName}
        </h3>
        <span className="shrink-0 text-[10px] border border-forest-light/50 text-forest-light px-2 py-0.5 rounded-sm font-bold tracking-widest uppercase">
          {typeLabel}
        </span>
      </div>
      {/* Brands */}
      {product.brands.length > 0 && (
        <p className="text-cream-muted text-[11px] leading-snug mb-2 line-clamp-1">
          {product.brands.slice(0, 3).join(" · ")}
          {product.brands.length > 3 && ` +${product.brands.length - 3} more`}
        </p>
      )}
      {/* THC + price line */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-auto pt-2">
        {thc && <span className="text-amber text-xs font-bold">THC {thc}</span>}
        {price && <span className="text-cream-muted text-xs">{price}</span>}
        <span className="text-cream-muted/60 text-[10px] tracking-wide ml-auto">
          {product.skuCount} SKU{product.skuCount !== 1 ? "s" : ""}
        </span>
      </div>
      {/* Available at */}
      <p className="mt-2 text-[10px] text-cream-muted/70 tracking-wide flex items-start gap-1.5 leading-snug">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-amber/60 mt-1 shrink-0 animate-pulse"
          aria-hidden="true"
        />
        <span>
          <span className="text-amber/80 font-semibold">At: </span>
          {product.shops.join(", ")}
        </span>
      </p>
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
    if (liveType !== "all") result = result.filter((p) => p.type === liveType);
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
  }, [liveProducts, query, liveType]);

  return (
    <div className="flex flex-col gap-8">
      {/* Search + type filter — applies to BOTH sections */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted/50 text-sm pointer-events-none">⌕</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search strain, brand, shop, effect, terpene, or flavor…"
              className="w-full bg-forest border-2 border-forest-mid text-cream text-sm placeholder:text-cream-muted/40 pl-8 pr-4 py-2.5 rounded-sm outline-none focus:border-amber/60 transition-colors min-h-[44px]"
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
          <p className="text-cream-muted/60 text-xs">
            {filteredFeatured.length} of {strains.length}
            {query && <span className="text-amber/70"> · &ldquo;{query}&rdquo;</span>}
          </p>
        </div>
        {filteredFeatured.length === 0 ? (
          <p className="text-cream-muted/70 text-sm py-6">
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

      {/* Live in Vermont section — only when we have ingested products */}
      {liveProducts && liveProducts.length > 0 && (
        <section className="flex flex-col gap-4 pt-8 border-t border-forest-mid/40">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-amber/70 text-[10px] tracking-[0.3em] uppercase font-semibold mb-1 flex items-center gap-2">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full bg-amber/80 animate-pulse"
                  aria-hidden="true"
                />
                Live · Synced from dispensary menus
              </p>
              <h2 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide leading-tight">
                In Stock in Vermont
              </h2>
              <p className="text-cream-muted/70 text-xs mt-1">
                {filteredLive.length} of {liveProducts.length} unique products across connected dispensaries
                {query && <span className="text-amber/70"> · &ldquo;{query}&rdquo;</span>}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {LIVE_TYPE_FILTERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setLiveType(t.value)}
                  className={`px-3 py-1.5 rounded-sm text-[11px] font-bold tracking-widest uppercase transition-colors ${
                    liveType === t.value
                      ? "bg-amber text-forest-deep"
                      : "border border-forest-mid text-cream-muted hover:border-amber/40 hover:text-cream"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {filteredLive.length === 0 ? (
            <p className="text-cream-muted/70 text-sm py-6">
              No live products match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLive.map((p) => (
                <LiveProductCard key={p.key} product={p} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
