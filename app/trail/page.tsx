import type { Metadata } from "next";
import Link from "next/link";
import { dispensaries } from "@/lib/dispensaries";
import { growers } from "@/lib/growers";
import TrailClient from "@/components/TrailClient";
import { getInventorySnapshot } from "@/lib/inventory-public";

export const metadata: Metadata = {
  title: "COVE Trail — Vermont Dispensary Map | Cove",
  description:
    "Find every licensed Vermont cannabis dispensary on an interactive map — locations, hours, menus, and live in-stock badges, plus the state's craft growers.",
  openGraph: {
    title: "COVE Trail — Vermont Dispensary Map",
    description:
      "Every licensed Vermont cannabis dispensary on an interactive map — locations, hours, menus, and live in-stock badges.",
    url: "https://covebud.com/trail",
    siteName: "Cove",
    type: "website",
  },
  alternates: { canonical: "https://covebud.com/trail" },
};

export default async function TrailPage() {
  const { metas } = await getInventorySnapshot();

  // Shuffle growers so no one is always first
  const shuffled = [...growers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return (
    <main className="bg-forest-deep text-cream flex flex-col min-h-screen">
      {/* Header — compact */}
      <div className="px-4 sm:px-6 pt-5 pb-3 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide leading-tight mb-1">
          COVE Trail
        </h1>
        <p className="text-cream-muted text-xs max-w-xl leading-relaxed">
          Vermont&apos;s licensed cannabis dispensaries — tap a pin or swipe the cards.
        </p>
      </div>

      {/* Map + card row */}
      <div className="px-4 sm:px-6 flex flex-col shrink-0 w-full max-w-2xl mx-auto">
        <TrailClient dispensaries={dispensaries} inventoryMetas={metas} />
      </div>

      {/* About section — scrolls below the map */}
      <section className="px-4 sm:px-6 py-16 max-w-3xl mx-auto w-full">
        <div className="border-t border-forest-mid/50 pt-12">
          <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-4">
            About COVE Trail
          </p>
          <h2 className="text-3xl sm:text-4xl font-groovy text-cream tracking-wide leading-tight mb-6">
            Grown here. For you.
          </h2>
          <div className="space-y-4 text-cream-muted text-sm sm:text-base leading-relaxed">
            <p>
              Vermont has always done things its own way — and cannabis is no different. From the Northeast Kingdom to the Champlain Valley, Green Mountain cultivators are growing some of the most thoughtful, craft cannabis in the country. Medical or recreational, flower or concentrate, there&apos;s a Vermont grower behind every product on this trail.
            </p>
            <p>
              COVE Trail was built to help you navigate Vermont&apos;s cannabis scene with confidence. Whether you&apos;re a lifelong Vermonter or just passing through on the way to the mountain, we want to connect you with the dispensaries and growers who call this state home.
            </p>
            <p>
              Our honest advice? <span className="text-cream font-semibold">Shop around.</span> Every dispensary on the trail has its own personality, its own staff, and its own rotating selection of locally-grown products. The best way to find your favorite is to explore — and Vermont is a pretty great place to do that.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            {([
              { label: "Vermont Native", href: "/about#what-is-cove" },
              { label: "Locally Grown", href: "/about#best-afternoon-strain" },
              { label: "Medical & Recreational", href: "/about#first-time-vermont" },
              { label: "Community First", href: "/about#cannabis-safely-first-time" },
              { label: "Green Mountain Proud", href: "/about#cannabis-legal-tourists-vermont" },
            ]).map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs border border-amber/30 text-amber/70 px-3 py-1.5 rounded-sm font-semibold tracking-wider uppercase hover:border-amber/60 hover:text-amber transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Craft Growers */}
      <section className="px-4 sm:px-6 pb-16 max-w-3xl mx-auto w-full">
        <div className="border-t border-forest-mid/50 pt-12">
          <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-4">
            Vermont
          </p>
          <h2 className="text-3xl sm:text-4xl font-groovy text-cream tracking-wide leading-tight mb-3">
            Craft Growers
          </h2>
          <p className="text-cream-muted text-sm sm:text-base max-w-xl leading-relaxed mb-8">
            Vermont&apos;s licensed cannabis cultivators — grown right here in the Green Mountain State.
            Support local farmers and discover what Vermont soil produces.
          </p>

          {/* Growers table */}
          <div
            className="border-2 border-forest-mid rounded-sm overflow-hidden"
            style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)" }}
          >
            <div
              className="grid gap-x-3 px-4 py-3 border-b border-forest-mid bg-forest-mid/30"
              style={{ gridTemplateColumns: "1fr auto" }}
            >
              <span className="text-amber/70 text-xs tracking-widest uppercase font-bold">Grower</span>
              <span className="text-amber/70 text-xs tracking-widest uppercase font-bold text-right">Town</span>
            </div>

            {shuffled.map((g, i) => (
              <div
                key={g.name}
                className={`grid gap-x-3 px-4 py-3.5 border-b border-forest-mid/50 hover:bg-forest-mid/20 transition-colors items-center ${
                  i === shuffled.length - 1 ? "border-b-0" : ""
                }`}
                style={{ gridTemplateColumns: "1fr auto" }}
              >
                <a
                  href={g.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber hover:text-amber-hover transition-colors text-sm font-semibold truncate"
                >
                  {g.name} ↗
                </a>
                <span className="text-cream-muted text-xs whitespace-nowrap text-right">
                  {g.town}
                </span>
              </div>
            ))}
          </div>

          <p className="text-cream-muted/50 text-xs tracking-wide text-center mt-4">
            {growers.length} cultivators · Vermont Cannabis Control Board & Vermont Growers Association
          </p>

          <div className="mt-12 border-t border-forest-mid pt-6 text-center">
            <p className="text-cream-muted text-xs leading-relaxed max-w-xl mx-auto">
              For adults 21+ only. Vermont recreational cannabis law applies.
              Listings are informational — always verify directly with the cultivator.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
