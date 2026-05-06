import StrainClient from "@/components/StrainClient";
import { getLiveProducts } from "@/lib/inventory-public";
import { dispensaries } from "@/lib/dispensaries";
import { getSession } from "@/lib/auth";

export default async function StrainPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const [liveProducts, params, session] = await Promise.all([
    getLiveProducts(),
    searchParams,
    getSession(),
  ]);

  // Build a lean shop-name → {lat, lng} lookup for client-side distance sort
  const shopLocations: Record<string, { lat: number; lng: number }> = {};
  for (const d of dispensaries) {
    shopLocations[d.name] = { lat: d.lat, lng: d.lng };
  }

  return (
    <main className="min-h-screen strain-texture-bg text-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-groovy text-cream mb-3 tracking-wide leading-tight">
            Strain Library
          </h1>
          <p className="text-cream-muted text-sm sm:text-base font-medium max-w-xl leading-relaxed">
            A live feed of every product currently in stock at connected Vermont dispensaries — synced from their menus throughout the day.
          </p>
        </div>
        <StrainClient
          liveProducts={liveProducts}
          initialType={params.type}
          shopLocations={shopLocations}
          isAuthenticated={session !== null}
        />
      </div>
    </main>
  );
}
