import type { Connector } from "./index";
import type { NormalizedItem, RawProduct } from "../inventory";

/**
 * DispenseApp connector. Anchor target: MothaPlant
 * (merchant id `a6b0c909cbf495bb`, public menu at
 *  https://menus.dispenseapp.com/{merchant_id}/menu).
 *
 * Day 1: interface stub only. Day 2: real fetch + normalize.
 */
export const dispenseAppConnector: Connector = {
  platform: "dispenseapp",

  async fetchMenu(_merchantId: string): Promise<RawProduct[]> {
    // TODO Day 2: extract bearer token from menus.dispenseapp.com page,
    // call api.dispenseapp.com/v1/stores/{merchantId}/menu, return raw[].
    throw new Error("dispenseapp.fetchMenu not implemented yet (Day 2)");
  },

  normalize(_raw: RawProduct[], _shopSlug: string): NormalizedItem[] {
    // TODO Day 2: map DispenseApp's category strings to ProductType,
    // parse weight/THC/CBD/price, attach last_seen.
    return [];
  },
};
