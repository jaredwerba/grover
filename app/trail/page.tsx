import { dispensaries } from "@/lib/dispensaries";
import TrailClient from "@/components/TrailClient";
import { getInventorySnapshot } from "@/lib/inventory-public";

export default async function TrailPage() {
  const { metas } = await getInventorySnapshot();
  return (
    <main className="bg-forest-deep text-cream flex flex-col min-h-screen">
      {/* Header — compact */}
      <div className="px-4 sm:px-6 pt-5 pb-3 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide leading-tight mb-1">
          The Cannatrail
        </h1>
        <p className="text-cream-muted text-xs max-w-xl leading-relaxed">
          Vermont&apos;s licensed cannabis dispensaries — tap a pin or swipe the cards.
        </p>
      </div>

      {/* Map + card row — fixed viewport height */}
      <div
        className="px-4 sm:px-6 flex flex-col shrink-0"
        style={{ height: "calc(100svh - 120px)" }}
      >
        <TrailClient dispensaries={dispensaries} inventoryMetas={metas} />
      </div>

      {/* About section — scrolls below the map */}
      <section className="px-4 sm:px-6 py-16 max-w-3xl mx-auto w-full">
        <div className="border-t border-forest-mid/50 pt-12">
          <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-4">
            About the Cannatrail
          </p>
          <h2 className="text-3xl sm:text-4xl font-groovy text-cream tracking-wide leading-tight mb-6">
            Grown here. For you.
          </h2>
          <div className="space-y-4 text-cream-muted text-sm sm:text-base leading-relaxed">
            <p>
              Vermont has always done things its own way — and cannabis is no different. From the Northeast Kingdom to the Champlain Valley, Green Mountain cultivators are growing some of the most thoughtful, craft cannabis in the country. Medical or recreational, flower or concentrate, there&apos;s a Vermont grower behind every product on this trail.
            </p>
            <p>
              The Cannatrail was built to help you navigate Vermont&apos;s cannabis scene with confidence. Whether you&apos;re a lifelong Vermonter or just passing through on the way to the mountain, we want to connect you with the dispensaries and growers who call this state home.
            </p>
            <p>
              Our honest advice? <span className="text-cream font-semibold">Shop around.</span> Every dispensary on the trail has its own personality, its own staff, and its own rotating selection of locally-grown products. The best way to find your favorite is to explore — and Vermont is a pretty great place to do that.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            {["Vermont Native", "Locally Grown", "Medical & Recreational", "Community First", "Green Mountain Proud"].map((tag) => (
              <span
                key={tag}
                className="text-xs border border-amber/30 text-amber/70 px-3 py-1.5 rounded-sm font-semibold tracking-wider uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
