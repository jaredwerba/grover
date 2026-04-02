export default function MountainFooter() {
  return (
    <footer className="relative overflow-hidden" style={{ flex: "0 0 240px" }}>
      {/* Smooth rolling hill panorama */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Distant rolling hills — smooth curves */}
        <path
          d="M0,160 C180,130 360,110 540,125 C720,140 900,105 1080,118 C1260,130 1380,138 1440,140 L1440,240 L0,240 Z"
          fill="#3a7a50"
          fillOpacity="0.45"
        />
        {/* Mid hills */}
        <path
          d="M0,178 C120,158 300,145 480,160 C660,175 840,148 1020,162 C1200,175 1350,170 1440,168 L1440,240 L0,240 Z"
          fill="#2a6040"
          fillOpacity="0.8"
        />
        {/* Closer rolling ridge */}
        <path
          d="M0,196 C150,180 350,172 560,185 C770,198 980,175 1200,188 C1320,194 1400,192 1440,190 L1440,240 L0,240 Z"
          fill="#1e5030"
        />
        {/* Foreground gentle swell */}
        <path
          d="M0,215 C200,202 450,196 720,208 C990,220 1240,205 1440,210 L1440,240 L0,240 Z"
          fill="#163d25"
        />
      </svg>

      {/* Legal text — pinned to bottom of footer */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-3 gap-1.5 z-10">
        <span className="text-amber/60 text-xs">✦</span>
        <p className="text-cream text-xs tracking-widest uppercase">
          Cove · Adults 21+ Only · Vermont State Law Applies
        </p>
      </div>
    </footer>
  );
}
