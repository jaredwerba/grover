import { strains } from "@/lib/strains";
import StrainClient from "@/components/StrainClient";
import { dispensaries } from "@/lib/dispensaries";
import { getStrainAvailability } from "@/lib/inventory-public";

export default async function StrainPage() {
  const { byStrain } = await getStrainAvailability();
  // Map slug arrays to display-name arrays for the client.
  const availability: Record<string, string[]> = {};
  for (const [strainId, slugs] of Object.entries(byStrain)) {
    availability[strainId] = slugs
      .map((s) => dispensaries.find((d) => d.id === s)?.name)
      .filter((n): n is string => Boolean(n));
  }

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
        <StrainClient strains={strains} availability={availability} />
      </div>
    </main>
  );
}
