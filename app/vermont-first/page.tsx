import Link from "next/link";

const growers = [
  // Capital Cannabis Partners
  { name: "MR.Z Craft Cannabis", town: "Middlebury", website: "https://www.mrzcraft.com/" },
  { name: "Off Piste Farm", town: "Sutton", website: "https://offpistefarm.com/" },
  { name: "Family Tree Cannabis Co.", town: "Sheldon Springs", website: "https://familytreecannabisco.com/" },
  { name: "High Altitude Cannabis", town: "Hardwick", website: "https://www.highaltcanna.com/" },
  { name: "Sunset Lake Cannabis", town: "South Hero", website: "https://www.sunsetlakecannabis.com/" },
  { name: "Forbins Finest", town: "Barre", website: "https://forbinsfinest.com/" },
  { name: "Lukas Greene", town: "Charlotte", website: "https://lukasgreene.farm/" },
  { name: "Pinnacle Valley Farms", town: "Randolph", website: "https://pinnaclevalleyfarms.com/" },
  { name: "Old Growth Vermont", town: "Danville", website: "https://www.ogvermont.com/" },
  { name: "Doughboi Farms", town: "Montpelier", website: "https://doughboifarms.com/" },
  { name: "The CLEAN Cannabis Company", town: "Hardwick", website: "https://www.cleancannabis-vt.com/" },
  // Vermont Growers Association Members
  { name: "Fine Bud Farms", town: "Randolph", website: "https://www.instagram.com/finebudfarms" },
  { name: "Garcia Grows", town: "Northeast Kingdom", website: "https://garciagrows.com/" },
  { name: "Grass Queen", town: "Plainfield", website: "https://grassqueenvt.com/" },
  { name: "Highly Rooted", town: "Vermont", website: "https://highly-rooted.com/" },
  { name: "Winooski Organics", town: "Winooski", website: "https://www.winooskiorganics.com/" },
  { name: "Florist VT", town: "Vermont", website: "https://floristvt.com/" },
  { name: "Full Circle Farm", town: "Vermont", website: "https://fullcirclefarmvt.com/" },
  { name: "Pine Grove Organics", town: "Brandon", website: "https://www.pinegroveorganics.org/" },
  { name: "Lovespun Homestead", town: "Vermont", website: "https://www.lovespunhomestead.com/" },
  { name: "Lake Effect Vermont", town: "South Hero", website: "https://lakeeffectvt.com/" },
  { name: "Life Arises Farm", town: "Wolcott", website: "http://lifearisesfarm.com/" },
  { name: "Hidden Leaf Homestead", town: "Vermont", website: "https://hiddenleafhomestead.com/" },
  { name: "Soiled Roots Farm Family", town: "Vermont", website: "https://soiledrootsfarm.com/" },
  // Additional cultivators
  { name: "Farmhouse Cannabis", town: "Addison County", website: "https://www.farmhousecannabisvt.com/" },
  { name: "Rebel Grown", town: "Northeast Kingdom", website: "https://www.rebelgrown.com/" },
  { name: "Zenbarn Farms", town: "Waterbury Center", website: "https://zenbarnmj.com/" },
  { name: "Vermont Select", town: "Vermont", website: "https://www.vermontselect.com/" },
  { name: "Satori Vermont", town: "Middlebury", website: "https://satorivt.com/" },
  { name: "High Pines Cultivation", town: "Vermont", website: "https://www.highpinescultivation.com/" },
];

export default function VermontFirstPage() {
  return (
    <main className="min-h-screen bg-forest text-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-3">
            Vermont · Est. 2024
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
          {/* Table header — # narrow, Grower fills space, Town right-aligned */}
          <div
            className="grid gap-x-3 px-4 py-3 border-b border-forest-mid bg-forest-mid/30"
            style={{ gridTemplateColumns: "2rem 1fr auto" }}
          >
            <span className="text-amber/70 text-xs tracking-widest uppercase font-bold">#</span>
            <span className="text-amber/70 text-xs tracking-widest uppercase font-bold">Grower</span>
            <span className="text-amber/70 text-xs tracking-widest uppercase font-bold text-right">Town</span>
          </div>

          {/* Rows */}
          {growers.map((g, i) => (
            <div
              key={g.name}
              className={`grid gap-x-3 px-4 py-3.5 border-b border-forest-mid/50 hover:bg-forest-mid/20 transition-colors items-center ${
                i === growers.length - 1 ? "border-b-0" : ""
              }`}
              style={{ gridTemplateColumns: "2rem 1fr auto" }}
            >
              {/* Index */}
              <span className="text-cream-muted/40 text-xs tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>

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
    </main>
  );
}
