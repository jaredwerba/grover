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

/**
 * One row in the Strain Library's "Live in Vermont" section.
 * Aggregates every dispensary SKU that resolves to the same display
 * name into a single card so the user sees one entry per strain
 * across multiple brands and shops.
 */
export interface LiveProduct {
  /** Stable slug used for keys. */
  key: string;
  /** Cleaned strain-ish name shown in the card title. */
  displayName: string;
  /** Coarse product type (flower/preroll/vape/edible/...). */
  type: string;
  /** Distinct brands carrying it. */
  brands: string[];
  /** Distinct shop display names that have it in stock. */
  shops: string[];
  /** Min observed THC% (null when no flower/vape provided one). */
  thcMin: number | null;
  thcMax: number | null;
  /** Min/max observed dollar price (entry size). */
  priceMin: number | null;
  priceMax: number | null;
  /** Total SKUs this card represents. */
  skuCount: number;
}

/** Product types that make sense as "strains" in the Strain Library. */
const STRAIN_LIKE_TYPES = new Set([
  "flower",
  "preroll",
  "vape",
  "concentrate",
  "edible",
  "drink",
  "tincture",
]);

/** Patterns indicating a product is paraphernalia/accessory, not a strain. */
const ACCESSORY_NAME_RE = /\b(bong|pipe|spoon|grinder|lighter|paper|cone|tip|rolling|stash\s*jar|ash\s*tray|nail|banger|dab|rig|torch|battery|charger|pen\s*battery|box|case|bag|tray|filter|t-shirt|tshirt|hat|sticker|merch)\b/i;

/** Patterns indicating the cleaned name is just a quantity/size, not a strain. */
const JUNK_NAME_RE = /^\s*\d+(?:\.\d+)?\s*(?:ct|g|gr|gram|grams|mg|oz|ounce|ml|pc|pcs|pack|pk)?\s*$/i;

/** Strip brand prefix + size/unit suffix to get a clean strain-ish name. */
function cleanDisplayName(raw: string): string {
  let s = raw;
  // First " | " or " - " separator splits brand from rest. Take the
  // remainder and strip any trailing size/format segments.
  const sep = / +[|–—]+ +| +- +/;
  const parts = s.split(sep);
  if (parts.length >= 2) s = parts.slice(1).join(" - ");
  // Drop obvious size/format suffixes
  s = s.replace(
    /\s*\(\d+\s*ct\)?\s*$|\s*-\s*\d+(?:\.\d+)?\s*(?:g|gr|gram|grams|mg|oz|ounce|ml|pc|pcs|pack|pk)\s*$|\s*\d+(?:\.\d+)?\s*(?:g|gr|gram|grams|mg|oz|ounce|ml|pc|pcs|pack|pk)\s*$/i,
    ""
  );
  // Drop trailing generic words like "Pre-Roll", "Flower", "Vape Cart"
  s = s.replace(/\s*-?\s*(pre[- ]?roll|flower|vape\s*cart(ridge)?|cartridge|tincture|topical|oral\s*spray|edible|gummies?|chocolate|chew|drink)s?\s*$/i, "");
  return s.replace(/\s+/g, " ").trim();
}

/**
 * True if the product looks like paraphernalia (bong, papers, etc.)
 * even if its raw name slipped past the platform-level type tag. Some
 * dispensaries label glassware as "edible" or "other" by mistake.
 */
function isAccessoryByName(name: string): boolean {
  return ACCESSORY_NAME_RE.test(name);
}

function dollarRound(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * Aggregate every shop's inventory into one deduplicated list keyed
 * by cleaned display name + product type. Used by the Strain Library
 * to show "Live in Vermont" — every strain currently for sale at a
 * connected dispensary, with brand/shop/THC/price ranges.
 */
export async function getLiveProducts(): Promise<LiveProduct[]> {
  try {
    const slugs = dispensaries.map((d) => d.id);
    const all = await Promise.all(
      slugs.map((s) => getInventory(s).then((items) => ({ slug: s, items })))
    );

    type AggKey = string;
    interface Agg {
      displayName: string;
      type: string;
      brands: Set<string>;
      shops: Set<string>;
      thcMin: number | null;
      thcMax: number | null;
      priceMin: number | null;
      priceMax: number | null;
      skuCount: number;
    }
    const map = new Map<AggKey, Agg>();

    for (const { slug, items } of all) {
      if (!items || items.length === 0) continue;
      const shop = dispensaries.find((d) => d.id === slug);
      if (!shop) continue;
      for (const it of items) {
        if (!STRAIN_LIKE_TYPES.has(it.type)) continue;
        // Belt-and-suspenders: drop paraphernalia by name even if a
        // platform mis-classified it (some shops tag bongs as "edible").
        if (isAccessoryByName(it.name)) continue;
        const display = cleanDisplayName(it.name);
        if (!display || display.length < 3) continue; // need ≥3 chars
        if (JUNK_NAME_RE.test(display)) continue; // pure size like "30ct"
        // Need at least 2 alpha chars to count as a real name
        const alpha = (display.match(/[a-z]/gi) || []).length;
        if (alpha < 2) continue;
        const key = `${it.type}::${display.toLowerCase()}`;
        let agg = map.get(key);
        if (!agg) {
          agg = {
            displayName: display,
            type: it.type,
            brands: new Set<string>(),
            shops: new Set<string>(),
            thcMin: null,
            thcMax: null,
            priceMin: null,
            priceMax: null,
            skuCount: 0,
          };
          map.set(key, agg);
        }
        if (it.brand) agg.brands.add(it.brand);
        agg.shops.add(shop.name);
        agg.skuCount++;
        if (typeof it.thc === "number" && it.thc > 0 && it.thc <= 100) {
          agg.thcMin = agg.thcMin === null ? it.thc : Math.min(agg.thcMin, it.thc);
          agg.thcMax = agg.thcMax === null ? it.thc : Math.max(agg.thcMax, it.thc);
        }
        if (typeof it.price === "number" && it.price > 0) {
          agg.priceMin = agg.priceMin === null ? it.price : Math.min(agg.priceMin, it.price);
          agg.priceMax = agg.priceMax === null ? it.price : Math.max(agg.priceMax, it.price);
        }
      }
    }

    return [...map.entries()]
      .map(([key, a]) => ({
        key,
        displayName: a.displayName,
        type: a.type,
        brands: [...a.brands].sort(),
        shops: [...a.shops].sort(),
        thcMin: a.thcMin !== null ? dollarRound(a.thcMin) : null,
        thcMax: a.thcMax !== null ? dollarRound(a.thcMax) : null,
        priceMin: a.priceMin !== null ? dollarRound(a.priceMin) : null,
        priceMax: a.priceMax !== null ? dollarRound(a.priceMax) : null,
        skuCount: a.skuCount,
      }))
      .sort((x, y) => x.displayName.localeCompare(y.displayName));
  } catch (err) {
    console.warn(
      "[inventory-public] getLiveProducts failed:",
      err instanceof Error ? err.message : err
    );
    return [];
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
