import { dispensaries } from "@/lib/dispensaries";
import TrailClient from "@/components/TrailClient";

export default function TrailPage() {
  return (
    <main className="min-h-screen bg-forest-deep text-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-groovy text-cream mb-3">
            The Cannatrail
          </h1>
          <p className="text-cream-muted text-sm sm:text-base max-w-xl leading-relaxed">
            Vermont&apos;s curated network of licensed cannabis dispensaries.
            Find quality products, knowledgeable staff, and locally-grown
            cannabis across the Green Mountain State.
          </p>
        </div>

        {/* Dispensary grid with filter */}
        <TrailClient dispensaries={dispensaries} />

        {/* Footer note */}
        <div className="mt-12 border-t border-forest-mid pt-6">
          <p className="text-cream-muted text-xs leading-relaxed max-w-xl text-center mx-auto">
            For adults 21+ only. Vermont recreational cannabis law applies.
            Hours and availability subject to change — always confirm with the
            dispensary directly.
          </p>
        </div>
      </div>
    </main>
  );
}
