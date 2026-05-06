import { Redis } from "@upstash/redis";
import { dispensaries } from "./dispensaries";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const CLAIM_TTL = 60 * 60 * 24 * 365; // 365 days

/* ── Types ── */

export interface BusinessClaim {
  shopId: string;
  shopName: string;
  claimedAt: string;
}

/* ── Keys ── */

function claimKey(email: string) {
  return `business:claim:${email}`;
}

/* ── CRUD ── */

export async function getBusinessClaim(
  email: string
): Promise<BusinessClaim | null> {
  try {
    return kv.get<BusinessClaim>(claimKey(email));
  } catch {
    return null;
  }
}

export async function claimShop(
  email: string,
  shopId: string
): Promise<BusinessClaim | null> {
  const shop = dispensaries.find((d) => d.id === shopId);
  if (!shop) return null;

  const claim: BusinessClaim = {
    shopId,
    shopName: shop.name,
    claimedAt: new Date().toISOString(),
  };

  await kv.set(claimKey(email), claim, { ex: CLAIM_TTL });
  return claim;
}

export async function isShopClaimed(shopId: string): Promise<boolean> {
  // For MVP, we don't enforce uniqueness — multiple users can claim
  // the same shop (e.g. multiple staff members). This is a simple check.
  // In production, you'd scan or maintain a reverse index.
  return false;
}

/* ── Demo Seed ── */

/**
 * Pre-seed the Papa G demo account so Grover can demo immediately.
 * Called lazily on first insights fetch if no claim exists.
 */
export const DEMO_EMAIL = "groverbdaniels@gmail.com";
export const DEMO_SHOP_ID = "higher-elevation";

export async function ensureDemoClaim(): Promise<void> {
  const existing = await getBusinessClaim(DEMO_EMAIL);
  if (!existing) {
    await claimShop(DEMO_EMAIL, DEMO_SHOP_ID);
  }
}
