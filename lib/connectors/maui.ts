import type { Connector } from "./index";
import type { NormalizedItem, ProductType, RawProduct } from "../inventory";

/**
 * Maui connector. Powers the *.dispensary.shop subdomain pattern
 * (Devils Den, The Buddega, The Tea House, The Herbal Collective…).
 *
 * Strategy:
 *   GET https://{subdomain}.dispensary.shop/catalog/browse?medrec=rec
 *   The page is server-rendered by Remix and embeds a
 *   `window.__remixContext = {...}` blob containing a tree of route
 *   loader data. The route key
 *     "/:store?/:medrec/menu"
 *   has a `carouselsProducts` array — one entry per category carousel
 *   ("All Products", "Flower", "Vapes", …). We walk every carousel,
 *   collect all visible products, and dedupe by product_id (a single
 *   SKU shows up in multiple curated rails).
 *
 * Limitation: each carousel returns up to ~12 SSR'd products even
 * when its `total` is higher. Maui's full pagination would require
 * hitting the Remix loader directly, which is gated by 403 in their
 * config. We accept the visible subset for MVP — typical haul is
 * ~80–120 unique items per shop.
 *
 * Schema: see notes in normalize().
 */

const PAGE_PATH = "/catalog/browse?medrec=rec";

const FETCH_HEADERS: HeadersInit = {
  "user-agent":
    "Cove Connect (covebud.com; +https://covebud.com/operators/policy)",
  accept: "text/html,application/xhtml+xml",
};

interface MauiPotency {
  name: string;
  value: string;
}

interface MauiProduct {
  name?: string;
  product_name?: string;
  product_id: string;
  variant_id?: string;
  category?: string;
  brand?: string | null;
  type?: string | null;
  species?: string | null;
  weight_volume?: string | null;
  weight_volume_uom?: string | null;
  pre_tax_price?: number | null;
  post_tax_price?: number | null;
  pre_tax_discounted_price?: number | null;
  potencies?: MauiPotency[];
  quantity?: number;
  med_or_rec?: string[];
}

function deriveType(category: string | null | undefined, name: string): ProductType {
  const c = (category || "").toLowerCase();
  if (c.includes("pre-roll") || c.includes("preroll")) return "preroll";
  if (c.includes("vape") || c.includes("cartridge")) return "vape";
  if (c.includes("flower")) return "flower";
  if (c.includes("edible")) return "edible";
  if (c.includes("concentrate") || c.includes("extract")) return "concentrate";
  if (c.includes("beverage") || c.includes("drink")) return "drink";
  if (c.includes("tincture")) return "tincture";
  if (c.includes("topical")) return "topical";
  if (c.includes("accessor") || c.includes("apparel") || c.includes("cbd")) {
    return c.includes("cbd") ? "tincture" : "accessory";
  }
  if (c.includes("seed")) return "accessory";
  // Fallback to name patterns
  const n = name.toLowerCase();
  if (/\bpre-?roll\b/.test(n)) return "preroll";
  if (/\b(vape|cart|cartridge|disposable)\b/.test(n)) return "vape";
  if (/\b(gumm(y|ies)|chocolate|edible|brownie|cookie|mint|candy)\b/.test(n)) return "edible";
  if (/\b(tincture|oral)\b/.test(n)) return "tincture";
  if (/\b(rosin|shatter|hash|kief|wax|live\s*resin)\b/.test(n)) return "concentrate";
  if (/\b(seltzer|drink|tea|soda|beverage)\b/.test(n)) return "drink";
  if (/\b(flower|bud|nug)\b/.test(n)) return "flower";
  return "other";
}

/** Maui prices are in cents (e.g. 750 = $7.50). */
function pickPrice(p: MauiProduct): number | null {
  const candidates = [p.pre_tax_discounted_price, p.pre_tax_price, p.post_tax_price];
  for (const v of candidates) {
    if (typeof v === "number" && v > 0) return Math.round((v / 100) * 100) / 100;
  }
  return null;
}

