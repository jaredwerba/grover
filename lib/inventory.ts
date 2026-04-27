/**
 * Cove Connect — inventory layer types.
 *
 * Public dispensary menus are ingested by per-platform connectors
 * (lib/connectors/*) and normalized into a single shape that powers
 * Cannatrail's "in stock" badges, the Strain Library's "available at"
 * cards, and Cove AI's location-aware recommendations.
 */

/** Coarse product type. Maps onto the categories Vermont consumers think in. */
export type ProductType =
  | "flower"
  | "preroll"
  | "vape"
  | "concentrate"
  | "edible"
  | "drink"
  | "tincture"
  | "topical"
  | "accessory"
  | "other";

/**
 * A raw product as the platform returned it. Connectors return arrays
 * of these. Shape is intentionally loose because each platform exposes
 * slightly different fields; normalization happens in `normalize()`.
 */
export interface RawProduct {
  id?: string;
  name: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  size?: string;
  weight?: string | number;
  thc?: number | string;
  cbd?: number | string;
  price?: number;
  price_cents?: number;
  in_stock?: boolean;
  qty_on_hand?: number;
  image_url?: string;
  // Allow connectors to pass through arbitrary extras for future use.
  [key: string]: unknown;
}

/**
 * The normalized form. Cove reads from this everywhere.
 * Strain match is optional — if our fuzzy matcher couldn't resolve the
 * product to a canonical strain in lib/strains.ts, the item still ships
 * (we just can't cross-link it from the Strain Library).
 */
export interface NormalizedItem {
  /** Stable ID per (shop, product). Used for de-dup across syncs. */
  id: string;
  shop_slug: string;
  name: string;
  type: ProductType;
  /** Canonical strain ID from lib/strains.ts, if matched. */
  strain_id: string | null;
  /** Optional brand or grower attribution if the menu carries it. */
  brand: string | null;
  /** Display size, e.g. "3.5g", "1g vape", "10mg/pc · 10pc". */
  size: string | null;
  /** Percentage as a number, e.g. 22.4. Null when unknown. */
  thc: number | null;
  cbd: number | null;
  /** Price in dollars (not cents) for ease of display. Null when hidden. */
  price: number | null;
  in_stock: boolean;
  /** ISO timestamp this item was observed in the menu. */
  last_seen: string;
}

/**
 * Per-shop sync metadata stored alongside the inventory at
 * `inv:meta:{shop_slug}`. Powers the "synced 4h ago" UI footer
 * and the admin status table.
 */
export interface ShopInventoryMeta {
  shop_slug: string;
  platform: PlatformId;
  last_synced: string; // ISO
  item_count: number;
  status: "ok" | "stale" | "error";
  /** Last error message, if any. Cleared on a successful sync. */
  error?: string;
}

/** All platforms Cove Connect knows how to ingest. Add as we add connectors. */
export type PlatformId =
  | "dispenseapp"
  | "dutchie"
  | "shopify"
  | "manual";
