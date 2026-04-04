"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Section {
  id: string;
  question: string;
}

export default function AboutNav({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Mobile: horizontal pill row */}
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-3 -mx-4 px-4 cards-scroll">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`shrink-0 text-[11px] font-bold tracking-widest uppercase px-4 py-2 rounded-sm transition-colors whitespace-nowrap ${
              activeId === s.id
                ? "bg-amber text-forest-deep"
                : "border border-forest-mid text-cream-muted hover:border-amber/40 hover:text-cream"
            }`}
          >
            {s.question}
          </button>
        ))}
      </div>

      {/* Desktop: sticky vertical sidebar */}
      <nav className="hidden lg:flex flex-col gap-1 sticky top-20">
        <p className="text-amber/60 text-[10px] tracking-[0.3em] uppercase font-bold mb-3 px-3">
          Topics
        </p>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`text-left text-sm px-3 py-2.5 rounded-sm transition-colors leading-snug border-l-2 ${
              activeId === s.id
                ? "bg-amber/15 text-amber border-amber"
                : "text-cream-muted hover:text-cream hover:bg-forest-mid/30 border-transparent"
            }`}
          >
            {s.question}
          </button>
        ))}

        <div className="mt-8 pt-8 border-t border-forest-mid/40 px-3 flex flex-col gap-3">
          <Link
            href="/trail"
            className="text-amber text-xs font-bold tracking-widest uppercase hover:text-amber/70 transition-colors"
          >
            Explore the Cannatrail ↗
          </Link>
          <Link
            href="/strain"
            className="text-amber text-xs font-bold tracking-widest uppercase hover:text-amber/70 transition-colors"
          >
            Strain Library ↗
          </Link>
        </div>
      </nav>
    </>
  );
}
