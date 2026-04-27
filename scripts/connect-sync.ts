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
    console.log(`[cove-connect] ${normalized.length} items normalized.`);
    console.log(JSON.stringify(normalized.slice(0, 5), null, 2));
  } catch (err) {
    console.error(
      `[cove-connect] FAIL — ${err instanceof Error ? err.message : err}`
    );
    process.exit(1);
  }
}

main();
