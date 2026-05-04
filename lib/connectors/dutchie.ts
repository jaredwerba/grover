import type { Connector } from "./index";
import type { NormalizedItem, ProductType, RawProduct } from "../inventory";

/**
 * Dutchie connector — Apify proxy edition.
 *
 * Dutchie's `dutchie.com` zone is gated by Cloudflare's bot management
 * (TLS+H2 fingerprinting plus a JavaScript challenge). After 10 distinct
 * server-side approaches all returned the "Just a moment…" interstitial,
 * we route Dutchie reads through the Apify SaaS scraper
 *
 *   tfmcg3/dutchie-dispensary-scraper
 *
 * which runs a real headless browser inside Apify's infra and returns
 * the menu as a JSON dataset. We call its synchronous endpoint
 *
 *   POST https://api.apify.com/v2/acts/tfmcg3~dutchie-dispensary-scraper
 *        /run-sync-get-dataset-items?token=APIFY_TOKEN
 *
 * which blocks until the run completes and streams back the resulting
 * dataset items. Cost is metered per-result by Apify (~$0.001/item at
 * current pricing); a 200-item shop costs about $0.20 per sync.
 *
 * NOTE: the input schema for this actor is not yet confirmed. The
 * `INPUT_FIELD_NAME` constant below is the single knob to flip once
 * we've validated against a live run from the Apify console. See the
 * companion plan file (eventual-giggling-quilt.md) for the diagnostic
 * steps that confirm it.
 */

// --- Apify call shape ----------------------------------------------------

const APIFY_ACTOR = "tfmcg3~dutchie-dispensary-scraper";
const APIFY_ENDPOINT = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items`;

/**
 * Field name the actor expects on its input object. We don't yet know
 * the exact name — common candidates from the Apify cannabis-scraper
 * ecosystem are `dispensaryId`, `dispensaryUrl`, or `startUrls`. Until
 * a successful run confirms the contract, this is the SINGLE knob to
 * flip. Once confirmed, also check whether the value should be the bare
 * 24-char hex ID (e.g. "62f28802b87e0f676aeaa8a6") or the full iframe
 * URL (e.g. "https://dutchie.com/embedded-menu/<id>/").
 */
const INPUT_FIELD_NAME: "dispensaryId" | "dispensaryUrl" | "startUrls" =
  "dispensaryId";

function buildInputBody(merchantId: string): Record<string, unknown> {
  switch (INPUT_FIELD_NAME) {
    case "dispensaryUrl":
      return { dispensaryUrl: `https://dutchie.com/embedded-menu/${merchantId}/` };
    case "startUrls":
      return {
        startUrls: [
          { url: `https://dutchie.com/embedded-menu/${merchantId}/` },
        ],
      };
    case "dispensaryId":
    default:
      return { dispensaryId: merchantId };
  }
}

// --- Dutchie product shape (best guess until the first run lands) --------

/**
 * Dutchie's GraphQL menu queries return products with PascalCase keys
 * (Name, Brand, Prices, THCContent.range, etc.). Apify scrapers
 * typically pass that shape through verbatim, sometimes lowercasing.
 * We accept both and pick whichever variant is present.
 */
interface DutchieProduct {
  Id?: string;
  id?: string;
  Name?: string;
  name?: string;
  Brand?: { Name?: string } | string | null;
  brand?: { name?: string } | string | null;
  Category?: string;
  category?: string;
  Subcategory?: string;
  subcategory?: string;
  StrainType?: string; // "Sativa" | "Indica" | "Hybrid"
  strainType?: string;
  THCContent?: { range?: number[]; unit?: string } | number | null;
  thcContent?: { range?: number[]; unit?: string } | number | null;
  CBDContent?: { range?: number[]; unit?: string } | number | null;
  cbdContent?: { range?: number[]; unit?: string } | number | null;
  /** Dutchie's product card price in cents OR dollars depending on the
   *  scraper. We sniff at parse time. */
  Prices?: number[];
  prices?: number[];
  Price?: number;
  price?: number;
  Options?: string[]; // ["1g", "3.5g", "7g"] for flower
  options?: string[];
  /** Stock indicator. Some scrapers project a boolean, some a number. */
  inStock?: boolean;
  InStock?: boolean;
  quantity?: number;
  Quantity?: number;
  image?: string;
  Image?: string;
}

// --- Normalization helpers ----------------------------------------------

function pickString(...vals: Array<unknown>): string | null {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function pickBrand(p: DutchieProduct): string | null {
  const b = p.Brand ?? p.brand;
  if (!b) return null;
  if (typeof b === "string") return b;
  if (typeof b === "object") {
    return pickString((b as { Name?: string }).Name, (b as { name?: string }).name);
  }
  return null;
}

function pickPotency(
  raw: DutchieProduct["THCContent"] | DutchieProduct["CBDContent"] | undefined
): number | null {
  if (raw == null) return null;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "object") {
    const range = (raw as { range?: number[] }).range;
    if (Array.isArray(range) && range.length > 0) {
      // Dutchie sometimes returns [low, high]; we surface the high end
      // since that's what consumers tend to read off the shelf label.
      const max = Math.max(...range.filter((n) => Number.isFinite(n)));
      return Number.isFinite(max) ? max : null;
    }
  }
  return null;
}

