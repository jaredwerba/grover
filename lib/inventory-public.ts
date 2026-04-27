import "server-only";
import { dispensaries } from "./dispensaries";
import { getAllInventoryMetas, getInventory } from "./inventory-store";
import type { NormalizedItem, ShopInventoryMeta } from "./inventory";

/**
 * Cove Connect — server-side helpers for the consumer-facing pages.
 *
 * These run in Server Components only (`server-only` import) so the
 * Redis client is never bundled to the browser.
 *
 * Two top-level reads:
 *   - getInventorySnapshot(): per-shop metas for Cannatrail badges
 *   - getStrainAvailability(): which shops carry which canonical strain
 */

export interface InventorySnapshot {
  /** Map of shop slug → meta. Missing shops mean never synced. */
  metas: Record<string, ShopInventoryMeta | null>;
}

export async function getInventorySnapshot(): Promise<InventorySnapshot> {
  try {
    const slugs = dispensaries.map((d) => d.id);
    const metas = await getAllInventoryMetas(slugs);
    return { metas };
  } catch (err) {
    // Graceful degradation: if KV is unreachable, return empty so the
    // page renders unchanged from pre-Cove-Connect behavior.
    console.warn(
      "[inventory-public] getInventorySnapshot failed:",
      err instanceof Error ? err.message : err
    );
    return { metas: {} };
  }
}

export interface StrainAvailability {
  /** Map of canonical strain ID → array of shop slugs that carry it. */
  byStrain: Record<string, string[]>;
}

export async function getStrainAvailability(): Promise<StrainAvailability> {
  try {
    const slugs = dispensaries.map((d) => d.id);
    // Fetch all per-shop inventories in parallel. We only care about
    // strain_id ↦ shop linkage so we can drop everything else.
    const all = await Promise.all(
      slugs.map((s) => getInventory(s).then((items) => ({ slug: s, items })))
    );
    const byStrain: Record<string, string[]> = {};
    for (const { slug, items } of all) {
      if (!items) continue;
      const seen = new Set<string>();
      for (const item of items) {
        if (!item.strain_id || seen.has(item.strain_id)) continue;
        seen.add(item.strain_id);
        if (!byStrain[item.strain_id]) byStrain[item.strain_id] = [];
        byStrain[item.strain_id].push(slug);
      }
    }
    return { byStrain };
  } catch (err) {
    console.warn(
      "[inventory-public] getStrainAvailability failed:",
      err instanceof Error ? err.message : err
    );
    return { byStrain: {} };
  }
}

/**
 * Build a compact text snapshot of live inventory for embedding in
 * the Cove AI system prompt. Capped to keep token usage bounded —
 * currently ~150 chars per shop max.
 */
export async function getLiveInventoryForPrompt(): Promise<string> {
  try {
    const slugs = dispensaries.map((d) => d.id);
    const all = await Promise.all(
      slugs.map((s) => getInventory(s).then((items) => ({ slug: s, items })))
    );
    const lines: string[] = [];
    for (const { slug, items } of all) {
      if (!items || items.length === 0) continue;
      const shop = dispensaries.find((d) => d.id === slug);
      if (!shop) continue;
      const matched = items.filter((i) => i.strain_id);
      if (matched.length === 0) continue;
      // List up to 8 strains, deduped, with the cheapest entry-size price.
      const byStrain = new Map<string, NormalizedItem>();
      for (const it of matched) {
        if (!it.strain_id) continue;
        const cur = byStrain.get(it.strain_id);
        if (!cur || (it.price ?? Infinity) < (cur.price ?? Infinity)) {
          byStrain.set(it.strain_id, it);
        }
      }
      const top = [...byStrain.values()].slice(0, 8);
      const parts = top.map((it) => {
        const price = it.price !== null ? `$${it.price}` : "";
        const thc = it.thc !== null ? ` ${it.thc}%` : "";
        return `${it.strain_id}${thc} ${price}`.trim();
      });
      lines.push(`${shop.name} (${shop.city}): ${parts.join(", ")}`);
    }
    if (lines.length === 0) return "";
    return `--- LIVE INVENTORY (synced from dispensary menus) ---\n${lines.join(
      "\n"
    )}`;
  } catch (err) {
    console.warn(
      "[inventory-public] getLiveInventoryForPrompt failed:",
      err instanceof Error ? err.message : err
    );
    return "";
  }
}

/** Pretty "synced Xh ago" / "synced just now" style helper. */
export function formatSyncedAgo(meta: ShopInventoryMeta | null): string | null {
  if (!meta || meta.status !== "ok") return null;
  const last = new Date(meta.last_synced).getTime();
  if (Number.isNaN(last)) return null;
  const ageMs = Date.now() - last;
  const ageMin = Math.floor(ageMs / 60000);
  if (ageMin < 1) return "just now";
  if (ageMin < 60) return `${ageMin}m ago`;
  const ageHours = Math.floor(ageMin / 60);
  if (ageHours < 24) return `${ageHours}h ago`;
  const ageDays = Math.floor(ageHours / 24);
  return `${ageDays}d ago`;
}
