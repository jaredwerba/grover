import type { Connector } from "./index";
import type { NormalizedItem, ProductType, RawProduct } from "../inventory";

/**
 * Leafly connector. Pulls live menus from Leafly's public consumer
 * API. Anchor target: Higher Elevation (slug "higher-elevation-vt"),
 * 684 products as of writing.
 *
 * Strategy:
 *   GET https://consumer-api.leafly.com/api/dispensaries/v1/{slug}/menu_items
 *     ?take=50&skip={n}
 *
 *   `take` is capped at 50 server-side (≥51 → HTTP 400). We loop
 *   skip = 0, 50, 100, ... until either the page is empty or we've
 *   reached metadata.totalCount. Sequential to be polite — total of
 *   ~14 requests for a 684-product shop = ~3 seconds end-to-end.
 *
 * Response shape:
 *   { data: LeaflyItem[], metadata: { totalCount: number, ... } }
 *
 * Unlike Tymber, Leafly's response paginates fully — there's no
 * "missing 192 items" gap. __unfetched_overflow will normally be 0.
 */

const LEAFLY_BASE = "https://consumer-api.leafly.com";
const PAGE_SIZE = 50; // server-capped
const MAX_PAGES = 20; // safety cap (= up to 1000 items per shop)

const FETCH_HEADERS: HeadersInit = {
  "user-agent":
    "Cove Connect (covebud.com; +https://covebud.com/operators/policy)",
  accept: "application/json",
  origin: "https://web-embedded-menu.leafly.com",
};

interface LeaflyItem {
  id: number;
  name: string;
  brandName?: string | null;
  brand?: { id: number; name: string; slug: string } | null;
  productCategory?: string | null;
  strainName?: string | null;
  strainType?: string | null; // "indica" | "sativa" | "hybrid" | null
  description?: string | null;
  thcContent?: number | null;
  thcContentLabel?: string | null;
  thcUnit?: string | null;
  cbdContent?: number | null;
  cbdContentLabel?: string | null;
  cbdUnit?: string | null;
  price?: number | null;
  pricePerUnit?: number | null;
  sortPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  displayQuantity?: string | null;
  normalizedQuantity?: number | null;
  normalizedQuantityLabel?: string | null;
  stockQuantity?: number | null;
  pickupEnabled?: boolean | null;
  onlineFulfillmentEnabled?: boolean | null;
  medical?: boolean | null;
  imageUrl?: string | null;
  formattedThumbnailUrl?: string | null;
}

interface LeaflyMenuResponse {
  data: LeaflyItem[];
  metadata?: { totalCount?: number };
}

