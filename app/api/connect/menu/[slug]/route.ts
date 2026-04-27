import { NextRequest, NextResponse } from "next/server";
import {
  getInventory,
  getInventoryMeta,
} from "@/lib/inventory-store";
import { dispensaries } from "@/lib/dispensaries";

/**
 * Cove Connect — public read endpoint for one shop's inventory.
 *
 *   GET /api/connect/menu/{shop_slug}
 *
 * Returns:
 *   {
 *     shop: { id, name, city },
 *     meta: { last_synced, item_count, status, ... } | null,
 *     items: NormalizedItem[]
 *   }
 *
 * 404 if the shop slug isn't a known dispensary.
 * 200 with empty items + null meta if the shop is known but never synced.
 *
 * Edge runtime — fast static reads from Upstash.
 */

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const shop = dispensaries.find((d) => d.id === slug);
  if (!shop) {
    return NextResponse.json(
      { error: "Unknown dispensary slug" },
      { status: 404 }
    );
  }

  const [items, meta] = await Promise.all([
    getInventory(slug),
    getInventoryMeta(slug),
  ]);

  return NextResponse.json(
    {
      shop: { id: shop.id, name: shop.name, city: shop.city },
      meta,
      items: items ?? [],
    },
    {
      headers: {
        // 5-min CDN cache; sync writes invalidate effectively via TTL.
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    }
  );
}
