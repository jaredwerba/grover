import type { Connector } from "./index";
import type { NormalizedItem, ProductType, RawProduct } from "../inventory";

/**
 * Weedmaps connector. Pulls live menus from Weedmaps' public discovery
 * API (the same endpoints weedmaps.com's own consumer site calls). No
 * key, cookie, or partnership. `merchant_id` = the Weedmaps listing
 * slug (e.g. "kushies", "the-leaf-vermont").
 *
 * Strategy:
 *   GET https://api-g.weedmaps.com/discovery/v1/listings/dispensaries/{slug}/menu_items
 *       ?limit=100&page={n}
 *   → { meta: { total_menu_items, has_live_menu, updated_at },
 *       data: { menu_items: WmItem[] } }
 *   `limit` caps at 100 (≥150 → HTTP 422). Loop page = 1,2,3… until we
 *   reach meta.total_menu_items or hit an empty page. Sequential to be
 *   polite.
 *
 * IMPORTANT — User-Agent:
 *   Weedmaps fronts the site with a Fastly "Client Challenge" that
 *   triggers on *browser* User-Agents (Mozilla/…Chrome → an HTML
 *   challenge page instead of JSON). An honest, non-browser bot UA
 *   ("CoveConnect/1.0") is served clean JSON and is transparent about
 *   who we are — the opposite of the Leafly/Maui connectors, which use
 *   a browser-ish UA. robots.txt on api-g.weedmaps.com is Allow: /.
 *
 * Product type note:
 *   `edge_category.ancestors[0].name` is the real product type
 *   ("Flower", "Edible", …). `category.name` is the strain lineage
 *   ("Indica"/"Sativa") — do NOT use it for type.
 */

const WM_BASE = "https://api-g.weedmaps.com";
const PAGE_SIZE = 100; // server-capped (≥150 → 422)
const MAX_PAGES = 20; // safety cap = up to 2000 items per shop

const FETCH_HEADERS: HeadersInit = {
  // Honest, identifying, non-browser UA — see header note above.
  "user-agent": "CoveConnect/1.0 (+https://covebud.com)",
  accept: "application/json",
};

interface WmPrice {
  price?: number | null;
  original_price?: number | null;
  on_sale?: boolean | null;
  unit?: string | null;
  quantity?: string | null;
  label?: string | null;
}

interface WmCategoryNode {
  name?: string | null;
  ancestors?: Array<{ name?: string | null }> | null;
}

interface WmTag {
  name?: string | null;
  source?: { domain?: string | null; slug?: string | null } | null;
}

interface WmItem {
  id: number;
  name: string;
  slug?: string | null;
  category?: { name?: string | null } | null;
  edge_category?: WmCategoryNode | null;
  price?: WmPrice | null;
  prices?: Record<string, WmPrice> | null;
  metrics?: {
    aggregates?: {
      thc?: number | null;
      thc_unit?: string | null;
      cbd?: number | null;
      cbd_unit?: string | null;
    } | null;
  } | null;
  brand_endorsement?: { brand_name?: string | null } | null;
  tags?: WmTag[] | null;
  is_online_orderable?: boolean | null;
}

interface WmMenuResponse {
  meta?: {
    total_menu_items?: number;
    has_live_menu?: boolean;
    updated_at?: string;
  };
  data?: { menu_items?: WmItem[] };
}

