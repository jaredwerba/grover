import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyStickerToken } from "@/lib/sticker-tokens";
import { addSticker } from "@/lib/stickers";
import { dispensaries } from "@/lib/dispensaries";

/**
 * GET /cove-trail-passport/scan?t=<jwt>
 *
 * Universal landing target for every COVE Trail Passport QR code — both the
 * in-app camera scanner and a phone's native camera redirect through
 * here. Behavior:
 *
 * 1. Reads the signed token from `?t`.
 * 2. If no session: 302 → /join?next=<this-url> so the QR isn't wasted.
 * 3. Verifies the token signature. Invalid → /cove-trail-passport?error=invalid.
 * 4. Looks up the shop. Unknown id → /cove-trail-passport?error=unknown.
 * 5. Adds the sticker to the user's passport (idempotent per the
 *    lifetime-uniqueness rule) and redirects to
 *    /cove-trail-passport?collected=<shopId>(&new=1).
 *
 * Known limitation (signed-out phone-camera scans):
 *   We forward `?next=` to /join, but the magic-link consumer at
 *   /verify/route.ts ignores it today and always lands users on /chat.
 *   That means a signed-out user who scans a printed QR with their
 *   phone camera will sign in but lose the sticker context. The in-app
 *   scanner (the primary MVP path) is signed-in by definition, so this
 *   only impacts the bootstrap "first-time, scan from outside" case.
 *   Plumb `next` through /verify in a follow-up PR.
 *
 * Runtime: defaults to Node — `lib/sticker-tokens.ts` uses `node:crypto`,
 * so do not switch this route to Edge without refactoring that import.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");

  if (!token) {
    return NextResponse.redirect(new URL("/cove-trail-passport?error=missing", req.url));
  }

  const session = await getSession();
  if (!session) {
    // Preserve the full scan URL so the user lands back here after sign-in.
    const next = `/cove-trail-passport/scan?t=${encodeURIComponent(token)}`;
    return NextResponse.redirect(
      new URL(`/join?next=${encodeURIComponent(next)}`, req.url)
    );
  }

  const payload = await verifyStickerToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/cove-trail-passport?error=invalid", req.url));
  }

  const shop = dispensaries.find((d) => d.id === payload.shopId);
  if (!shop) {
    return NextResponse.redirect(new URL("/cove-trail-passport?error=unknown", req.url));
  }

  const { newlyAdded } = await addSticker(session.email, {
    shopId: shop.id,
    shopName: shop.name,
    region: shop.region ?? null,
  });

  const target = new URL("/cove-trail-passport", req.url);
  target.searchParams.set("collected", shop.id);
  if (newlyAdded) target.searchParams.set("new", "1");
  return NextResponse.redirect(target);
}
