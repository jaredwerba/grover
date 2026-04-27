import type { Connector } from "./index";
import type { NormalizedItem, RawProduct } from "../inventory";

/**
 * Dutchie connector. Anchor candidate: Upstate Elevator (custom
 * Shopify with embedded Dutchie). Most VT dispensaries on a modern
 * POS are likely on Dutchie — coverage estimate ~50% of the 40 shops.
 *
 * Day 1: interface stub only. Day 3 (Tue Apr 28): real implementation.
 *
 * Plan: extract `x-dutchie-platform-key` from the embed iframe HTML,
 * then POST to embedded-menu.api.dutchie.com/graphql with that header.
 */
export const dutchieConnector: Connector = {
  platform: "dutchie",

  async fetchMenu(_merchantId: string): Promise<RawProduct[]> {
    // TODO Day 3: GET dutchie.com/embedded-menu/{slug} → parse iframe
    // → extract x-dutchie-platform-key → POST GraphQL menu query.
    throw new Error("dutchie.fetchMenu not implemented yet (Day 3)");
  },

  normalize(_raw: RawProduct[], _shopSlug: string): NormalizedItem[] {
    // TODO Day 3: map Dutchie's category enum to ProductType, etc.
    return [];
  },
};
