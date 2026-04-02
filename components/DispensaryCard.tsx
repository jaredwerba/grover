import { Dispensary } from "@/lib/dispensaries";

export default function DispensaryCard({
  dispensary,
}: {
  dispensary: Dispensary;
}) {
  return (
    <div
      className="bg-forest border-2 border-forest-mid p-5 rounded-sm hover:border-amber/40 transition-colors relative"
      style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-cream font-groovy text-lg leading-snug">
          {dispensary.name}
        </h3>
        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
          {dispensary.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] border border-amber/30 text-amber/70 px-2 py-0.5 rounded-sm capitalize font-semibold tracking-wider uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="text-cream-muted text-sm mb-0.5">
        {dispensary.address}, {dispensary.city}
      </p>
      <p className="text-cream-muted text-sm mb-4">{dispensary.phone}</p>
      <p className="text-cream text-sm leading-relaxed mb-4">
        {dispensary.description}
      </p>

      <div className="border-t border-forest-mid pt-4 mb-4">
        <p className="text-xs text-amber/60 font-semibold tracking-widest uppercase mb-2">Hours</p>
        <div className="text-xs text-cream-muted space-y-0.5">
          <div className="flex justify-between">
            <span>Mon – Fri</span>
            <span>{dispensary.hours.mon_fri}</span>
          </div>
          <div className="flex justify-between">
            <span>Saturday</span>
            <span>{dispensary.hours.sat}</span>
          </div>
          <div className="flex justify-between">
            <span>Sunday</span>
            <span>{dispensary.hours.sun}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <a
          href={dispensary.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber hover:text-amber-hover transition-colors font-bold tracking-widest uppercase"
        >
          Website ↗
        </a>
        <a
          href={dispensary.menu_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber hover:text-amber-hover transition-colors font-bold tracking-widest uppercase"
        >
          View Menu ↗
        </a>
      </div>
    </div>
  );
}
