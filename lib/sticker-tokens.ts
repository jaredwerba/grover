import "server-only";
import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";

/**
 * Sticker tokens are short, signed JWTs encoding which dispensary
 * sticker was scanned. The same secret is used for sign + verify;
 * tokens are stable per shop (deterministic stickerId) so the QR
 * code printed for a shop doesn't change every restart.
 *
 * Falls back to SESSION_SECRET if a dedicated STICKER_SECRET isn't
 * configured — fine for MVP.
 */
const SECRET = process.env.STICKER_SECRET ?? process.env.SESSION_SECRET!;

function encodedKey(secret: string) {
  return new TextEncoder().encode(secret);
}

/** Stable per-shop sticker ID — first 12 hex chars of SHA-256(shopId). */
export function stickerIdFor(shopId: string): string {
  return crypto.createHash("sha256").update(shopId).digest("hex").slice(0, 12);
}

export interface StickerPayload {
  shopId: string;
  stickerId: string;
  purpose: "crave-cannatrail-sticker";
}

/**
 * Sign a sticker token. No expiry — stickers are physical objects
 * that should stay valid until we explicitly rotate the secret.
 */
export async function signStickerToken(shopId: string): Promise<string> {
  return new SignJWT({
    shopId,
    stickerId: stickerIdFor(shopId),
    purpose: "crave-cannatrail-sticker",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(encodedKey(SECRET));
}

export async function verifyStickerToken(
  token: string
): Promise<StickerPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey(SECRET), {
      algorithms: ["HS256"],
    });
    if (
      payload.purpose !== "crave-cannatrail-sticker" ||
      typeof payload.shopId !== "string" ||
      typeof payload.stickerId !== "string"
    ) {
      return null;
    }
    return {
      shopId: payload.shopId,
      stickerId: payload.stickerId,
      purpose: "crave-cannatrail-sticker",
    };
  } catch {
    return null;
  }
}
