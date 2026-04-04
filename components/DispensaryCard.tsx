import { Dispensary } from "@/lib/dispensaries";

export default function DispensaryCard({
  dispensary,
}: {
  dispensary: Dispensary;
}) {
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

      {/* Bottom: links — pinned to bottom */}
      <div className="px-4 pb-4 flex gap-5 mt-auto shrink-0">
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
    </div>
  );
}
