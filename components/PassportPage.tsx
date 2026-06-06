"use client";

import type { Dispensary, Region } from "@/lib/dispensaries";

/**
 * A single CRAVE Passport "page" — visually styled after the printed
 * brochure (region tag, dispensary header, sticker placeholder, brand
 * row, mountain illustration, scan-to-explore QR), but in the Cove
 * design system (forest/cream/amber).
 *
 * Pure presentational — no animation/gesture logic. Wrapped by
 * <PassportSwiper /> which handles drag + page transitions.
 */

const REGION_ACCENT: Record<Region, { color: string; label: string }> = {
  "Champlain Valley": { color: "#f59e0b", label: "Champlain Valley Region Trail" },
  "Lamoille to NEK": { color: "#a78bfa", label: "Lamoille to NEK Trail" },
  "Catamount": { color: "#ef4444", label: "The Catamount Trail" },
  "Granite Capital": { color: "#fb7185", label: "Granite Capital Trail" },
};

// Decorative — three faux participating brand chips. Real brands can be
// wired up later; the visual rhythm matches the printed brochure.
const FAKE_BRANDS = [
  { name: "Highly Rooted", emoji: "🌿" },
  { name: "Pine Rock", emoji: "🌲" },
  { name: "Simple", emoji: "✋" },
  { name: "Spring", emoji: "💧" },
  { name: "Yellowbird", emoji: "🐦" },
  { name: "Mechayeh", emoji: "✨" },
];

