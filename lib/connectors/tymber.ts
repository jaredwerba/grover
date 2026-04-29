import type { Connector } from "./index";
import type { NormalizedItem, ProductType, RawProduct } from "../inventory";

/**
 * Tymber connector (a.k.a. "grass.menu"). Reaches a wide swath of
 * Vermont dispensaries via shop.{domain}.com or {brand}.grass.menu.
 *
 * MothaPlant is the anchor: shop.mothaplant.com, even though
 * MothaPlant is configured on DispenseApp's platform — DispenseApp's
 * menu page just funnels users to the operator's Tymber storefront.
 *
 * Strategy:
 *   1. GET shop_url/menu → parse __NEXT_DATA__ →
 *      pageProps.filtersCatalog.included filtered by
 *      type === "product_categories" → list of {slug, name}.
 *   2. For each category: GET shop_url/menu/categories/{slug} →
 *      parse __NEXT_DATA__ → pageProps.products.data.objects[].
 *   3. Concatenate, dedupe by id, return.
 *
 * Known limitation: Tymber serves 20 products per category page via
 * SSR and pagination is client-side only. We capture the first 20
 * (alphabetical by default) per category and miss any overflow. The
 * orchestrator records the unfetched count via a non-enumerable
 * property on the returned array.
 */

interface TymberRaw {
  id: string;
  type: "products";
  attributes: TymberAttrs;
}

interface TymberAttrs {
  id: string;
  name: string;
  slug: string;
  in_stock: boolean;
  is_active: boolean;
  is_deleted: boolean;
  on_sale: boolean;
  hide_from_menu: boolean;
  flower_type?: string | null;
  composition?: { thc?: number; cbd?: number };
  weight_prices?: Array<{
    price: { amount: number; currency: string };
    discount_price: { amount: number; currency: string } | null;
    display_name: string;
    weight_key: string;
  }>;
  unit_prices?: Array<{
    price: { amount: number; currency: string };
    discount_price: { amount: number; currency: string } | null;
    display_name: string;
  }> | null;
  unit_price?: { amount: number; currency: string } | null;
  size?: { display_text: string } | null;
  sku?: string;
  main_image?: string;
  store_url?: string;
  strain?: string | null;
  description?: string | null;
}

interface TymberCategory {
  slug: string;
  name: string;
}

const FETCH_HEADERS = {
  // ASCII-only — HTTP headers can't carry non-ASCII bytes.
  "user-agent":
    "Cove Connect (covebud.com; +https://covebud.com/operators/policy)",
  accept: "text/html,application/xhtml+xml",
};

function shopBaseUrl(merchantId: string): string {
  // Two flavors of merchantId are accepted:
  //   1. A shop hostname like "shop.mothaplant.com" (operators with
  //      their own white-labeled Tymber subdomain)
  //   2. A 16-char hex DispenseApp venue ID like "0bf4da933d9e0616"
  //      (operators only listed via the menus.dispenseapp.com
  //      directory — same Tymber backend, different access path).
  if (merchantId.startsWith("http")) return merchantId.replace(/\/+$/, "");
  if (/^[a-f0-9]{16}$/i.test(merchantId)) {
    return `https://menus.dispenseapp.com/${merchantId}`;
  }
  return `https://${merchantId}`.replace(/\/+$/, "");
}

async function fetchNextData(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }
  const html = await res.text();
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!m) throw new Error(`No __NEXT_DATA__ in ${url}`);
  return JSON.parse(m[1]);
}

function getProp<T>(obj: unknown, ...keys: string[]): T | undefined {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur && typeof cur === "object" && k in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return cur as T;
}

async function discoverCategories(base: string): Promise<TymberCategory[]> {
  const data = await fetchNextData(`${base}/menu`);
  const included = getProp<Array<{ type: string; attributes: TymberCategory }>>(
    data,
    "props",
    "pageProps",
    "filtersCatalog",
    "included"
  );
  if (!Array.isArray(included)) return [];
  return included
    .filter((i) => i.type === "product_categories")
    .map((i) => ({ slug: i.attributes.slug, name: i.attributes.name }));
}

async function fetchCategoryProducts(
  base: string,
  slug: string
): Promise<{ products: TymberRaw[]; totalCount: number }> {
  const data = await fetchNextData(`${base}/menu/categories/${slug}`);
  const products = getProp<{
    data: { meta: { total_count: number }; objects: TymberRaw[] };
  }>(data, "props", "pageProps", "products");
  if (!products || !products.data) return { products: [], totalCount: 0 };
  return {
    products: products.data.objects ?? [],
    totalCount: products.data.meta?.total_count ?? 0,
  };
}