async function fetchPage(slug: string, page: number): Promise<WmMenuResponse> {
  const url = `${WM_BASE}/discovery/v1/listings/dispensaries/${encodeURIComponent(
    slug
  )}/menu_items?limit=${PAGE_SIZE}&page=${page}`;
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} fetching ${url} — ${(await res.text()).slice(0, 200)}`
    );
  }
  const text = await res.text();
  // Guard against the Fastly challenge slipping through as an HTML body
  // with a 200 — a browser UA regression would surface here loudly.
  try {
    return JSON.parse(text) as WmMenuResponse;
  } catch {
    throw new Error(
      `Weedmaps: non-JSON response for ${slug} (likely a bot challenge) — ${text.slice(
        0,
        120
      )}`
    );
  }
}

/** Real product type from edge_category ancestor, with name fallback. */
function deriveType(item: WmItem): ProductType {
  const anc = item.edge_category?.ancestors?.[0]?.name;
  const edge = item.edge_category?.name;
  const c = `${anc ?? ""} ${edge ?? ""}`.toLowerCase();
  if (c.includes("vape") || c.includes("cartridge")) return "vape";
  if (c.includes("preroll") || c.includes("pre-roll")) return "preroll";
  if (c.includes("flower")) return "flower";
  if (c.includes("edible")) return "edible";
  if (c.includes("drink") || c.includes("beverage")) return "drink";
  if (c.includes("concentrate") || c.includes("extract") || c.includes("dab"))
    return "concentrate";
  if (c.includes("tincture")) return "tincture";
  if (c.includes("topical")) return "topical";
  if (c.includes("gear") || c.includes("accessor") || c.includes("apparel"))
    return "accessory";

  // Fall back to product-name patterns.
  const n = (item.name || "").toLowerCase();
  if (/\bpre-?roll\b/.test(n)) return "preroll";
  if (/\b(vape|cart|cartridge)\b/.test(n)) return "vape";
  if (/\b(gumm(y|ies)|chocolate|edible|brownie|cookie|chew|candy)\b/.test(n))
    return "edible";
  if (/\b(tincture|oral)\b/.test(n)) return "tincture";
  if (/\b(rosin|shatter|hash|kief|wax|live\s*resin|badder|budder)\b/.test(n))
    return "concentrate";
  if (/\b(drink|seltzer|tea|soda|beverage)\b/.test(n)) return "drink";
  if (/\b(flower|bud|buds|nug)\b/.test(n)) return "flower";
  if (
    /\b(paper|cone|tip|grinder|pipe|spoon|lighter|ash\s*tray|glass|bong|rolling|filter|stash|jar|battery)\b/.test(
      n
    )
  )
    return "accessory";
  return "other";
}

/** Only keep numeric % potencies — mg totals would render as a lie. */
function pickPercent(
  value: number | null | undefined,
  unit: string | null | undefined
): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
    return null;
  const u = (unit || "").toLowerCase().trim();
  if (u === "%" || u === "percent") return value;
  return null;
}

/** Cheapest available price across the base price + any multi-weight map. */
function pickPrice(item: WmItem): number | null {
  const candidates: Array<number | null | undefined> = [];
  if (item.price?.price != null) candidates.push(item.price.price);
  if (item.prices) {
    for (const p of Object.values(item.prices)) {
      if (p?.price != null) candidates.push(p.price);
    }
  }
  const nums = candidates.filter(
    (v): v is number => typeof v === "number" && v > 0
  );
  return nums.length ? Math.min(...nums) : null;
}

function pickSize(item: WmItem): string | null {
  const p = item.price;
  if (p?.label) return p.label;
  if (p?.quantity && p?.unit) return `${p.quantity} ${p.unit}`;
  return null;
}

export const weedmapsConnector: Connector = {
  platform: "weedmaps",

  async fetchMenu(merchantId: string): Promise<RawProduct[]> {
    const slug = merchantId.trim();
    const all: WmItem[] = [];
    let total = 0;
    let live = false;

    for (let page = 1; page <= MAX_PAGES; page++) {
      const resp = await fetchPage(slug, page);
      if (page === 1) {
        total = resp.meta?.total_menu_items ?? 0;
        live = !!resp.meta?.has_live_menu;
      }
      const batch = resp.data?.menu_items ?? [];
      if (batch.length === 0) break;
      all.push(...batch);
      if (total > 0 && all.length >= total) break;
    }

    // A shop with a Weedmaps *profile* but no synced menu returns
    // has_live_menu:false / total 0. Surface that as an error rather
    // than a silent "ok / 0 items" (the failure mode that hid the Maui
    // breakage). The discovery listing's menu_items_count is unreliable
    // for exactly this reason, so we trust the menu endpoint's meta.
    if (all.length === 0) {
      throw new Error(
        `Weedmaps: no live menu for "${slug}" (has_live_menu=${live}, total=${total})`
      );
    }

    const overflow = total > all.length ? total - all.length : 0;
    Object.defineProperty(all, "__total_advertised", {
      value: total || all.length,
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

    for (const p of raw as unknown as WmItem[]) {
      if (!p || typeof p.id !== "number" || !p.name) continue;
      const key = String(p.id);
      if (seen.has(key)) continue;
      seen.add(key);

      const agg = p.metrics?.aggregates;

      out.push({
        id: `${shopSlug}:${p.id}`,
        shop_slug: shopSlug,
        name: p.name,
        type: deriveType(p),
        strain_id: null, // resolved by lib/strain-match.ts in the orchestrator
        brand: p.brand_endorsement?.brand_name ?? null,
        size: pickSize(p),
        thc: pickPercent(agg?.thc, agg?.thc_unit),
        cbd: pickPercent(agg?.cbd, agg?.cbd_unit),
        price: pickPrice(p),
        in_stock: p.is_online_orderable !== false,
        last_seen: now,
      });
    }

    return out;
  },
};
