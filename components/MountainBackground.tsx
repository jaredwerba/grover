export default function MountainBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed bottom-0 left-0 right-0 pointer-events-none"
      style={{ height: "55vh", zIndex: -1 }}
    >
      <svg
        viewBox="0 0 1440 480"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Sky glow at horizon */}
        <defs>
          <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a4a2e" stopOpacity="0" />
            <stop offset="100%" stopColor="#1a4a2e" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect x="0" y="200" width="1440" height="80" fill="url(#horizonGlow)" />

        {/* Far peaks — Mt. Mansfield, Camel's Hump, Killington */}
        <path
          d="M0,240 L100,190 L220,210 L360,120 L480,80 L560,130 L660,90 L760,110 L880,60 L980,95 L1080,65 L1180,100 L1300,130 L1440,160 L1440,480 L0,480 Z"
          fill="#1a4a2e"
          fillOpacity="0.55"
        />
        {/* Mid range */}
        <path
          d="M0,290 L120,245 L260,268 L400,200 L520,168 L630,210 L750,182 L880,215 L1000,188 L1110,165 L1230,200 L1360,228 L1440,245 L1440,480 L0,480 Z"
          fill="#1a4a2e"
          fillOpacity="0.78"
        />
        {/* Near foothills */}
        <path
          d="M0,360 L140,318 L300,342 L460,308 L620,330 L780,305 L940,325 L1100,312 L1260,332 L1400,320 L1440,325 L1440,480 L0,480 Z"
          fill="#0f2d1c"
        />
      </svg>
    </div>
  );
}
