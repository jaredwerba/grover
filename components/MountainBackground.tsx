export default function MountainBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed bottom-0 left-0 right-0 pointer-events-none"
      style={{ height: "45vh", zIndex: -1 }}
    >
      <svg
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Far peaks — lightest layer */}
        <path
          d="M0,180 L120,140 L240,120 L380,50 L520,18 L610,70 L700,42 L800,80 L920,55 L1040,38 L1160,72 L1280,100 L1440,130 L1440,400 L0,400 Z"
          fill="#1a4a2e"
          fillOpacity="0.45"
        />
        {/* Mid range */}
        <path
          d="M0,225 L100,185 L220,205 L360,148 L480,115 L590,158 L720,128 L850,162 L970,140 L1080,115 L1200,148 L1340,172 L1440,188 L1440,400 L0,400 Z"
          fill="#1a4a2e"
          fillOpacity="0.72"
        />
        {/* Near foothills — matches background, no opacity */}
        <path
          d="M0,305 L130,268 L290,290 L450,258 L610,278 L770,252 L930,272 L1080,258 L1240,278 L1390,268 L1440,272 L1440,400 L0,400 Z"
          fill="#0d2b1a"
        />
      </svg>
    </div>
  );
}
