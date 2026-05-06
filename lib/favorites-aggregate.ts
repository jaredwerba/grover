import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const AGG_KEY = "agg:favorites:global";
const AGG_TTL = 60 * 60 * 24 * 90; // 90 days

/**
 * Increment the global favorite count for a product.
 * Called fire-and-forget from addFavorite().
 */
export async function incrementFavorite(productId: string): Promise<void> {
  await kv.hincrby(AGG_KEY, productId, 1);
  await kv.expire(AGG_KEY, AGG_TTL);
}

/**
 * Decrement the global favorite count for a product.
 * Called fire-and-forget from removeFavorite().
 */
export async function decrementFavorite(productId: string): Promise<void> {
  await kv.hincrby(AGG_KEY, productId, -1);
}

/**
 * Get the global favorites aggregate — { productId: count } for all products.
 * Returns empty object if no data.
 */
export async function getGlobalFavorites(): Promise<Record<string, number>> {
  try {
    const data = await kv.hgetall<Record<string, number>>(AGG_KEY);
    return data ?? {};
  } catch {
    return {};
  }
}

/**
 * Get the top N most-favorited products globally.
 */
export async function getTopFavorited(
  limit = 20
): Promise<{ id: string; count: number }[]> {
  const all = await getGlobalFavorites();
  return Object.entries(all)
    .map(([id, count]) => ({ id, count: Number(count) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
