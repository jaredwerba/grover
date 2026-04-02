export default function MountainFooter() {
  return (
    <footer className="relative overflow-hidden" style={{ flex: "0 0 240px" }}>
      {/* Mountain panorama SVG */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Distant range — lightest, furthest peaks */}
        <path
          d="M0,145 L60,122 L140,136 L230,98 L310,72 L390,102 L470,62 L550,82 L640,48 L720,66 L800,52 L880,78 L960,58 L1040,88 L1130,68 L1220,95 L1320,114 L1440,122 L1440,240 L0,240 Z"
          fill="#3a7a50"
          fillOpacity="0.55"
        />
        {/* Mid range */}
        <path
          d="M0,165 L80,148 L180,158 L290,126 L390,104 L460,120 L530,95 L610,112 L700,85 L780,102 L870,88 L960,114 L1060,98 L1160,118 L1270,135 L1380,148 L1440,154 L1440,240 L0,240 Z"
          fill="#2a6040"
          fillOpacity="0.85"
        />
        {/* Closer ridgeline */}
        <path
          d="M0,185 L100,172 L220,180 L360,164 L500,175 L640,160 L780,172 L920,162 L1060,174 L1200,168 L1320,178 L1440,172 L1440,240 L0,240 Z"
          fill="#1e5030"
        />
        {/* Foreground silhouette */}
        <path
          d="M0,205 L120,194 L280,202 L440,190 L600,200 L760,188 L920,198 L1080,190 L1240,202 L1440,194 L1440,240 L0,240 Z"
          fill="#163d25"
        />
      </svg>

      {/* Legal text — fixed at bottom, high legibility */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-3 gap-1.5">
        <span className="text-amber/60 text-xs">✦</span>
        <p className="text-cream text-xs tracking-widest uppercase">
          Cove · Adults 21+ Only · Vermont State Law Applies
        </p>
      </div>
    </footer>
  );
}
