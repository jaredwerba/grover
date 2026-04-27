import type { NormalizedItem, PlatformId, RawProduct } from "../inventory";
import { dispenseAppConnector } from "./dispenseapp";
import { dutchieConnector } from "./dutchie";

/**
 * A connector knows how to read one platform's public menu data.
 *
 * Day 1: interface + stubs. Day 2 (Mon Apr 27): dispenseapp working.
 * Day 3 (Tue Apr 28): dutchie working.
 */
export interface Connector {
  platform: PlatformId;
  /**
   * Fetch the raw menu for one shop. The merchantId argument is what
   * the platform uses to identify this shop (e.g. DispenseApp's
   * 16-char hex ID, Dutchie's slug).
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
  dispenseapp: dispenseAppConnector,
  dutchie: dutchieConnector,
};
