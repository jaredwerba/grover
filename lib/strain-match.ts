import { strains } from "./strains";

/**
 * Cove Connect — fuzzy strain-name matcher.
 *
 * Maps a raw product name from a dispensary menu (e.g.
 * "Florist | Blue Dream 3.5g") to a canonical strain ID
 * from lib/strains.ts (e.g. "blue-dream"), or null when no
 * confident match exists.
 *
 * Strategy:
 *   1. Normalize: lowercase, strip brand prefixes ("Florist | "),
 *      drop weights/sizes ("3.5g", "1g"), strip punctuation, tokenize.
 *   2. Manual override map for known aliases (e.g. "GG4" → gorilla-glue-4).
 *   3. Token-set inclusion: how many tokens of the canonical strain
 *      appear (in order or otherwise) in the product name?
 *   4. Threshold: only assign when score >= MATCH_THRESHOLD.
 *
 * No external dep — small Levenshtein helper inline.
 */

const MATCH_THRESHOLD = 0.85; // 85% token coverage of the canonical name

/**
 * Manual override / alias table. Add real-world aliases as we
 * see them in the wild. Map: alias substring (already normalized
 * the same way as product names) → canonical strain id.
 */
const ALIASES: Array<{ pattern: RegExp; strainId: string }> = [
  { pattern: /\bgg ?4\b/, strainId: "gorilla-glue-4" },
  { pattern: /\bggg\b/, strainId: "gorilla-glue-4" },
  { pattern: /\bgrandaddy\b/, strainId: "granddaddy-purple" },
  { pattern: /\bgdp\b/, strainId: "granddaddy-purple" },
  { pattern: /\bog\b(?!.*\bkush\b)/, strainId: "og-kush" },
  { pattern: /\bnl\b/, strainId: "northern-lights" },
  { pattern: /\bzkittles\b/, strainId: "zkittlez" },
  { pattern: /\bmac1\b/, strainId: "mac-1" },
];

/** Words that are noise in dispensary product names. */
const STOP_TOKENS = new Set([
  "the",
  "a",
  "an",
  "of",
  "and",
  "or",
  "with",
  "from",
  "by",
  "rec",
  "med",
  "medical",
  "recreational",
  "premium",
  "exotic",
  "hybrid",
  "indica",
  "sativa",
  "flower",
  "preroll",
  "prerolls",
  "vape",
  "cart",
  "cartridge",
  "edible",
  "drink",
  "tincture",
  "topical",
  "concentrate",
  "extract",
  "live",
  "resin",
  "rosin",
  "shatter",
  "wax",
  "kief",
  "pre",
  "roll",
  "cone",
  "joint",
  "blunt",
  "infused",
  "x",
  "pack",
  "pk",
]);

/** Strip weights/sizes/units that show up in product names. */
const SIZE_REGEX =
  /\b\d+(?:\.\d+)?\s*(?:g|gr|gram|grams|mg|oz|ounce|ml|pc|pcs|pack|pk|count|ct)\b/gi;

function normalize(raw: string): string {
  let s = raw.toLowerCase();

  // Strip brand prefix: "Florist | BEAVS" -> "BEAVS",
  // "Sunset Lake | Bermuda Triangle" -> "Bermuda Triangle".
  // Whitespace-flanked only — must NOT split intra-word punctuation
  // like "Pre-Roll" or "1/4oz".
  const sep = /\s+[|:]\s+/;
  if (sep.test(s)) {
    const parts = s.split(sep).filter(Boolean);
    if (parts.length >= 2) s = parts.slice(1).join(" ");
  }

  // Drop sizes (3.5g, 100mg, 1oz, 5pk, ...)
  s = s.replace(SIZE_REGEX, " ");

  // Drop trademark / hashtag noise
  s = s.replace(/[®™©#]/g, " ");

  // Punctuation -> space
  s = s.replace(/[^a-z0-9 ]+/g, " ");

  // Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function tokenize(normalized: string): string[] {
  return normalized
    .split(" ")
    .filter((t) => t.length > 0 && !STOP_TOKENS.has(t));
}

/** Cheap Levenshtein for short strings, used as a tiebreaker. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const m = a.length;
  const n = b.length;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

/** Pre-compute and cache canonical name normalization. */
interface CanonicalEntry {
  id: string;
  name: string;
  normalized: string;
  tokens: string[];
}

let canonicalIndex: CanonicalEntry[] | null = null;
function getCanonical(): CanonicalEntry[] {
  if (canonicalIndex) return canonicalIndex;
  canonicalIndex = strains.map((s) => {
    const normalized = normalize(s.name);
    return {
      id: s.id,
      name: s.name,
      normalized,
      tokens: tokenize(normalized),
    };
  });
  return canonicalIndex;
}

export interface MatchResult {
  strainId: string;
  confidence: number;
  via: "alias" | "fuzzy";
}

export function matchStrain(productName: string): MatchResult | null {
  const norm = normalize(productName);
  if (!norm) return null;

  // 1. Aliases first — high-confidence rules.
  for (const a of ALIASES) {
    if (a.pattern.test(norm)) {
      return { strainId: a.strainId, confidence: 1.0, via: "alias" };
    }
  }

  // 2. Token-set inclusion.
  const productTokens = new Set(tokenize(norm));
  if (productTokens.size === 0) return null;

  let best: MatchResult | null = null;
  for (const c of getCanonical()) {
    if (c.tokens.length === 0) continue;
    // How many canonical tokens are present in the product tokens?
    let hits = 0;
    for (const t of c.tokens) if (productTokens.has(t)) hits++;
    let score = hits / c.tokens.length;

    // Cheap fuzzy fallback when score is borderline: allow a single
    // token off-by-one (e.g. "zkittles" vs "zkittlez").
    if (score < 1 && c.tokens.length > 0) {
      let fuzzyHits = hits;
      for (const ct of c.tokens) {
        if (productTokens.has(ct)) continue;
        for (const pt of productTokens) {
          if (Math.abs(pt.length - ct.length) > 2) continue;
          if (levenshtein(pt, ct) <= 1 && ct.length >= 4) {
            fuzzyHits += 0.9;
            break;
          }
        }
      }
      score = Math.max(score, fuzzyHits / c.tokens.length);
    }

    if (score >= MATCH_THRESHOLD && (!best || score > best.confidence)) {
      best = { strainId: c.id, confidence: score, via: "fuzzy" };
    }
  }

  return best;
}

/** Apply matchStrain to a NormalizedItem in place. Convenience. */
export function tagWithStrain<T extends { name: string; strain_id: string | null }>(
  item: T
): T {
  if (item.strain_id) return item; // already set, don't override
  const m = matchStrain(item.name);
  if (m) item.strain_id = m.strainId;
  return item;
}
