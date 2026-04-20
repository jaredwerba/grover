import Link from "next/link";
import { growers } from "@/lib/growers";


export default function VermontFirstPage() {
  const shuffled = [...growers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return (
    <main className="min-h-screen bg-forest text-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-3">
            Vermont
          </p>
          <h1 className="text-4xl md:text-5xl font-groovy text-cream mb-3 tracking-wide leading-tight">
            Vermont-First
          </h1>
          <div className="flex items-center gap-3 mb-5 max-w-xs">
            <div className="flex-1 h-px bg-amber/30" />
            <span className="text-amber/50 text-xs">✦</span>
            <div className="flex-1 h-px bg-amber/30" />
          </div>
          <p className="text-cream-muted text-sm sm:text-base max-w-xl leading-relaxed">
            Vermont&apos;s licensed cannabis cultivators — grown right here in the Green Mountain State.
            Support local farmers and discover what Vermont soil produces.
          </p>
        </div>

        {/* Growers table */}
        <div
          className="border-2 border-forest-mid rounded-sm overflow-hidden"
          style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)" }}
        >
          {/* Table header — Grower fills space, Town right-aligned */}
          <div
            className="grid gap-x-3 px-4 py-3 border-b border-forest-mid bg-forest-mid/30"
            style={{ gridTemplateColumns: "1fr auto" }}
          >
            <span className="text-amber/70 text-xs tracking-widest uppercase font-bold">Grower</span>
            <span className="text-amber/70 text-xs tracking-widest uppercase font-bold text-right">Town</span>
          </div>

          {/* Rows */}
          {shuffled.map((g, i) => (
            <div
              key={g.name}
              className={`grid gap-x-3 px-4 py-3.5 border-b border-forest-mid/50 hover:bg-forest-mid/20 transition-colors items-center ${
                i === shuffled.length - 1 ? "border-b-0" : ""
              }`}
              style={{ gridTemplateColumns: "1fr auto" }}
            >
              {/* Name — truncate prevents overflow on any screen */}
              <a
                href={g.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber hover:text-amber-hover transition-colors text-sm font-semibold truncate"
              >
                {g.name} ↗
              </a>

              {/* Town — nowrap so it stays one line, right-aligned */}
              <span className="text-cream-muted text-xs whitespace-nowrap text-right">
                {g.town}
              </span>
            </div>
          ))}
        </div>

        <p className="text-cream-muted/50 text-xs tracking-wide text-center mt-4">
          {growers.length} cultivators · Vermont Cannabis Control Board & Vermont Growers Association
        </p>

        {/* Footer note */}
        <div className="mt-12 border-t border-forest-mid pt-6 text-center">
          <p className="text-cream-muted text-xs leading-relaxed max-w-xl mx-auto">
            For adults 21+ only. Vermont recreational cannabis law applies.
            Listings are informational — always verify directly with the cultivator.
          </p>
        </div>

      </div>

      {/* Mountain — static, anchored to bottom of page */}
      <div aria-hidden="true" className="w-full pointer-events-none mt-8" style={{ height: "30vw", maxHeight: "260px", minHeight: "120px" }}>
        <svg
          viewBox="0 0 1440 480"
          preserveAspectRatio="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vfHorizonGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a4a2e" stopOpacity="0" />
              <stop offset="100%" stopColor="#1a4a2e" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect x="0" y="200" width="1440" height="80" fill="url(#vfHorizonGlow)" />
          <path
            d="M0,240 L100,190 L220,210 L360,120 L480,80 L560,130 L660,90 L760,110 L880,60 L980,95 L1080,65 L1180,100 L1300,130 L1440,160 L1440,480 L0,480 Z"
            fill="#1a4a2e"
            fillOpacity="0.55"
          />
          <path
            d="M0,290 L120,245 L260,268 L400,200 L520,168 L630,210 L750,182 L880,215 L1000,188 L1110,165 L1230,200 L1360,228 L1440,245 L1440,480 L0,480 Z"
            fill="#1a4a2e"
            fillOpacity="0.78"
          />
          <path
            d="M0,360 L140,318 L300,342 L460,308 L620,330 L780,305 L940,325 L1100,312 L1260,332 L1400,320 L1440,325 L1440,480 L0,480 Z"
            fill="#0f2d1c"
          />
        </svg>
      </div>
    </main>
  );
}
