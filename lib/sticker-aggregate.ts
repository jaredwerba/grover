import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const AGG_KEY = "agg:stickers:global";
const AGG_TTL = 60 * 60 * 24 * 365; // 365 days — stickers are long-lived collectibles

/**
 * Increment the global sticker count for a dispensary.
 * Called fire-and-forget from addSticker().
 */
export async function incrementSticker(shopId: string): Promise<void> {
  await kv.hincrby(AGG_KEY, shopId, 1);
  await kv.expire(AGG_KEY, AGG_TTL);
}

/**
 * Get the global stickers aggregate — { shopId: count } for all shops.
 * Returns empty object if no data. Used for future dispenser analytics.
 */
export async function getGlobalStickers(): Promise<Record<string, number>> {
  try {
    const data = await kv.hgetall<Record<string, number>>(AGG_KEY);
    return data ?? {};
  } catch {
    return {};
  }
}

/**
 * Get the top N most-collected shops globally.
 */
export async function getTopCollectedShops(
  limit = 20
): Promise<{ id: string; count: number }[]> {
  const all = await getGlobalStickers();
  return Object.entries(all)
    .map(([id, count]) => ({ id, count: Number(count) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
