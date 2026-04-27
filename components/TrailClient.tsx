"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Dispensary } from "@/lib/dispensaries";
import DispensaryCard from "./DispensaryCard";
import type { ShopInventoryMeta } from "@/lib/inventory";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "#0b2d1b" }}
    >
      <span className="text-cream-muted text-xs tracking-widest uppercase animate-pulse">
        Loading map…
      </span>
    </div>
  ),
});

type Filter = "recreational" | "medical";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "recreational", label: "Recreational" },
  { value: "medical", label: "Medical" },
];

// Card height — drives the map size calculation
const CARD_ROW_HEIGHT = 210;

export default function TrailClient({
  dispensaries,
  inventoryMetas,
}: {
  dispensaries: Dispensary[];
  inventoryMetas?: Record<string, ShopInventoryMeta | null>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter | null>(null);
  const [selected, setSelected] = useState<Dispensary | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    let result = dispensaries;
    if (filter) result = result.filter((d) => d.tags.includes(filter));
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q)
      );
    }
    return result;
  }, [dispensaries, filter, query]);

  const handleSelect = useCallback((d: Dispensary) => {
    setSelected(d);
    const el = cardRefs.current[d.id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }, []);

  const handleCardClick = useCallback((d: Dispensary) => {
    setSelected(d);
  }, []);

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Search + filter bar */}
      <div className="flex gap-2 shrink-0">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted/50 text-sm pointer-events-none">
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or town…"
            className="w-full bg-forest border-2 border-forest-mid text-cream text-sm placeholder:text-cream-muted/40 pl-8 pr-4 py-2 rounded-sm outline-none focus:border-amber/60 transition-colors min-h-[40px]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted/50 hover:text-cream text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(filter === value ? null : value)}
              className={`px-3 py-2 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors min-h-[40px] ${
                filter === value
                  ? "bg-amber text-forest-deep"
                  : "border-2 border-forest-mid text-cream-muted hover:border-amber/40 hover:text-cream"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-cream-muted text-xs tracking-wide shrink-0">
        {filtered.length} location{filtered.length !== 1 ? "s" : ""}
        {query && <span className="text-amber/70"> · &ldquo;{query}&rdquo;</span>}
      </p>

      {/* Map — fills all remaining space */}
      <div
        className="w-full rounded-sm overflow-hidden border-2 border-forest-mid flex-1 min-h-0"
        style={{
          boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)",
        }}
      >
        <MapClient
          dispensaries={filtered}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      {/* Horizontal card scroll row — fixed height */}
      {filtered.length === 0 ? (
        <p className="text-cream-muted text-center py-6 shrink-0">
          No dispensaries match your search.
        </p>
      ) : (
        <div
          ref={rowRef}
          className="cards-scroll flex gap-3 overflow-x-auto shrink-0"
          style={{
            height: `${CARD_ROW_HEIGHT}px`,
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {filtered.map((d) => (
            <div
              key={d.id}
              ref={(el) => { cardRefs.current[d.id] = el; }}
              onClick={() => handleCardClick(d)}
              className={`cursor-pointer transition-all rounded-sm shrink-0 h-full ${
                selected?.id === d.id
                  ? "ring-2 ring-amber/60 ring-offset-1 ring-offset-forest-deep"
                  : "hover:ring-1 hover:ring-forest-mid"
              }`}
              style={{
                width: "min(300px, 80vw)",
                scrollSnapAlign: "start",
              }}
            >
              <DispensaryCard
                dispensary={d}
                inventoryMeta={inventoryMetas?.[d.id]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
