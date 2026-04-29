import StrainClient from "@/components/StrainClient";
import { getLiveProducts } from "@/lib/inventory-public";

export default async function StrainPage() {
  const liveProducts = await getLiveProducts();

  return (
    <main className="min-h-screen bg-forest-deep text-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-groovy text-cream mb-3 tracking-wide leading-tight">
            Strain Library
          </h1>
          <p className="text-cream-muted text-sm sm:text-base font-medium max-w-xl leading-relaxed">
            A live feed of every product currently in stock at connected Vermont dispensaries — synced from their menus throughout the day.
          </p>
        </div>
        <StrainClient liveProducts={liveProducts} />
      </div>
    </main>
  );
}