/** Map Tymber category slug + name → coarse Cove ProductType. */
function deriveType(categorySlug: string, attrs: TymberAttrs): ProductType {
  const s = categorySlug.toLowerCase();
  if (s.includes("vape")) return "vape";
  if (s.includes("edible")) return "edible";
  if (s.includes("drink") || s.includes("beverage")) return "drink";
  if (s.includes("preroll") || s.includes("pre-roll")) return "preroll";
  if (s.includes("concentrate") || s.includes("extract")) return "concentrate";
  if (s.includes("tincture")) return "tincture";
  if (s.includes("topical")) return "topical";
  if (s.includes("paper") || s.includes("cone") || s.includes("accessor"))
    return "accessory";
  if (s.includes("flower")) return "flower";

  const n = attrs.name.toLowerCase();
  if (/\bpre-?roll\b/.test(n)) return "preroll";
  if (/\bvape|cart\b/.test(n)) return "vape";
  if (/\bgummy|chocolate|edible\b/.test(n)) return "edible";
  if (/\btincture\b/.test(n)) return "tincture";
  return "other";
}

function lowestPrice(attrs: TymberAttrs): number | null {
  const opts = [
    ...(attrs.weight_prices || []),
    ...(attrs.unit_prices || []),
  ];
  const prices = opts
    .map((o) => o.discount_price?.amount ?? o.price?.amount)
    .filter((a): a is number => typeof a === "number" && a > 0);
  if (prices.length === 0 && attrs.unit_price?.amount) {
    return attrs.unit_price.amount / 100;
  }
  if (prices.length === 0) return null;
  return Math.min(...prices) / 100;
}

function smallestSizeLabel(attrs: TymberAttrs): string | null {
  const opts = attrs.weight_prices || [];
  if (opts.length === 0) return attrs.size?.display_text ?? null;
  // First entry is typically the smallest weight.
  return opts[0].display_name ?? null;
}

/**
 * Internal type that pairs a Tymber product with the slug of the
 * category we found it under — needed because deriveType() reads the
 * slug, and a product can appear in multiple categories.
 */
interface TaggedRaw {
  raw: TymberRaw;
  categorySlug: string;
}

export const tymberConnector: Connector = {
  platform: "tymber",

  async fetchMenu(merchantId: string): Promise<RawProduct[]> {
    const base = shopBaseUrl(merchantId);
    const categories = await discoverCategories(base);
    if (categories.length === 0) {
      throw new Error(`No categories discovered at ${base}/menu`);
    }

    const tagged: TaggedRaw[] = [];
    let totalAcrossCats = 0;
    let unfetchedOverflow = 0;

    // Sequential fetch to be polite. ~14 cats × ~200ms ≈ 3s per shop.
    for (const cat of categories) {
      try {
        const { products, totalCount } = await fetchCategoryProducts(
          base,
          cat.slug
        );
        for (const p of products) tagged.push({ raw: p, categorySlug: cat.slug });
        totalAcrossCats += totalCount;
        if (totalCount > products.length) {
          unfetchedOverflow += totalCount - products.length;
        }
      } catch (err) {
        console.warn(
          `[tymber] category ${cat.slug} failed:`,
          err instanceof Error ? err.message : err
        );
      }
    }

    // We use the loose RawProduct[] return contract but stash the
    // tagged metadata on each item so normalize() can read both the
    // attributes and the category slug it came from.
    const out = tagged.map(
      (t) =>
        ({
          ...t.raw,
          __category_slug: t.categorySlug,
        } as unknown as RawProduct)
    );

    Object.defineProperty(out, "__total_advertised", {
      value: totalAcrossCats,
      enumerable: false,
    });
    Object.defineProperty(out, "__unfetched_overflow", {
      value: unfetchedOverflow,
      enumerable: false,
    });

    return out;
  },

  normalize(raw: RawProduct[], shopSlug: string): NormalizedItem[] {
    const now = new Date().toISOString();
    const items: NormalizedItem[] = [];
    const seen = new Set<string>();

    for (const p of raw as unknown as Array<TymberRaw & { __category_slug?: string }>) {
      if (!p?.attributes) continue;
      const a = p.attributes;
      if (a.is_deleted || a.hide_from_menu || !a.is_active) continue;
      if (seen.has(a.id)) continue;
      seen.add(a.id);

      const type = deriveType(p.__category_slug ?? "", a);

      items.push({
        id: `${shopSlug}:${a.id}`,
        shop_slug: shopSlug,
        name: a.name,
        type,
        strain_id: null, // populated in a later pass — Day 5
        brand: null,
        size: smallestSizeLabel(a),
        thc: typeof a.composition?.thc === "number" ? a.composition.thc : null,
        cbd: typeof a.composition?.cbd === "number" ? a.composition.cbd : null,
        price: lowestPrice(a),
        in_stock: !!a.in_stock,
        last_seen: now,
      });
    }

    return items;
  },
};
