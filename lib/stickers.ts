import { Redis } from "@upstash/redis";
import { incrementSticker } from "./sticker-aggregate";
import type { Region } from "./dispensaries";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

/** 365-day TTL — collected stickers are long-lived collectibles. */
const STICKERS_TTL = 60 * 60 * 24 * 365;

/* ── Types ── */

export interface StickerEntry {
  /** Matches Dispensary.id from lib/dispensaries.ts */
  shopId: string;
  /** Denormalized at collection time so we don't re-look up on read */
  shopName: string;
  /** Denormalized trail/region for grouping in the passport */
  region: Region | null;
  /** ISO timestamp */
  collected_at: string;
}

/* ── Keys ── */

function stickersKey(email: string) {
  return `user:stickers:${email}`;
}

/* ── CRUD ── */

export async function getStickers(email: string): Promise<StickerEntry[]> {
  try {
    const data = await kv.get<StickerEntry[]>(stickersKey(email));
    return data ?? [];
  } catch {
    return [];
  }
}

/**
 * Add a sticker to the user's passport. Idempotent — if the shop is
 * already collected, returns the existing list unchanged (preserving
 * the original `collected_at`). Enforces lifetime uniqueness per the
 * MVP product decision.
 */
export async function addSticker(
  email: string,
  shop: Omit<StickerEntry, "collected_at">
): Promise<{ list: StickerEntry[]; newlyAdded: boolean }> {
  const list = await getStickers(email);

  if (list.some((s) => s.shopId === shop.shopId)) {
    return { list, newlyAdded: false };
  }

  const entry: StickerEntry = {
    ...shop,
    collected_at: new Date().toISOString(),
  };
  const next = [...list, entry];

  await kv.set(stickersKey(email), next, { ex: STICKERS_TTL });

  // Fire-and-forget global counter so a future dispenser dashboard
  // can show scan totals without re-aggregating.
  incrementSticker(shop.shopId).catch(() => {});

  return { list: next, newlyAdded: true };
}

export async function hasSticker(
  email: string,
  shopId: string
): Promise<boolean> {
  const list = await getStickers(email);
  return list.some((s) => s.shopId === shopId);
}
