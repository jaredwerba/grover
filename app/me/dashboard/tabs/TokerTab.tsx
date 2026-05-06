"use client";

import { useState, useEffect } from "react";

interface FavoriteItem {
  id: string;
  kind: "strain" | "product";
  name: string;
  type: string;
  added_at: string;
}

interface UserPreferences {
  preferred_types: string[];
  preferred_effects: string[];
  preferred_category: string | null;
  favorite_names: string[];
}

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    timeout = setTimeout(() => {
      const steps = 50;
      const stepTime = duration / steps;
      let step = 0;
      interval = setInterval(() => {
        step++;
        const t = step / steps;
        setCount(Math.round(t * (2 - t) * target));
        if (step >= steps) { setCount(target); clearInterval(interval); }
      }, stepTime);
    }, delay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [target, duration, delay]);
  return count;
}

export default function TokerTab() {
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/user/favorites").then((r) => (r.ok ? r.json() : { favorites: [] })),
      fetch("/api/user/preferences").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([favData, prefData]) => {
        setFavorites(favData.favorites ?? []);
        setPrefs(prefData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Derive display data from real favorites
  const topStrains = favorites.slice(-4).reverse().map((f, i, arr) => ({
    name: f.name,
    pct: Math.round(((arr.length - i) / arr.length) * 100),
  }));

  const effectColors = ["#10b981", "#FFB900", "#818cf8", "#fb7185"];
  const topEffects = (prefs?.preferred_effects ?? []).slice(0, 4).map((e, i, arr) => ({
    label: e,
    pct: Math.round(((arr.length - i) / arr.length) * 80),
    color: effectColors[i] ?? "#94a3b8",
  }));

  const topTypes = (prefs?.preferred_types ?? []).slice(0, 3).map((t, i) => ({
    name: t[0].toUpperCase() + t.slice(1),
    count: favorites.filter((f) => f.type === t).length,
  }));

  const favCount = useCountUp(favorites.length, 900, 100);

  function card(delay: number): React.CSSProperties {
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(14px)",
      transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
    };
  }

  // Empty state
  if (!loading && favorites.length === 0) {
    return (
      <div className="text-center py-10" style={card(0)}>
        <p className="text-cream-muted text-sm mb-3">No favorites yet</p>
        <a
          href="/strain"
          className="text-amber text-sm font-semibold hover:underline"
        >
          Explore the Strain Library &rarr;
        </a>
      </div>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-forest rounded-2xl border border-forest-mid p-5 h-28 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3" style={card(0)}>
        <StatCard label="Favorites" value={`${favCount}`} unit="saved" />
        <StatCard
          label="Category"
          value={prefs?.preferred_category ?? "—"}
        />
        <StatCard
          label="Top Type"
          value={topTypes[0]?.name ?? "—"}
        />
      </div>

      {/* Top Strains */}
      {topStrains.length > 0 && (
        <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(80)}>
          <h3 className="text-cream font-semibold text-sm mb-4">Favorites</h3>
          <div className="space-y-3">
            {topStrains.map((s, i) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-cream">{s.name}</span>
                </div>
                <div className="h-2 bg-forest-mid rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber rounded-full"
                    style={{
                      width: mounted ? `${s.pct}%` : "0%",
                      opacity: 1 - i * 0.15,
                      transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${120 + i * 100}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Effects */}
      {topEffects.length > 0 && (
        <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(160)}>
          <h3 className="text-cream font-semibold text-sm mb-4">Preferred Effects</h3>
          <div className="space-y-3">
            {topEffects.map((e, i) => (
              <div key={e.label} className="flex items-center gap-3">
                <span className="text-xs text-cream-muted w-16 shrink-0">{e.label}</span>
                <div className="flex-1 h-2 bg-forest-mid rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: mounted ? `${e.pct}%` : "0%",
                      backgroundColor: e.color,
                      transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${200 + i * 80}ms`,
                    }}
                  />
                </div>
                <span className="text-xs text-cream-muted w-8 text-right shrink-0">{e.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Types */}
      {topTypes.length > 0 && (
        <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(240)}>
          <h3 className="text-cream font-semibold text-sm mb-3">Preferred Types</h3>
          <div className="space-y-2.5">
            {topTypes.map((t) => (
              <div key={t.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
                  <span className="text-cream-muted text-sm">{t.name}</span>
                </div>
                <span className="text-cream-muted/60 text-xs">{t.count} favorited</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="bg-forest rounded-2xl border border-forest-mid p-4">
      <p className="text-cream-muted text-[10px] uppercase tracking-widest mb-1.5 leading-none">
        {label}
      </p>
      <p className="text-amber font-bold text-xl leading-none">{value}</p>
      {unit && <p className="text-cream-muted/60 text-[10px] mt-1">{unit}</p>}
    </div>
  );
}
