import { Dispensary } from "@/lib/dispensaries";
import type { ShopInventoryMeta } from "@/lib/inventory";

export default function DispensaryCard({
  dispensary,
  inventoryMeta,
}: {
  dispensary: Dispensary;
  inventoryMeta?: ShopInventoryMeta | null;
}) {
  const liveBadge = formatInventoryBadge(inventoryMeta);

  return (
    <div
      className="bg-forest border-2 border-forest-mid rounded-sm hover:border-amber/40 transition-colors flex flex-col h-full"
      style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)" }}
    >
      {/* Top: name + city + phone */}
      <div className="px-4 pt-4 pb-3 border-b border-forest-mid/60 shrink-0">
        <h3 className="text-cream font-groovy text-lg leading-tight tracking-wide mb-1 break-words">
          {dispensary.name}
        </h3>
        <p className="text-cream-muted text-xs">
          {dispensary.city} · {dispensary.phone}
        </p>
      </div>

      {/* Middle: tags */}
      <div className="px-4 py-2 flex flex-wrap gap-1.5 shrink-0">
        {dispensary.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] border border-amber/40 text-amber/80 px-2 py-0.5 rounded-sm capitalize font-semibold tracking-wider uppercase"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom: links + optional live-inventory badge */}
      <div className="px-4 pb-4 mt-auto shrink-0">
        <div className="flex gap-5">
          <a
            href={dispensary.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber hover:text-amber-hover transition-colors font-bold tracking-wider uppercase"
            onClick={(e) => e.stopPropagation()}
          >
            Website ↗
          </a>
          <a
            href={dispensary.menu_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber hover:text-amber-hover transition-colors font-bold tracking-wider uppercase"
            onClick={(e) => e.stopPropagation()}
          >
            Menu ↗
          </a>
        </div>
        {liveBadge && (
          <p className="mt-2 text-[10px] text-cream-muted/60 tracking-wide flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-amber/60 animate-pulse"
              aria-hidden="true"
            />
            {liveBadge}
          </p>
        )}
      </div>
    </div>
  );
}

function formatInventoryBadge(
  meta: ShopInventoryMeta | null | undefined
): string | null {
  if (!meta || meta.status !== "ok" || meta.item_count <= 0) return null;
  const last = new Date(meta.last_synced).getTime();
  if (Number.isNaN(last)) return `${meta.item_count} products in stock`;
  const ageMs = Date.now() - last;
  const min = Math.floor(ageMs / 60000);
  let age: string;
  if (min < 1) age = "just now";
  else if (min < 60) age = `${min}m ago`;
  else if (min < 60 * 24) age = `${Math.floor(min / 60)}h ago`;
  else age = `${Math.floor(min / (60 * 24))}d ago`;
  return `${meta.item_count} products in stock · synced ${age}`;
}
