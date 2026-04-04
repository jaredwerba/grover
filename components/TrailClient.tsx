"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Dispensary } from "@/lib/dispensaries";
import DispensaryCard from "./DispensaryCard";

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

export default function TrailClient({ dispensaries }: { dispensaries: Dispensary[] }) {
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

  // Pin clicked → select + scroll card horizontally into view
  const handleSelect = useCallback((d: Dispensary) => {
    setSelected(d);
    const el = cardRefs.current[d.id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }, []);

  // Card clicked → select + fly map to pin
  const handleCardClick = useCallback((d: Dispensary) => {
    setSelected(d);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-muted/50 text-sm pointer-events-none">
            ⌕
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or town…"
            className="w-full bg-forest border-2 border-forest-mid text-cream text-sm placeholder:text-cream-muted/40 pl-8 pr-4 py-2.5 rounded-sm outline-none focus:border-amber/60 transition-colors min-h-[44px]"
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
              className={`px-4 py-2.5 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors min-h-[44px] ${
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
      <p className="text-cream-muted text-xs tracking-wide">
        {filtered.length} location{filtered.length !== 1 ? "s" : ""}
        {query && <span className="text-amber/70"> · &ldquo;{query}&rdquo;</span>}
      </p>

      {/* Map — sticky, full width */}
      <div
        className="w-full rounded-sm overflow-hidden border-2 border-forest-mid"
        style={{
          height: "55vh",
          minHeight: "300px",
          position: "sticky",
          top: "72px",
          zIndex: 10,
          boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)",
        }}
      >
        <MapClient
          dispensaries={filtered}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      {/* Horizontal card scroll row */}
      {filtered.length === 0 ? (
        <p className="text-cream-muted text-center py-10">
          No dispensaries match your search.
        </p>
      ) : (
        <div
          ref={rowRef}
          className="cards-scroll flex gap-3 overflow-x-auto pb-4"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {filtered.map((d) => (
            <div
              key={d.id}
              ref={(el) => { cardRefs.current[d.id] = el; }}
              onClick={() => handleCardClick(d)}
              className={`cursor-pointer transition-all rounded-sm shrink-0 ${
                selected?.id === d.id
                  ? "ring-2 ring-amber/60 ring-offset-1 ring-offset-forest-deep"
                  : "hover:ring-1 hover:ring-forest-mid"
              }`}
              style={{
                width: "min(300px, 80vw)",
                scrollSnapAlign: "start",
              }}
            >
              <DispensaryCard dispensary={d} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
