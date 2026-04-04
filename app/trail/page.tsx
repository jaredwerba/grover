import { dispensaries } from "@/lib/dispensaries";
import TrailClient from "@/components/TrailClient";

export default function TrailPage() {
  return (
    <main
      className="bg-forest-deep text-cream flex flex-col"
      style={{ height: "calc(100svh - 56px)" }}
    >
      {/* Header — compact, no vertical padding waste */}
      <div className="px-4 sm:px-6 pt-5 pb-3 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide leading-tight mb-1">
          The Cannatrail
        </h1>
        <p className="text-cream-muted text-xs max-w-xl leading-relaxed">
          Vermont&apos;s licensed cannabis dispensaries — tap a pin or swipe the cards.
        </p>
      </div>

      {/* TrailClient fills remaining height */}
      <div className="flex-1 min-h-0 px-4 sm:px-6 pb-4 flex flex-col">
        <TrailClient dispensaries={dispensaries} />
      </div>
    </main>
  );
}
