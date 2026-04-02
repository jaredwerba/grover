"use client";

import { useState } from "react";
import { Dispensary } from "@/lib/dispensaries";
import DispensaryCard from "./DispensaryCard";

type Filter = "all" | "recreational" | "medical";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "recreational", label: "Recreational" },
  { value: "medical", label: "Medical" },
];

export default function TrailClient({
  dispensaries,
}: {
  dispensaries: Dispensary[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all"
      ? dispensaries
      : dispensaries.filter((d) => d.tags.includes(filter));

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-8">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-5 py-2 rounded-sm text-xs font-bold tracking-widest uppercase transition-colors ${
              filter === value
                ? "bg-amber text-forest-deep"
                : "border-2 border-forest-mid text-cream-muted hover:border-amber/40 hover:text-cream"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-cream-muted text-sm self-center">
          {filtered.length} location{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="text-cream-muted text-center py-16">
          No dispensaries match this filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => (
            <DispensaryCard key={d.id} dispensary={d} />
          ))}
        </div>
      )}
    </div>
  );
}
