"use client";

import { useState, useEffect } from "react";

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

const STRAINS = [
  { name: "Blue Dream", sessions: 12, pct: 80 },
  { name: "OG Kush", sessions: 8, pct: 53 },
  { name: "Sour Diesel", sessions: 5, pct: 33 },
  { name: "Pineapple Express", sessions: 3, pct: 20 },
];

const EFFECTS = [
  { label: "Relaxed", pct: 45, color: "#10b981" },
  { label: "Creative", pct: 28, color: "#FFB900" },
  { label: "Sleepy", pct: 18, color: "#818cf8" },
  { label: "Energized", pct: 9, color: "#fb7185" },
];

const WEEK = [
  { day: "M", val: 1 },
  { day: "T", val: 2 },
  { day: "W", val: 0 },
  { day: "T", val: 2 },
  { day: "F", val: 3 },
  { day: "S", val: 4 },
  { day: "S", val: 2 },
];

const maxWeek = Math.max(...WEEK.map((w) => w.val));

const DISPENSARIES = [
  { name: "Ceres Natural Remedies", visits: 7 },
  { name: "Champlain Valley Dispensary", visits: 2 },
  { name: "Vermont Dispensary", visits: 1 },
];

export default function TokerTab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const sessions = useCountUp(7, 900, 100);
  const spend = useCountUp(124, 1100, 200);

  function card(delay: number): React.CSSProperties {
    return {
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(14px)",
      transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
    };
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3" style={card(0)}>
        <StatCard label="This Week" value={`${sessions}`} unit="sessions" />
        <StatCard label="Streak" value="4" unit="days" />
        <StatCard label="Month Spend" value={`$${spend}`} />
      </div>

      {/* Top Strains */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(80)}>
        <h3 className="text-cream font-semibold text-sm mb-4">Top Strains</h3>
        <div className="space-y-3">
          {STRAINS.map((s, i) => (
            <div key={s.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-cream">{s.name}</span>
                <span className="text-cream-muted">{s.sessions} sessions</span>
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

      {/* Effects */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(160)}>
        <h3 className="text-cream font-semibold text-sm mb-4">Effects Logged</h3>
        <div className="space-y-3">
          {EFFECTS.map((e, i) => (
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

      {/* Weekly Activity */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(240)}>
        <h3 className="text-cream font-semibold text-sm mb-4">This Week</h3>
        <div className="flex items-end gap-2" style={{ height: 80 }}>
          {WEEK.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end" style={{ height: 60 }}>
                <div
                  className="w-full rounded-t-sm bg-amber/70"
                  style={{
                    height: mounted && w.val > 0 ? `${(w.val / maxWeek) * 100}%` : "3px",
                    opacity: w.val === 0 ? 0.15 : 1,
                    transition: `height 500ms cubic-bezier(0.16,1,0.3,1) ${300 + i * 55}ms`,
                    minHeight: 3,
                  }}
                />
              </div>
              <span className="text-[10px] text-cream-muted">{w.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Dispensaries */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(320)}>
        <h3 className="text-cream font-semibold text-sm mb-3">Recent Dispensaries</h3>
        <div className="space-y-2.5">
          {DISPENSARIES.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
                <span className="text-cream-muted text-sm">{d.name}</span>
              </div>
              <span className="text-cream-muted/60 text-xs">{d.visits} visits</span>
            </div>
          ))}
        </div>
      </div>
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
