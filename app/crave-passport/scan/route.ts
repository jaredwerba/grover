import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyStickerToken } from "@/lib/sticker-tokens";
import { addSticker } from "@/lib/stickers";
import { dispensaries } from "@/lib/dispensaries";

/**
 * GET /crave-passport/scan?t=<jwt>
 *
 * Universal landing target for every CRAVE Passport QR code — both the
 * in-app camera scanner and a phone's native camera redirect through
 * here. Behavior:
 *
 * 1. Reads the signed token from `?t`.
 * 2. If no session: 302 → /join?next=<this-url> so the QR isn't wasted.
 * 3. Verifies the token signature. Invalid → /crave-passport?error=invalid.
 * 4. Looks up the shop. Unknown id → /crave-passport?error=unknown.
 * 5. Adds the sticker to the user's passport (idempotent per the
 *    lifetime-uniqueness rule) and redirects to
 *    /crave-passport?collected=<shopId>(&new=1).
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");

  if (!token) {
    return NextResponse.redirect(new URL("/crave-passport?error=missing", req.url));
  }

  const session = await getSession();
  if (!session) {
    // Preserve the full scan URL so the user lands back here after sign-in.
    const next = `/crave-passport/scan?t=${encodeURIComponent(token)}`;
    return NextResponse.redirect(
      new URL(`/join?next=${encodeURIComponent(next)}`, req.url)
    );
  }

  const payload = await verifyStickerToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/crave-passport?error=invalid", req.url));
  }

  const shop = dispensaries.find((d) => d.id === payload.shopId);
  if (!shop) {
    return NextResponse.redirect(new URL("/crave-passport?error=unknown", req.url));
  }

  const { newlyAdded } = await addSticker(session.email, {
    shopId: shop.id,
    shopName: shop.name,
    region: shop.region ?? null,
  });

  const target = new URL("/crave-passport", req.url);
  target.searchParams.set("collected", shop.id);
  if (newlyAdded) target.searchParams.set("new", "1");
  return NextResponse.redirect(target);
}
