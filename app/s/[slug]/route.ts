import { NextRequest, NextResponse } from "next/server";
import { dispensaries } from "@/lib/dispensaries";
import { signStickerToken } from "@/lib/sticker-tokens";

/**
 * GET /s/[slug]
 *
 * Short-URL redirect for Crave Cannatrail Passport stickers. The printed QR
 * encodes `https://covebud.com/s/<shopId>` (~30-40 chars) instead of
 * the full signed JWT URL (~280 chars), so the QR pattern is much
 * sparser and far easier for any phone camera or in-app scanner to
 * decode at typical viewing distance.
 *
 * The signing happens here so the QR itself doesn't carry the JWT —
 * which means the QR is stable per shop (no need to regenerate when
 * the JWT iat changes) AND the actual token is freshly minted on each
 * scan with `iat = now`.
 *
 * If the slug doesn't match a known dispensary we forward to the
 * passport with a friendly error toast.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const shop = dispensaries.find((d) => d.id === slug);
  if (!shop) {
    return NextResponse.redirect(
      new URL("/crave-cannatrail-passport?error=unknown", req.url)
    );
  }

  const token = await signStickerToken(shop.id);
  return NextResponse.redirect(
    new URL(
      `/crave-cannatrail-passport/scan?t=${encodeURIComponent(token)}`,
      req.url
    )
  );
}