function pickBrands(seed: string, n: number) {
  // Stable shuffle so each shop shows a consistent subset across loads.
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const arr = [...FAKE_BRANDS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (hash * (i + 31)) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

export default function PassportPage({
  dispensary,
  index,
  total,
  collected,
}: {
  dispensary: Dispensary;
  index: number;
  total: number;
  collected?: { collected_at: string };
}) {
  const accent = dispensary.region
    ? REGION_ACCENT[dispensary.region]
    : { color: "#FFB900", label: "CRAVE Trail" };
  const brands = pickBrands(dispensary.id, 4);

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden flex flex-col select-none"
      style={{
        background:
          "linear-gradient(180deg, #f7eed8 0%, #f4e9cf 60%, #f0e0bc 100%)",
        boxShadow:
          "0 20px 50px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,185,0,0.18)",
      }}
    >
      {/* Trail tag + edition strip */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        <span
          className="text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-sm text-white"
          style={{ background: "#0f2d1c" }}
        >
          {accent.label}
        </span>
        <span className="text-[9px] text-forest-deep/60 font-mono tracking-wide">
          2026 Edition
        </span>
      </div>

      {/* Accent border frame */}
      <div
        className="absolute inset-3 rounded-xl pointer-events-none"
        style={{
          border: `2px solid ${accent.color}`,
          boxShadow: `inset 0 0 0 2px ${accent.color}26`,
        }}
        aria-hidden="true"
      />

      {/* Dispensary header */}
      <div className="relative px-6 pt-3 pb-4 text-center shrink-0">
        <h2
          className="font-groovy text-2xl sm:text-3xl leading-tight tracking-wide mb-1"
          style={{ color: "#0f2d1c" }}
        >
          {dispensary.name}
        </h2>
        <p className="text-forest-deep/70 text-xs leading-snug">
          {dispensary.address}
        </p>
        <p className="text-forest-deep/70 text-xs">
          {dispensary.city}, VT
        </p>
      </div>

      {/* Sticker placeholder / collected stamp — centerpiece */}
      <div className="relative flex-1 flex items-center justify-center px-6 min-h-0">
        <StickerSlot
          initial={dispensary.name.charAt(0)}
          accent={accent.color}
          collectedAt={collected?.collected_at}
        />
      </div>

      {/* Mountain silhouette behind the bottom half */}
      <div
        className="absolute inset-x-3 bottom-3 pointer-events-none overflow-hidden rounded-b-xl"
        style={{ height: "45%" }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 480"
          preserveAspectRatio="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,290 L120,245 L260,268 L400,200 L520,168 L630,210 L750,182 L880,215 L1000,188 L1110,165 L1230,200 L1360,228 L1440,245 L1440,480 L0,480 Z"
            fill="#275e3c"
            fillOpacity="0.18"
          />
          <path
            d="M0,360 L140,318 L300,342 L460,308 L620,330 L780,305 L940,325 L1100,312 L1260,332 L1400,320 L1440,325 L1440,480 L0,480 Z"
            fill="#0f2d1c"
            fillOpacity="0.22"
          />
        </svg>
      </div>

      {/* Brands + QR row */}
      <div className="relative px-5 pb-4 shrink-0">
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-bold leading-tight mb-2"
              style={{ color: "#0f2d1c" }}
            >
              Participating
              <br />
              CRAVE Brands
            </p>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b) => (
                <span
                  key={b.name}
                  className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full text-forest-deep"
                  style={{
                    background: "rgba(15, 45, 28, 0.08)",
                    border: "1px solid rgba(15, 45, 28, 0.15)",
                  }}
                  title={b.name}
                >
                  <span aria-hidden="true">{b.emoji}</span>
                  <span>{b.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* "Scan to Explore" QR placeholder */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div
              className="w-14 h-14 rounded-sm grid grid-cols-5 grid-rows-5 gap-0 p-1"
              style={{
                background: "#fff",
                border: "1px solid rgba(15,45,28,0.2)",
              }}
              aria-hidden="true"
            >
              {/* Pseudo-QR grid — deterministic, decorative only */}
              {Array.from({ length: 25 }).map((_, i) => {
                const seed = dispensary.id.charCodeAt(i % dispensary.id.length) + i;
                const filled = seed % 3 === 0;
                return (
                  <div
                    key={i}
                    style={{
                      background: filled ? "#0f2d1c" : "transparent",
                    }}
                  />
                );
              })}
            </div>
            <p className="text-[8px] font-bold uppercase tracking-widest text-forest-deep/80">
              Scan to<br />Explore
            </p>
          </div>
        </div>

        {/* Page counter — bottom corner */}
        <div className="absolute bottom-1.5 right-4 text-[9px] font-mono text-forest-deep/40 tabular-nums">
          {index + 1} / {total}
        </div>
      </div>
    </div>
  );
}

/* Sticker placeholder / collected stamp. Same frame either way (corner
   brackets + vertical side tickets) so layout never reflows when a
   sticker is collected — only the centerpiece changes. */
function StickerSlot({
  initial,
  accent,
  collectedAt,
}: {
  initial: string;
  accent: string;
  collectedAt?: string;
}) {
  const isCollected = !!collectedAt;
  return (
    <div className="relative w-full max-w-[180px]" style={{ aspectRatio: "1" }}>
      {isCollected ? (
        <CollectedStamp initial={initial} accent={accent} collectedAt={collectedAt!} />
      ) : (
        // Dashed empty slot
        <div
          className="absolute inset-0 rounded-sm flex items-center justify-center"
          style={{
            border: "1.5px dashed rgba(15, 45, 28, 0.45)",
            background:
              "repeating-linear-gradient(45deg, rgba(15,45,28,0.02) 0 8px, transparent 8px 16px)",
          }}
        >
          <div className="text-center px-2">
            <p className="text-[10px] font-bold tracking-widest uppercase text-forest-deep/55 leading-snug">
              Place
              <br />
              Sticker
              <br />
              Here
            </p>
          </div>
        </div>
      )}

      {/* Corner brackets — always rendered to keep the stamp area framed */}
      {[
        { top: 0, left: 0, rotate: 0 },
        { top: 0, right: 0, rotate: 90 },
        { bottom: 0, right: 0, rotate: 180 },
        { bottom: 0, left: 0, rotate: 270 },
      ].map((c, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            width: 14,
            height: 14,
            borderTop: `2px solid ${isCollected ? accent : "rgba(15, 45, 28, 0.55)"}`,
            borderLeft: `2px solid ${isCollected ? accent : "rgba(15, 45, 28, 0.55)"}`,
            transform: `rotate(${c.rotate}deg)`,
          }}
          aria-hidden="true"
        />
      ))}

      {/* Vertical side tickets */}
      {(["left", "right"] as const).map((side) => (
        <span
          key={side}
          className="absolute top-1/2 text-[7px] font-bold tracking-[0.25em] uppercase whitespace-nowrap"
          style={{
            [side]: -14,
            transform: `translateY(-50%) rotate(${side === "left" ? -90 : 90}deg)`,
            transformOrigin: "center",
            color: isCollected ? `${accent}cc` : "rgba(15, 45, 28, 0.45)",
          }}
        >
          CRAVE Vermont 2026
        </span>
      ))}
    </div>
  );
}

/* Saturated collected stamp — circular amber/region-colored badge with
   the shop's initial centered, a date band at the bottom, and a 6° tilt
   for character. Replaces the dashed empty slot without changing frame
   size so the page layout stays stable. */
function CollectedStamp({
  initial,
  accent,
  collectedAt,
}: {
  initial: string;
  accent: string;
  collectedAt: string;
}) {
  const date = new Date(collectedAt);
  const monthYear = date
    .toLocaleString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <div
      className="absolute inset-2 flex items-center justify-center"
      style={{ transform: "rotate(-6deg)" }}
      aria-label={`Collected ${monthYear}`}
    >
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accent}, ${accent}cc 60%, ${accent}99)`,
          border: `3px solid ${accent}`,
          boxShadow: `0 4px 12px rgba(0,0,0,0.25), inset 0 0 0 6px rgba(255,255,255,0.18), inset 0 -4px 12px rgba(0,0,0,0.15)`,
        }}
      >
        {/* Inner ring of dashes for a postage-stamp feel */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 14,
            border: "1.5px dashed rgba(255,255,255,0.5)",
          }}
          aria-hidden="true"
        />

        {/* Initial */}
        <span
          className="font-groovy leading-none"
          style={{
            fontSize: "3.5rem",
            color: "#fff",
            textShadow: "0 2px 4px rgba(0,0,0,0.25)",
          }}
        >
          {initial}
        </span>

        {/* Date band across the bottom */}
        <div
          className="absolute left-2 right-2 bottom-3 text-center"
          style={{
            background: "rgba(15,45,28,0.85)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 3,
            padding: "2px 4px",
          }}
        >
          <p className="text-[7px] tracking-[0.2em] font-bold text-white/90">
            COLLECTED
          </p>
          <p className="text-[9px] tracking-[0.15em] font-bold text-white tabular-nums leading-none">
            {monthYear}
          </p>
        </div>
      </div>
    </div>
  );
}
