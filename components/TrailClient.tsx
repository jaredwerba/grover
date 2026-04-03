"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Dispensary } from "@/lib/dispensaries";
import DispensaryCard from "./DispensaryCard";

// Dynamically import the map — Leaflet requires browser APIs, no SSR
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
  const listRef = useRef<HTMLDivElement | null>(null);

  // Filter + search
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

  // When a map pin is clicked, select + scroll card into view
  const handleSelect = useCallback((d: Dispensary) => {
    setSelected(d);
    const el = cardRefs.current[d.id];
    if (el && listRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
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

        {/* Filter pills */}
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

      {/* Split layout: map + list */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: "600px" }}>

        {/* Map — full width mobile, sticky right column on desktop */}
        <div
          className="w-full lg:w-[420px] xl:w-[480px] rounded-sm overflow-hidden border-2 border-forest-mid shrink-0 order-first lg:order-last"
          style={{
            height: "80vw",
            minHeight: "360px",
            maxHeight: "520px",
            position: "sticky",
            top: "72px",
            alignSelf: "flex-start",
            boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)",
          }}
        >
          <MapClient
            dispensaries={filtered}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>

        {/* Scrollable card list */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto pr-1"
          style={{ maxHeight: "75vh" }}
        >
          {filtered.length === 0 ? (
            <p className="text-cream-muted text-center py-16">
              No dispensaries match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((d) => (
                <div
                  key={d.id}
                  ref={(el) => { cardRefs.current[d.id] = el; }}
                  onClick={() => handleSelect(d)}
                  className={`cursor-pointer transition-all rounded-sm ${
                    selected?.id === d.id
                      ? "ring-2 ring-amber/60 ring-offset-1 ring-offset-forest-deep"
                      : "hover:ring-1 hover:ring-forest-mid"
                  }`}
                >
                  <DispensaryCard dispensary={d} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
