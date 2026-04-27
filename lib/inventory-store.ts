import { Redis } from "@upstash/redis";
import type { NormalizedItem, ShopInventoryMeta } from "./inventory";

/**
 * Cove Connect — Upstash Redis wrapper for inventory.
 *
 * Two namespaces per shop:
 *   inv:{slug}       — JSON array of NormalizedItem
 *   inv:meta:{slug}  — ShopInventoryMeta (last_synced, item_count, ...)
 *
 * Mirrors the client pattern from lib/passkey-kv.ts so we use the
 * same KV instance the auth layer is already on.
 */

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// 90-day TTL on inventory rows. If a shop's connector breaks for
// months we don't want stale stock advice forever; the meta also
// flips status: "stale" automatically (see admin UI Day 5+).
const INVENTORY_TTL_SECONDS = 60 * 60 * 24 * 90;

export async function setInventory(
  shopSlug: string,
  items: NormalizedItem[]
): Promise<void> {
  await kv.set(`inv:${shopSlug}`, items, { ex: INVENTORY_TTL_SECONDS });
}

export async function getInventory(
  shopSlug: string
): Promise<NormalizedItem[] | null> {
  return kv.get<NormalizedItem[]>(`inv:${shopSlug}`);
}

export async function setInventoryMeta(
  shopSlug: string,
  meta: ShopInventoryMeta
): Promise<void> {
  await kv.set(`inv:meta:${shopSlug}`, meta, { ex: INVENTORY_TTL_SECONDS });
}

export async function getInventoryMeta(
  shopSlug: string
): Promise<ShopInventoryMeta | null> {
  return kv.get<ShopInventoryMeta>(`inv:meta:${shopSlug}`);
}

/** Return all inventory metas in one round-trip (used by admin/status). */
export async function getAllInventoryMetas(
  shopSlugs: string[]
): Promise<Record<string, ShopInventoryMeta | null>> {
  if (shopSlugs.length === 0) return {};
  const keys = shopSlugs.map((s) => `inv:meta:${s}`);
  const values = await kv.mget<(ShopInventoryMeta | null)[]>(...keys);
  const out: Record<string, ShopInventoryMeta | null> = {};
  shopSlugs.forEach((slug, i) => {
    out[slug] = values[i];
  });
  return out;
}
