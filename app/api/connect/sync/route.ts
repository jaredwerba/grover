import { NextRequest, NextResponse } from "next/server";
import { dispensaries } from "@/lib/dispensaries";
import { getConnector } from "@/lib/connectors";
import {
  setInventory,
  setInventoryMeta,
} from "@/lib/inventory-store";
import type { ShopInventoryMeta } from "@/lib/inventory";

/**
 * Cove Connect — nightly sync.
 *
 * Iterates every dispensary that has a configured connector,
 * fetches and normalizes its menu, writes the result to Redis.
 * Per-shop failures are caught so one bad connector run can't
 * sink the rest. Returns a JSON summary.
 *
 * Triggers:
 * - vercel.json cron (daily at 06:00 UTC)
 * - manual:  curl -X POST or GET https://covebud.com/api/connect/sync
 *
 * Auth: gated by a CRON_SECRET header in production. Vercel passes
 * `Authorization: Bearer ${CRON_SECRET}` for cron jobs. Anyone hitting
 * this without that header in prod gets 401. Local dev is open.
 */

// This route does network I/O to many shops; needs the longer node
// runtime budget, not edge.
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — Tymber sync per shop ≈ 3s

interface PerShopResult {
  shop_slug: string;
  platform: string;
  status: "ok" | "skipped" | "error";
  item_count?: number;
  advertised_total?: number;
  unfetched_overflow?: number;
  error?: string;
  duration_ms?: number;
}

async function syncOne(
  shop: (typeof dispensaries)[number]
): Promise<PerShopResult> {
  const start = Date.now();

  if (!shop.platform || !shop.merchant_id) {
    return {
      shop_slug: shop.id,
      platform: "none",
      status: "skipped",
      error: "no platform configured",
    };
  }

  const connector = getConnector(shop.platform);
  if (!connector) {
    // Platform tagged but no connector implementation yet (e.g. dutchie)
    const meta: ShopInventoryMeta = {
      shop_slug: shop.id,
      platform: shop.platform,
      last_synced: new Date().toISOString(),
      item_count: 0,
      status: "error",
      error: `no connector for platform "${shop.platform}"`,
    };
    await setInventoryMeta(shop.id, meta);
    return {
      shop_slug: shop.id,
      platform: shop.platform,
      status: "skipped",
      error: meta.error,
    };
  }

  try {
    const raw = await connector.fetchMenu(shop.merchant_id);
    const normalized = connector.normalize(raw, shop.id);

    const advertisedTotal = (raw as unknown as { __total_advertised?: number })
      .__total_advertised;
    const unfetchedOverflow = (raw as unknown as {
      __unfetched_overflow?: number;
    }).__unfetched_overflow;

    await setInventory(shop.id, normalized);
    const meta: ShopInventoryMeta = {
      shop_slug: shop.id,
      platform: shop.platform,
      last_synced: new Date().toISOString(),
      item_count: normalized.length,
      status: "ok",
    };
    await setInventoryMeta(shop.id, meta);

    return {
      shop_slug: shop.id,
      platform: shop.platform,
      status: "ok",
      item_count: normalized.length,
      advertised_total: advertisedTotal,
      unfetched_overflow: unfetchedOverflow,
      duration_ms: Date.now() - start,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const meta: ShopInventoryMeta = {
      shop_slug: shop.id,
      platform: shop.platform,
      last_synced: new Date().toISOString(),
      item_count: 0,
      status: "error",
      error: errMsg,
    };
    await setInventoryMeta(shop.id, meta).catch(() => {});
    return {
      shop_slug: shop.id,
      platform: shop.platform,
      status: "error",
      error: errMsg,
      duration_ms: Date.now() - start,
    };
  }
}

function isAuthorized(req: NextRequest): boolean {
  // Local dev: always allow.
  if (process.env.NODE_ENV !== "production") return true;
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    // Misconfigured prod — treat as locked rather than open.
    return false;
  }
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${expected}`;
}

async function runSync() {
  const started = Date.now();
  // Sequential — total ≈ (#syncable shops × ~3s). With 1 connector
  // and 1 syncable shop we're at ~3s. As more land we may parallelize.
  const results: PerShopResult[] = [];
  for (const shop of dispensaries) {
    results.push(await syncOne(shop));
  }
  const summary = {
    started_at: new Date(started).toISOString(),
    completed_at: new Date().toISOString(),
    duration_ms: Date.now() - started,
    counts: {
      ok: results.filter((r) => r.status === "ok").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      error: results.filter((r) => r.status === "error").length,
      total_items: results.reduce((s, r) => s + (r.item_count ?? 0), 0),
    },
    results,
  };
  return summary;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const summary = await runSync();
  return NextResponse.json(summary);
}

// Allow POST too — both Vercel Cron and manual curls work.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const summary = await runSync();
  return NextResponse.json(summary);
}
