/**
 * Cove Connect — local sync runner.
 *
 * Usage:
 *   npx tsx scripts/connect-sync.ts <shop-slug>
 *
 * Examples:
 *   npx tsx scripts/connect-sync.ts mothaplant
 *   npx tsx scripts/connect-sync.ts upstate-elevator
 *
 * Day 1: prints "not implemented yet" — wiring only.
 * Day 2: dispenseapp prints real products.
 * Day 3: dutchie prints real products.
 */
import { dispensaries } from "../lib/dispensaries";
import { getConnector } from "../lib/connectors";

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: tsx scripts/connect-sync.ts <shop-slug>");
    process.exit(1);
  }

  const shop = dispensaries.find((d) => d.id === slug);
  if (!shop) {
    console.error(`No dispensary with id "${slug}" in lib/dispensaries.ts`);
    process.exit(1);
  }

  if (!shop.platform || !shop.merchant_id) {
    console.error(
      `Shop "${shop.name}" has no platform/merchant_id set in lib/dispensaries.ts. ` +
        `Add it before syncing.`
    );
    process.exit(1);
  }

  const connector = getConnector(shop.platform);
  if (!connector) {
    console.error(`No connector registered for platform "${shop.platform}"`);
    process.exit(1);
  }

  console.log(
    `[cove-connect] Syncing ${shop.name} (${shop.platform} · ${shop.merchant_id})...`
  );

  try {
    const raw = await connector.fetchMenu(shop.merchant_id);
    const normalized = connector.normalize(raw, shop.id);
    const totalAdvertised = (raw as unknown as { __total_advertised?: number })
      .__total_advertised;
    const unfetchedOverflow = (raw as unknown as {
      __unfetched_overflow?: number;
    }).__unfetched_overflow;
    console.log(
      `[cove-connect] raw fetched: ${raw.length} | normalized: ${normalized.length}` +
        (typeof totalAdvertised === "number"
          ? ` | advertised total across categories: ${totalAdvertised}`
          : "") +
        (typeof unfetchedOverflow === "number" && unfetchedOverflow > 0
          ? ` | unfetched (pagination cap): ${unfetchedOverflow}`
          : "")
    );
    // Type counts
    const byType: Record<string, number> = {};
    for (const item of normalized) byType[item.type] = (byType[item.type] || 0) + 1;
    console.log(`[cove-connect] by type:`, byType);
    console.log(`[cove-connect] sample:`);
    console.log(JSON.stringify(normalized.slice(0, 3), null, 2));
  } catch (err) {
    console.error(
      `[cove-connect] FAIL — ${err instanceof Error ? err.message : err}`
    );
    process.exit(1);
  }
}

main();
