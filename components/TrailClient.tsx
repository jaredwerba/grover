"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Dispensary } from "@/lib/dispensaries";
import DispensaryCard from "./DispensaryCard";
import type { ShopInventoryMeta } from "@/lib/inventory";

/** Haversine distance in miles between two lat/lng points. */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
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

  const handleFindNearest = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setUserLocation({ lat: uLat, lng: uLng });

        // Persist to Cove DB (fire-and-forget — ok if user is not logged in)
        fetch("/api/user/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: uLat, lng: uLng }),
        }).catch(() => {});

        // Find nearest dispensary from full list (ignore filters so we always find one)
        let nearest: Dispensary | null = null;
        let minDist = Infinity;
        for (const d of dispensaries) {
          const dist = haversineDistance(uLat, uLng, d.lat, d.lng);
          if (dist < minDist) {
            minDist = dist;
            nearest = d;
          }
        }

        if (nearest) {
          // Clear any active filter/query so the nearest dispensary is visible
          setQuery("");
          setFilter(null);
          setSelected(nearest);
          // Scroll to its card
          setTimeout(() => {
            const el = cardRefs.current[nearest!.id];
            if (el) {
              el.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
            }
          }, 100);
        }
        setLocating(false);
      },
      () => {
        // Permission denied or error — silently stop
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [dispensaries]);

  return (
    <div className="flex flex-col gap-2 h-full">
      {/* Search bar — full width */}
      <div className="relative shrink-0">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-muted/50 text-base pointer-events-none">
          ⌕
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or town…"
          className="w-full bg-forest border-2 border-forest-mid text-cream text-[15px] font-medium placeholder:text-cream-muted/40 pl-10 pr-10 py-3 rounded-full outline-none focus:border-amber/60 transition-colors min-h-[48px]"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-cream-muted/60 hover:text-cream hover:bg-forest-mid/40 text-lg leading-none transition-colors"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleFindNearest}
          disabled={locating}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors min-h-[40px] bg-amber text-forest-deep hover:bg-amber/90 disabled:opacity-60"
          title="Find nearest dispensary"
        >
          {locating ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-forest-deep/30 border-t-forest-deep rounded-full animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
          )}
          Near Me
        </button>
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

      {/* Result count */}
      <p className="text-cream-muted text-xs tracking-wide shrink-0">
        {filtered.length} location{filtered.length !== 1 ? "s" : ""}
        {query && <span className="text-amber/70"> · &ldquo;{query}&rdquo;</span>}
      </p>

      {/* Map — square aspect ratio so the page scrolls past easily */}
      <div
        className="w-full rounded-sm overflow-hidden border-2 border-forest-mid aspect-square shrink-0"
        style={{
          boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)",
        }}
      >
        <MapClient
          dispensaries={filtered}
          selected={selected}
          onSelect={handleSelect}
          userLocation={userLocation}
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