async function fetchPage(
  slug: string,
  skip: number
): Promise<LeaflyMenuResponse> {
  const url = `${LEAFLY_BASE}/api/dispensaries/v1/${encodeURIComponent(
    slug
  )}/menu_items?take=${PAGE_SIZE}&skip=${skip}`;
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} fetching ${url} — ${(await res.text()).slice(0, 200)}`
    );
  }
  return (await res.json()) as LeaflyMenuResponse;
}

/** Map Leafly's productCategory string to Cove's coarse ProductType. */
function deriveType(category: string | null | undefined, name: string): ProductType {
  const c = (category || "").toLowerCase();
  if (c.includes("vape")) return "vape";
  if (c.includes("preroll") || c.includes("pre-roll")) return "preroll";
  if (c.includes("flower")) return "flower";
  if (c.includes("edible") || c.includes("eat")) return "edible";
  if (c.includes("drink") || c.includes("beverage")) return "drink";
  if (c.includes("concentrate") || c.includes("extract")) return "concentrate";
  if (c.includes("tincture") || c.includes("oral")) return "tincture";
  if (c.includes("topical")) return "topical";
  if (c.includes("accessor") || c.includes("apparel") || c.includes("merch")) {
    return "accessory";
  }
  // Leafly buckets a lot into "Other" — paraphernalia, papers, glass,
  // grinders, lighters, etc. Use product-name patterns to recover.
  const n = name.toLowerCase();
  if (/\bpre-?roll\b/.test(n)) return "preroll";
  if (/\b(vape|cart|cartridge)\b/.test(n)) return "vape";
  if (/\b(gumm(y|ies)|chocolate|edible|brownie|cookie|mint|chew|candy)\b/.test(n)) return "edible";
  if (/\b(tincture|oral)\b/.test(n)) return "tincture";
  if (/\b(rosin|shatter|hash|kief|wax|live\s*resin)\b/.test(n)) return "concentrate";
  if (/\b(drink|seltzer|tea|soda|beverage)\b/.test(n)) return "drink";
  if (/\b(flower|bud|buds|nug)\b/.test(n)) return "flower";
  if (/\b(paper|cone|tip|grinder|pipe|spoon|lighter|ash\s*tray|glass|bong|rolling|filter|stash|jar)\b/.test(n)) {
    return "accessory";
  }
  return "other";
}

/**
 * Convert Leafly's content+unit pair into the percentage Cove stores
 * in NormalizedItem. We only keep numeric % values (flower / vape).
 * Edibles/drinks ship as mg totals — those would render as "100%" if
 * stored as-is, which is misleading. Return null for non-% units so
 * the consumer card simply omits THC% rather than lying.
 */
function pickPercent(value: number | null | undefined, unit: string | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (!unit) return null;
  const u = unit.toLowerCase().trim();
  if (u === "%" || u === "percent") return value;
  // mg, mg/ml, mg/g, etc. — not a percentage.
  return null;
}

function pickPrice(p: LeaflyItem): number | null {
  const candidates = [p.sortPrice, p.price, p.pricePerUnit];
  for (const v of candidates) {
    if (typeof v === "number" && v > 0) return v;
  }
  return null;
}

function pickSize(p: LeaflyItem): string | null {
  return (
    p.displayQuantity ??
    p.normalizedQuantityLabel ??
    (p.quantity && p.unit ? `${p.quantity} ${p.unit}` : null)
  );
}

export const leaflyConnector: Connector = {
  platform: "leafly",

  async fetchMenu(merchantId: string): Promise<RawProduct[]> {
    const slug = merchantId.trim();
    const all: LeaflyItem[] = [];
    let totalCount = 0;
    let pages = 0;

    for (let skip = 0; pages < MAX_PAGES; skip += PAGE_SIZE) {
      const page = await fetchPage(slug, skip);
      pages++;
      const batch = page.data ?? [];
      if (page.metadata?.totalCount && totalCount === 0) {
        totalCount = page.metadata.totalCount;
      }
      if (batch.length === 0) break;
      all.push(...batch);
      if (totalCount > 0 && skip + batch.length >= totalCount) break;
    }

    const fetched = all.length;
    const overflow = totalCount > fetched ? totalCount - fetched : 0;

    Object.defineProperty(all, "__total_advertised", {
      value: totalCount || fetched,
      enumerable: false,
    });
    Object.defineProperty(all, "__unfetched_overflow", {
      value: overflow,
      enumerable: false,
    });

    return all as unknown as RawProduct[];
  },

  normalize(raw: RawProduct[], shopSlug: string): NormalizedItem[] {
    const now = new Date().toISOString();
    const out: NormalizedItem[] = [];
    const seen = new Set<string>();

    for (const p of raw as unknown as LeaflyItem[]) {
      if (!p || typeof p.id !== "number") continue;

      // Filter: medical-only items on a recreational shop are confusing
      // for our consumer surface. Cove dispensaries currently flag
      // their own rec/medical mix in `tags`; we'd need to thread that
      // through here. For MVP, just keep everything — most VT shops
      // are recreational-default and Leafly tags duals separately.
      // Skip out-of-stock items so the consumer never sees them.
      if (typeof p.stockQuantity === "number" && p.stockQuantity <= 0) continue;

      const key = String(p.id);
      if (seen.has(key)) continue;
      seen.add(key);

      const type = deriveType(p.productCategory, p.name || "");

      out.push({
        id: `${shopSlug}:${p.id}`,
        shop_slug: shopSlug,
        name: p.name,
        type,
        strain_id: null, // resolved by lib/strain-match.ts in the sync orchestrator
        brand: p.brandName ?? p.brand?.name ?? null,
        size: pickSize(p),
        thc: pickPercent(p.thcContent, p.thcUnit),
        cbd: pickPercent(p.cbdContent, p.cbdUnit),
        price: pickPrice(p),
        in_stock: !!p.pickupEnabled || (p.stockQuantity ?? 0) > 0,
        last_seen: now,
      });
    }

    return out;
  },
};
