"use client";

import type { Dispensary, Region } from "@/lib/dispensaries";

/**
 * A single COVE Trail Passport "page" — visually styled after the printed
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

/** Stable 6-digit "passport number" per shop id — purely decorative. */
function passportNumberFor(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
  }
  return String(h % 1000000).padStart(6, "0");
}

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
    : { color: "#FFB900", label: "COVE Trail Trail" };
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

      {/* Stitched binding strip — runs vertically just inside the left
          border, with small "perforation" circles every ~32px. Suggests
          the gutter of a sewn passport. */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 14,
          top: 36,
          bottom: 36,
          width: 8,
          borderLeft: `1px dashed ${accent.color}66`,
        }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${(i + 0.5) * (100 / 6)}%`,
              left: -3,
              width: 5,
              height: 5,
              background: `${accent.color}33`,
              border: `1px solid ${accent.color}55`,
              transform: "translateY(-50%)",
            }}
          />
        ))}
      </div>

      {/* Background watermark seal — a faded, large cannabis leaf sitting
          behind the main content. Reads as an official passport seal,
          but quiet enough not to fight the stamp foreground. */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden="true"
        style={{ opacity: 0.06 }}
      >
        <CannabisLeaf
          className="w-2/3 h-2/3"
          style={{ color: "#0f2d1c" }}
        />
      </div>

      {/* Passport-number ribbon — small label upper-right above the
          trail tag area. Deterministic per-shop so it's stable across
          loads but unique per page. */}
      <div
        className="absolute pointer-events-none flex flex-col items-end"
        style={{ top: 38, right: 18 }}
        aria-hidden="true"
      >
        <span className="text-[8px] tracking-[0.25em] uppercase font-bold text-forest-deep/40">
          Passport No.
        </span>
        <span className="text-[10px] tabular-nums font-mono text-forest-deep/55">
          VT-{passportNumberFor(dispensary.id)}
        </span>
      </div>

      {/* Dispensary header */}
      <div className="relative px-6 pt-2 pb-3 text-center shrink-0">
        <DispensaryLogo
          name={dispensary.name}
          logoUrl={dispensary.logoUrl}
          website={dispensary.website}
          accent={accent.color}
        />
        <h2
          className="font-groovy text-xl sm:text-2xl leading-tight tracking-wide mb-1 mt-2"
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
        <DispensaryLink
          website={dispensary.website}
          shopId={dispensary.id}
          accent={accent.color}
        />
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

      {/* Brands row */}
      <div className="relative px-5 pb-4 shrink-0">
        <div className="min-w-0">
          <p
            className="text-[10px] font-bold leading-tight mb-2"
            style={{ color: "#0f2d1c" }}
          >
            Participating COVE Trail Brands
          </p>
          <div className="flex flex-wrap gap-1.5 pr-12">
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

        {/* Page counter — bottom corner. pr-12 above keeps brand chips
            from running into this. */}
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
        <CollectedStamp collectedAt={collectedAt!} />
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
            borderTop: `2px solid ${isCollected ? "#8a5a08" : "rgba(15, 45, 28, 0.55)"}`,
            borderLeft: `2px solid ${isCollected ? "#8a5a08" : "rgba(15, 45, 28, 0.55)"}`,
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
            color: isCollected ? "rgba(138, 90, 8, 0.85)" : "rgba(15, 45, 28, 0.45)",
          }}
        >
          COVE Trail Vermont 2026
        </span>
      ))}
    </div>
  );
}

/* Gold cannabis-leaf stamp — a vintage foil-impressed seal that lands
   on the sticker slot once a sticker is collected. Replaces the dashed
   empty slot without changing frame size so the page layout stays
   stable. The leaf is a 7-leaflet fan rendered in gold gradient. */
function CollectedStamp({ collectedAt }: { collectedAt: string }) {
  const date = new Date(collectedAt);
  const monthYear = date
    .toLocaleString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <div
      className="absolute inset-2 flex items-center justify-center"
      style={{ transform: "rotate(-8deg)" }}
      aria-label={`Collected ${monthYear}`}
    >
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle at 30% 28%, #fff7d6 0%, #f5c542 35%, #c98a18 70%, #8a5a08 100%)",
          border: "3px solid #6b3f04",
          boxShadow:
            "0 6px 14px rgba(0,0,0,0.35), inset 0 0 0 6px rgba(255,255,255,0.18), inset 0 -6px 12px rgba(75,40,0,0.35), inset 0 4px 6px rgba(255,255,255,0.4)",
        }}
      >
        {/* Inner postage-stamp dashed ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: 12,
            border: "1.5px dashed rgba(75, 40, 0, 0.45)",
          }}
          aria-hidden="true"
        />

        {/* Cannabis leaf — embossed gold-foil look */}
        <CannabisLeaf
          className="w-3/5 h-3/5"
          style={{
            color: "#6b3f04",
            filter:
              "drop-shadow(0 1px 0 rgba(255,255,255,0.6)) drop-shadow(0 -1px 0 rgba(75,40,0,0.5))",
          }}
        />

        {/* Date band across the bottom */}
        <div
          className="absolute left-2 right-2 bottom-3 text-center"
          style={{
            background: "rgba(75, 40, 0, 0.9)",
            border: "1px solid rgba(255,235,180,0.4)",
            borderRadius: 3,
            padding: "2px 4px",
          }}
        >
          <p className="text-[7px] tracking-[0.25em] font-bold text-amber-50/95">
            COLLECTED
          </p>
          <p className="text-[9px] tracking-[0.15em] font-bold text-amber-50 tabular-nums leading-none">
            {monthYear}
          </p>
        </div>
      </div>
    </div>
  );
}

/* Stylized cannabis fan leaf — 7 pointed leaflets radiating from a
   short stem. Pure SVG (no external asset), color via currentColor so
   the parent's color-or-filter governs the foil look. */
function CannabisLeaf({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const leaflets = [
    { angle: -75, len: 28, half: 6 },
    { angle: -50, len: 36, half: 7 },
    { angle: -25, len: 44, half: 8 },
    { angle: 0, len: 48, half: 9 },
    { angle: 25, len: 44, half: 8 },
    { angle: 50, len: 36, half: 7 },
    { angle: 75, len: 28, half: 6 },
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden="true"
    >
      <g transform="translate(50 64)">
        {leaflets.map(({ angle, len, half }, i) => (
          <g key={i} transform={`rotate(${angle})`}>
            <path
              d={`M0 0 L-${half} -${len * 0.32} L0 -${len} L${half} -${len * 0.32} Z`}
            />
          </g>
        ))}
        {/* Stem */}
        <rect x="-1.2" y="0" width="2.4" height="10" rx="1" />
      </g>
    </svg>
  );
}

/* Dispensary logo — small circular badge above the name. Priority:
   1) explicit `logoUrl` (future: hand-curated transparent PNG)
   2) Google's S2 favicon proxy when a `website` is set
   3) styled initial badge as the always-available fallback
*/
function DispensaryLogo({
  name,
  logoUrl,
  website,
  accent,
}: {
  name: string;
  logoUrl?: string;
  website?: string;
  accent: string;
}) {
  const faviconUrl = (() => {
    if (logoUrl) return logoUrl;
    if (!website) return null;
    try {
      const host = new URL(website).hostname;
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
        host
      )}&sz=128`;
    } catch {
      return null;
    }
  })();

  const size = 72;
  const imgSize = 52;

  return (
    <div
      className="mx-auto rounded-full flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "#fff",
        border: `3px solid ${accent}`,
        boxShadow: `0 3px 10px rgba(0,0,0,0.18), inset 0 0 0 2px ${accent}1a`,
      }}
      aria-hidden="true"
    >
      {faviconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={faviconUrl}
          alt=""
          width={imgSize}
          height={imgSize}
          className="object-contain"
          style={{ width: imgSize, height: imgSize }}
        />
      ) : (
        <span
          className="font-groovy leading-none"
          style={{
            fontSize: 34,
            color: accent,
            transform: "translateY(1px)",
          }}
        >
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}

/* External "Visit Website" link, or in-app "View on Map" fallback when
   we don't have an external URL for the shop. */
function DispensaryLink({
  website,
  shopId,
  accent,
}: {
  website?: string;
  shopId: string;
  accent: string;
}) {
  const href = website || `/trail?shop=${shopId}`;
  const label = website ? "Visit Website" : "View on Map";
  const external = !!website;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full"
      style={{
        background: `${accent}1a`,
        color: accent,
        border: `1px solid ${accent}55`,
      }}
    >
      {label} {external ? "↗" : "→"}
    </a>
  );
}
