import type { NormalizedItem, PlatformId, RawProduct } from "../inventory";
import { tymberConnector } from "./tymber";
import { leaflyConnector } from "./leafly";
import { mauiConnector } from "./maui";
// Dutchie connector intentionally NOT registered yet:
// dutchie.com is gated by Cloudflare bot protection and operator
// subdomains are SPA-rendered. Reach requires Playwright or a Dutchie
// partnership. Tagged shops (e.g. flora-cannabis) get cleanly skipped
// in the sync route via the "no connector for platform" branch.
// import { dutchieConnector } from "./dutchie";

/**
 * A connector knows how to read one platform's public menu data.
 */
export interface Connector {
  platform: PlatformId;
  /**
   * Fetch the raw menu for one shop. The merchantId argument is
   * platform-specific: a shop hostname for Tymber (e.g.
   * "shop.mothaplant.com"), a slug for Dutchie, etc.
   */
  fetchMenu(merchantId: string): Promise<RawProduct[]>;
  /**
   * Normalize raw products into the shape Cove reads from. Strain
   * matching happens in a separate pass (lib/strain-match.ts) — this
   * function should leave strain_id as null and let the orchestrator
   * fill it.
   */
  normalize(raw: RawProduct[], shopSlug: string): NormalizedItem[];
}

/** Look up the connector for a platform. Returns null if unsupported. */
export function getConnector(platform: PlatformId): Connector | null {
  return CONNECTORS[platform] ?? null;
}

const CONNECTORS: Partial<Record<PlatformId, Connector>> = {
  tymber: tymberConnector,
  leafly: leaflyConnector,
  maui: mauiConnector,
  // dutchie: dutchieConnector — see note above
};
