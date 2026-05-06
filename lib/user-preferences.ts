import { Redis } from "@upstash/redis";
import { strains } from "./strains";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

/** 365-day TTL — favorites are high-value user data. */
const FAVORITES_TTL = 60 * 60 * 24 * 365;
const MAX_FAVORITES = 50;

/* ── Types ── */

export interface FavoriteItem {
  /** Product key or canonical strain ID */
  id: string;
  /** "strain" for canonical library, "product" for live inventory */
  kind: "strain" | "product";
  /** Display name at time of favoriting */
  name: string;
  /** Product type (flower, edible, vape, etc.) */
  type: string;
  /** ISO timestamp */
  added_at: string;
}

export interface UserPreferences {
  preferred_types: string[];
  preferred_effects: string[];
  price_range: [number | null, number | null];
  preferred_category: string | null; // Indica / Sativa / Hybrid
  favorite_names: string[];
  updated_at: string;
}

/* ── Keys ── */

function favKey(email: string) {
  return `user:favorites:${email}`;
}
function prefKey(email: string) {
  return `user:preferences:${email}`;
}

/* ── CRUD ── */

export async function getFavorites(email: string): Promise<FavoriteItem[]> {
  try {
    const data = await kv.get<FavoriteItem[]>(favKey(email));
    return data ?? [];
  } catch {
    return [];
  }
}

export async function addFavorite(
  email: string,
  item: Omit<FavoriteItem, "added_at">
): Promise<FavoriteItem[]> {
  const list = await getFavorites(email);

  // Already exists — no-op
  if (list.some((f) => f.id === item.id)) return list;

  // Cap at MAX_FAVORITES
  if (list.length >= MAX_FAVORITES) {
    list.shift(); // drop oldest
  }

  const entry: FavoriteItem = { ...item, added_at: new Date().toISOString() };
  list.push(entry);

  await kv.set(favKey(email), list, { ex: FAVORITES_TTL });

  // Fire-and-forget preference recompute
  recomputePreferences(email, list).catch(() => {});

  return list;
}

export async function removeFavorite(
  email: string,
  id: string
): Promise<FavoriteItem[]> {
  let list = await getFavorites(email);
  list = list.filter((f) => f.id !== id);
  await kv.set(favKey(email), list, { ex: FAVORITES_TTL });

  // Fire-and-forget preference recompute
  recomputePreferences(email, list).catch(() => {});

  return list;
}

/* ── Preferences ── */

export async function getUserPreferences(
  email: string
): Promise<UserPreferences | null> {
  try {
    return kv.get<UserPreferences>(prefKey(email));
  } catch {
    return null;
  }
}

/**
 * Derive user preferences from their favorites list.
 * Matches favorite names against canonical strains for effects/category.
 */
export async function recomputePreferences(
  email: string,
  favorites?: FavoriteItem[]
): Promise<UserPreferences> {
  const list = favorites ?? (await getFavorites(email));

  // Count product types
  const typeCounts: Record<string, number> = {};
  for (const f of list) {
    typeCounts[f.type] = (typeCounts[f.type] ?? 0) + 1;
  }
  const preferred_types = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  // Match favorites to canonical strains for effects + category
  const effectCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};

  for (const f of list) {
    const match = strains.find(
      (s) =>
        s.id === f.id ||
        f.name.toLowerCase().includes(s.name.toLowerCase())
    );
    if (match) {
      for (const e of match.effects) {
        effectCounts[e] = (effectCounts[e] ?? 0) + 1;
      }
      categoryCounts[match.type] = (categoryCounts[match.type] ?? 0) + 1;
    }
  }

  const preferred_effects = Object.entries(effectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([e]) => e);

  const preferred_category =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const favorite_names = list.map((f) => f.name).slice(-10);

  const prefs: UserPreferences = {
    preferred_types,
    preferred_effects,
    price_range: [null, null], // could derive from inventory prices later
    preferred_category,
    favorite_names,
    updated_at: new Date().toISOString(),
  };

  await kv.set(prefKey(email), prefs, { ex: FAVORITES_TTL });
  return prefs;
}