function pickThcPercent(p: MauiProduct): number | null {
  if (!p.potencies || p.potencies.length === 0) return null;
  const thc = p.potencies.find((x) => /^%?\s*THC\b/i.test(x.name));
  if (!thc) return null;
  const v = parseFloat(thc.value);
  return Number.isFinite(v) ? v : null;
}

function pickCbdPercent(p: MauiProduct): number | null {
  if (!p.potencies || p.potencies.length === 0) return null;
  const cbd = p.potencies.find((x) => /^%?\s*CBD\b/i.test(x.name));
  if (!cbd) return null;
  const v = parseFloat(cbd.value);
  return Number.isFinite(v) ? v : null;
}

function pickSize(p: MauiProduct): string | null {
  if (p.weight_volume && p.weight_volume_uom) {
    return `${p.weight_volume} ${p.weight_volume_uom}`;
  }
  return p.type ?? null;
}

export const mauiConnector: Connector = {
  platform: "maui",

  async fetchMenu(merchantId: string): Promise<RawProduct[]> {
    // merchantId = the dispensary.shop subdomain (e.g. "devilsden")
    const url = `https://${merchantId}.dispensary.shop${PAGE_PATH}`;
    const res = await fetch(url, { headers: FETCH_HEADERS });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching ${url}`);
    }
    const html = await res.text();

    const m = html.match(/window\.__remixContext\s*=\s*(\{[\s\S]*?\});/);
    if (!m) {
      throw new Error("Maui: __remixContext not found in HTML");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1]);
    } catch (err) {
      throw new Error(
        `Maui: __remixContext JSON parse failed — ${
          err instanceof Error ? err.message : err
        }`
      );
    }

    const ctx = parsed as {
      state?: {
        loaderData?: Record<
          string,
          { carouselsProducts?: Array<{ products?: MauiProduct[]; total?: number }> }
        >;
      };
    };
    const loaderData = ctx.state?.loaderData ?? {};

    // The carousels live under a route key that includes ":menu" —
    // be lenient and pick whichever route key has carouselsProducts.
    let carousels: Array<{ products?: MauiProduct[]; total?: number }> = [];
    for (const route of Object.keys(loaderData)) {
      const cps = loaderData[route]?.carouselsProducts;
      if (Array.isArray(cps) && cps.length > carousels.length) {
        carousels = cps;
      }
    }

    // Dedupe by product_id across all carousels — a single SKU is
    // typically in multiple rails ("All Products" + "Pre-Rolls" + …).
    const seen = new Set<string>();
    const all: MauiProduct[] = [];
    let totalAdvertised = 0;
    for (const c of carousels) {
      if (typeof c.total === "number") totalAdvertised += c.total;
      for (const p of c.products ?? []) {
        if (!p.product_id || seen.has(p.product_id)) continue;
        seen.add(p.product_id);
        all.push(p);
      }
    }

    Object.defineProperty(all, "__total_advertised", {
      value: totalAdvertised,
      enumerable: false,
    });
    Object.defineProperty(all, "__unfetched_overflow", {
      value: Math.max(0, totalAdvertised - all.length),
      enumerable: false,
    });

    return all as unknown as RawProduct[];
  },

  normalize(raw: RawProduct[], shopSlug: string): NormalizedItem[] {
    const now = new Date().toISOString();
    const out: NormalizedItem[] = [];
    for (const p of raw as unknown as MauiProduct[]) {
      if (!p.product_id) continue;
      // Skip out-of-stock items so consumers never see them
      if (typeof p.quantity === "number" && p.quantity <= 0) continue;

      const name = p.name ?? p.product_name ?? "";
      if (!name) continue;

      const type = deriveType(p.category, name);

      out.push({
        id: `${shopSlug}:${p.product_id}`,
        shop_slug: shopSlug,
        name,
        type,
        strain_id: null, // resolved by lib/strain-match.ts in the orchestrator
        brand: p.brand ?? null,
        size: pickSize(p),
        thc: pickThcPercent(p),
        cbd: pickCbdPercent(p),
        price: pickPrice(p),
        in_stock: typeof p.quantity === "number" ? p.quantity > 0 : true,
        last_seen: now,
      });
    }
    return out;
  },
};