function pickPrice(p: DutchieProduct): number | null {
  const flat = p.Price ?? p.price;
  if (typeof flat === "number" && flat > 0) {
    // Dutchie's GraphQL `Price` is dollars. Apify sometimes echoes cents.
    // Heuristic: anything above $400 for a single product is almost
    // certainly cents; cap at the flower 1oz upper bound and divide.
    return flat > 400 ? flat / 100 : flat;
  }
  const arr = p.Prices ?? p.prices;
  if (Array.isArray(arr) && arr.length > 0) {
    const min = Math.min(...arr.filter((n) => Number.isFinite(n) && n > 0));
    if (!Number.isFinite(min)) return null;
    return min > 400 ? min / 100 : min;
  }
  return null;
}

function pickSize(p: DutchieProduct): string | null {
  const opts = p.Options ?? p.options;
  if (Array.isArray(opts) && opts.length > 0) return opts[0];
  return null;
}

function deriveType(category: string | null, name: string): ProductType {
  const c = (category ?? "").toLowerCase();
  if (c.includes("pre-roll") || c.includes("preroll")) return "preroll";
  if (c.includes("vape") || c.includes("cartridge")) return "vape";
  if (c.includes("flower")) return "flower";
  if (c.includes("edible")) return "edible";
  if (c.includes("concentrate") || c.includes("extract")) return "concentrate";
  if (c.includes("beverage") || c.includes("drink")) return "drink";
  if (c.includes("tincture")) return "tincture";
  if (c.includes("topical")) return "topical";
  if (c.includes("accessor") || c.includes("apparel")) return "accessory";

  const n = name.toLowerCase();
  if (/\bpre-?roll\b/.test(n)) return "preroll";
  if (/\b(vape|cart|cartridge|disposable)\b/.test(n)) return "vape";
  if (/\b(gumm(y|ies)|chocolate|edible|brownie|cookie|candy)\b/.test(n))
    return "edible";
  if (/\btincture\b/.test(n)) return "tincture";
  if (/\b(rosin|shatter|hash|kief|wax|live\s*resin)\b/.test(n))
    return "concentrate";
  if (/\b(seltzer|drink|tea|soda|beverage)\b/.test(n)) return "drink";
  if (/\b(flower|bud|nug)\b/.test(n)) return "flower";
  return "other";
}

function pickInStock(p: DutchieProduct): boolean {
  const flag = p.inStock ?? p.InStock;
  if (typeof flag === "boolean") return flag;
  const qty = p.quantity ?? p.Quantity;
  if (typeof qty === "number") return qty > 0;
  // Default to true: Dutchie scrapers typically only emit visible items.
  return true;
}

// --- Connector implementation -------------------------------------------

export const dutchieConnector: Connector = {
  platform: "dutchie",

  async fetchMenu(merchantId: string): Promise<RawProduct[]> {
    const token = process.env.APIFY_TOKEN;
    if (!token) {
      throw new Error("APIFY_TOKEN env var not set — Dutchie sync disabled");
    }

    const url = `${APIFY_ENDPOINT}?token=${encodeURIComponent(token)}`;
    const body = buildInputBody(merchantId);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `Apify dutchie-scraper HTTP ${res.status}: ${errText.slice(0, 200)}`
      );
    }

    const items = (await res.json()) as unknown;
    if (!Array.isArray(items)) {
      throw new Error(
        `Apify dutchie-scraper: expected array, got ${typeof items}`
      );
    }
    return items as RawProduct[];
  },

  normalize(raw: RawProduct[], shopSlug: string): NormalizedItem[] {
    const now = new Date().toISOString();
    const seen = new Set<string>();
    const out: NormalizedItem[] = [];

    for (const r of raw as unknown as DutchieProduct[]) {
      const id = pickString(r.Id, r.id);
      const name = pickString(r.Name, r.name);
      if (!id || !name) continue;
      if (seen.has(id)) continue;
      seen.add(id);

      if (!pickInStock(r)) continue;

      const category = pickString(r.Category, r.category);
      const type = deriveType(category, name);

      out.push({
        id: `${shopSlug}:${id}`,
        shop_slug: shopSlug,
        name,
        type,
        strain_id: null, // resolved by lib/strain-match.ts in the orchestrator
        brand: pickBrand(r),
        size: pickSize(r),
        thc: pickPotency(r.THCContent ?? r.thcContent),
        cbd: pickPotency(r.CBDContent ?? r.cbdContent),
        price: pickPrice(r),
        in_stock: true,
        last_seen: now,
      });
    }

    return out;
  },
};
