import { strains } from "@/lib/strains";
import StrainClient from "@/components/StrainClient";

export default function StrainPage() {
  return (
    <main className="min-h-screen bg-forest-deep text-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-groovy text-cream mb-3 tracking-wide leading-tight">
            Strain Library
          </h1>
          <p className="text-cream-muted text-sm sm:text-base max-w-xl leading-relaxed">
            Explore Vermont&apos;s cannabis strains — effects, terpenes, flavors, and potency data for every cultivar.
          </p>
        </div>
        <StrainClient strains={strains} />
      </div>
    </main>
  );
}
