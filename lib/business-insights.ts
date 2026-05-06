import { dispensaries } from "./dispensaries";
import { getInventory, getInventoryMeta } from "./inventory-store";
import { getGlobalFavorites, getTopFavorited } from "./favorites-aggregate";
import type { NormalizedItem, ShopInventoryMeta } from "./inventory";

/* ── Types ── */

export interface ShopInsights {
  shop: {
    name: string;
    id: string;
    lastSync: string | null;
    productCount: number;
    platform: string | null;
  };
  productPerformance: {
    name: string;
    type: string;
    price: number | null;
    favorites: number;
  }[];
  marketGaps: {
    name: string;
    type: string;
    favoritedCount: number;
    availableAt: string[];
  }[];
  priceComparison: {
    name: string;
    yourPrice: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    shopsCompared: number;
  }[];
  demandSignals: {
    type: string;
    count: number;
    topProducts: string[];
  }[];
  syncHealth: {
    lastSync: string | null;
    itemCount: number;
    status: string;
    platform: string | null;
  };
}

/* ── Haversine ── */

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Main Insights Builder ── */

export async function buildShopInsights(
  shopId: string
): Promise<ShopInsights | null> {
  const shop = dispensaries.find((d) => d.id === shopId);
  if (!shop) return null;

  // Fetch this shop's inventory + meta
  const [inventory, meta, globalFavs] = await Promise.all([
    getInventory(shopId),
    getInventoryMeta(shopId),
    getGlobalFavorites(),
  ]);

  const items = inventory ?? [];
  const itemNames = new Set(items.map((i) => i.name.toLowerCase()));

  // ── Product Performance ──
  // Which of this shop's products are getting favorited?
  const productPerformance = items
    .map((item) => ({
      name: item.name,
      type: item.type,
      price: item.price,
      favorites: Number(globalFavs[item.id] ?? 0),
    }))
    .sort((a, b) => b.favorites - a.favorites)
    .slice(0, 10);

  // ── Market Gaps ──
  // Find popular products on Cove that this shop doesn't carry
  // Get nearby shops (within 30 miles)
  const nearbyShops = dispensaries.filter(
    (d) =>
      d.id !== shopId &&
      d.platform &&
      haversineDistance(shop.lat, shop.lng, d.lat, d.lng) <= 30
  );

  // Fetch inventory for nearby shops
  const nearbyInventories = await Promise.all(
    nearbyShops.slice(0, 8).map(async (ns) => ({
      shop: ns,
      items: (await getInventory(ns.id)) ?? [],
    }))
  );

  // Find products that are favorited and available nearby but NOT at this shop
  const gapMap = new Map<
    string,
    { name: string; type: string; favCount: number; shops: string[] }
  >();

  for (const { shop: nearShop, items: nearItems } of nearbyInventories) {
    for (const item of nearItems) {
      const favCount = Number(globalFavs[item.id] ?? 0);
      if (favCount <= 0) continue;
      if (itemNames.has(item.name.toLowerCase())) continue; // We already carry it

      const key = item.name.toLowerCase();
      const existing = gapMap.get(key);
      if (existing) {
        existing.favCount = Math.max(existing.favCount, favCount);
        if (!existing.shops.includes(nearShop.name)) {
          existing.shops.push(nearShop.name);
        }
      } else {
        gapMap.set(key, {
          name: item.name,
          type: item.type,
          favCount,
          shops: [nearShop.name],
        });
      }
    }
  }

  const marketGaps = [...gapMap.values()]
    .sort((a, b) => b.favCount - a.favCount)
    .slice(0, 8)
    .map((g) => ({
      name: g.name,
      type: g.type,
      favoritedCount: g.favCount,
      availableAt: g.shops.slice(0, 3),
    }));

  // ── Price Comparison ──
  // For this shop's products, compare prices to same product at other shops
  const priceComparison: ShopInsights["priceComparison"] = [];

  for (const item of items.slice(0, 20)) {
    if (item.price === null) continue;

    const otherPrices: number[] = [];
    for (const { items: nearItems } of nearbyInventories) {
      const match = nearItems.find(
        (ni) =>
          ni.name.toLowerCase() === item.name.toLowerCase() &&
          ni.price !== null
      );
      if (match && match.price !== null) {
        otherPrices.push(match.price);
      }
    }

    if (otherPrices.length === 0) continue;

    priceComparison.push({
      name: item.name,
      yourPrice: item.price,
      avgPrice: Math.round(
        (otherPrices.reduce((s, p) => s + p, 0) / otherPrices.length) * 100
      ) / 100,
      minPrice: Math.min(...otherPrices),
      maxPrice: Math.max(...otherPrices),
      shopsCompared: otherPrices.length,
    });
  }

  // ── Demand Signals ──
  // What types are trending based on global favorites?
  const topFavs = await getTopFavorited(50);
  const typeCounts = new Map<string, { count: number; products: string[] }>();

  for (const { id, count } of topFavs) {
    // Find this product in any inventory to get its type
    let foundType: string | null = null;
    let foundName: string | null = null;

    for (const { items: nearItems } of nearbyInventories) {
      const match = nearItems.find((ni) => ni.id === id);
      if (match) {
        foundType = match.type;
        foundName = match.name;
        break;
      }
    }
    // Also check own inventory
    if (!foundType) {
      const own = items.find((i) => i.id === id);
      if (own) {
        foundType = own.type;
        foundName = own.name;
      }
    }

    if (foundType && foundName) {
      const existing = typeCounts.get(foundType);
      if (existing) {
        existing.count += count;
        if (existing.products.length < 3) existing.products.push(foundName);
      } else {
        typeCounts.set(foundType, { count, products: [foundName] });
      }
    }
  }

  const demandSignals = [...typeCounts.entries()]
    .map(([type, data]) => ({
      type,
      count: data.count,
      topProducts: data.products,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ── Sync Health ──
  const syncHealth = {
    lastSync: meta?.last_synced ?? null,
    itemCount: meta?.item_count ?? items.length,
    status: meta?.status ?? "unknown",
    platform: shop.platform ?? null,
  };

  return {
    shop: {
      name: shop.name,
      id: shop.id,
      lastSync: meta?.last_synced ?? null,
      productCount: items.length,
      platform: shop.platform ?? null,
    },
    productPerformance,
    marketGaps,
    priceComparison,
    demandSignals,
    syncHealth,
  };
}
