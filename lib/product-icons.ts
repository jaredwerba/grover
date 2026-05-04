/**
 * Shared mapping from ProductType (or category filter value) to icon paths.
 *
 * Three icon sets are available:
 *   /images/icons/3d/      — semi-realistic 3D renders (transparent bg)
 *   /images/icons/2d-white/ — clean line-art, white on transparent (for dark bg)
 *   /images/icons/2d-dark/  — same line-art, dark gray (for light/amber bg)
 *   /images/icons/photo/    — photorealistic renders
 */

export type IconSet = "3d" | "2d-white" | "2d-dark" | "photo";

const ICON_MAP: Record<string, string> = {
  flower: "flower",
  preroll: "preroll",
  vape: "vape",
  cartridge: "cartridge",
  concentrate: "concentrate",
  edible: "edible",
  drink: "drink",
  tincture: "tincture",
  topical: "topical",
  accessory: "accessory",
  other: "misc",
  cbd: "cbd",
  infused: "infused",
  seeds: "seeds",
  apparel: "apparel",
};

/**
 * Returns the icon path for a product type / category value.
 * Falls back to "misc" if the type isn't mapped.
 */
export function productIcon(
  type: string,
  set: IconSet = "3d"
): string {
  const file = ICON_MAP[type] ?? "misc";
  return `/images/icons/${set}/${file}.png`;
}
