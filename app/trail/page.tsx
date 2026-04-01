import { dispensaries } from "@/lib/dispensaries";
import TrailClient from "@/components/TrailClient";
import Link from "next/link";

export default function TrailPage() {
  return (
    <main className="min-h-screen bg-forest-deep text-cream">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="text-cream-muted text-sm hover:text-cream transition-colors mb-6 inline-block"
          >
            ← Cove
          </Link>
          <h1 className="text-4xl font-black text-cream tracking-tight mb-2">
            The Cannatrail
          </h1>
          <p className="text-cream-muted text-base max-w-xl leading-relaxed">
            Vermont&apos;s curated network of licensed cannabis dispensaries.
            Find quality products, knowledgeable staff, and locally-grown
            cannabis across the Green Mountain State.
          </p>
        </div>

        {/* Dispensary grid with filter */}
        <TrailClient dispensaries={dispensaries} />

        {/* Footer note */}
        <div className="mt-16 border-t border-forest-mid pt-8">
          <p className="text-cream-muted text-xs leading-relaxed max-w-xl">
            For adults 21+ only. Vermont recreational cannabis law applies.
            Hours and availability subject to change — always confirm with the
            dispensary directly.
          </p>
        </div>
      </div>
    </main>
  );
}
