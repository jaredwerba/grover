import { Dispensary } from "@/lib/dispensaries";

export default function DispensaryCard({
  dispensary,
}: {
  dispensary: Dispensary;
}) {
  return (
    <div
      className="bg-forest border-2 border-forest-mid p-5 rounded-sm hover:border-amber/40 transition-colors relative flex flex-col h-full overflow-y-auto"
      style={{ maxHeight: "420px" }}
      style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)" }}
    >
      {/* Name */}
      <h3 className="text-cream font-groovy text-2xl leading-tight tracking-wide mb-3 break-words">
        {dispensary.name}
      </h3>

      {/* Address + phone */}
      <p className="text-cream text-sm mb-0.5 break-words">
        {dispensary.address}, {dispensary.city}
      </p>
      <p className="text-cream-muted text-sm mb-4">{dispensary.phone}</p>

      {/* Description */}
      <p className="text-cream text-sm leading-relaxed mb-4">
        {dispensary.description}
      </p>

      {/* Hours */}
      <div className="border-t border-forest-mid pt-4 mb-4">
        <p className="text-xs text-amber/70 font-semibold tracking-widest uppercase mb-2">Hours</p>
        <div className="text-sm text-cream-muted space-y-1">
          <div className="flex justify-between gap-4">
            <span className="shrink-0">Mon – Fri</span>
            <span className="text-cream text-right">{dispensary.hours.mon_fri}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="shrink-0">Saturday</span>
            <span className="text-cream text-right">{dispensary.hours.sat}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="shrink-0">Sunday</span>
            <span className="text-cream text-right">{dispensary.hours.sun}</span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-6 mb-4">
        <a
          href={dispensary.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-amber hover:text-amber-hover transition-colors font-bold tracking-wider uppercase"
        >
          Website ↗
        </a>
        <a
          href={dispensary.menu_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-amber hover:text-amber-hover transition-colors font-bold tracking-wider uppercase"
        >
          Menu ↗
        </a>
      </div>

      {/* Tags — bottom of card */}
      <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-forest-mid/60">
        {dispensary.tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] border border-amber/40 text-amber/80 px-2.5 py-1 rounded-sm capitalize font-semibold tracking-wider uppercase"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
