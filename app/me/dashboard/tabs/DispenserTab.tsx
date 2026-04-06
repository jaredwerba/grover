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

const TOP_SELLERS = [
  { name: "Blue Dream 3.5g", units: 48, pct: 100, revenue: 864 },
  { name: "OG Kush Pre-Roll 5pk", units: 36, pct: 75, revenue: 540 },
  { name: "Sour Diesel 1g", units: 29, pct: 60, revenue: 290 },
  { name: "Wedding Cake Vape", units: 22, pct: 46, revenue: 770 },
  { name: "Charlotte's Web 30ct", units: 18, pct: 38, revenue: 630 },
];

const HOURLY = [
  { hour: "9a", val: 3 },
  { hour: "10a", val: 7 },
  { hour: "11a", val: 11 },
  { hour: "12p", val: 14 },
  { hour: "1p", val: 9 },
  { hour: "2p", val: 8 },
  { hour: "3p", val: 12 },
  { hour: "4p", val: 18 },
  { hour: "5p", val: 22 },
  { hour: "6p", val: 15 },
];

const maxHourly = Math.max(...HOURLY.map((h) => h.val));

const LOW_STOCK = [
  { name: "Pineapple Express 7g", remaining: 4, reorder: 10 },
  { name: "Gorilla Glue Vape", remaining: 2, reorder: 8 },
  { name: "Gelato Pre-Roll 1pk", remaining: 6, reorder: 12 },
];

const WEEK_REV = [
  { day: "M", val: 2840 },
  { day: "T", val: 3120 },
  { day: "W", val: 2670 },
  { day: "T", val: 3450 },
  { day: "F", val: 4180 },
  { day: "S", val: 5220 },
  { day: "S", val: 3890 },
];

const maxWeekRev = Math.max(...WEEK_REV.map((w) => w.val));

export default function DispenserTab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const revenue = useCountUp(25370, 1300, 100);
  const transactions = useCountUp(312, 1000, 200);
  const avgBasket = useCountUp(81, 900, 300);

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
        <StatCard label="MTD Revenue" value={`$${revenue.toLocaleString()}`} />
        <StatCard label="Transactions" value={`${transactions}`} unit="this month" />
        <StatCard label="Avg Basket" value={`$${avgBasket}`} />
      </div>

      {/* Top Sellers */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(80)}>
        <h3 className="text-cream font-semibold text-sm mb-4">Top Sellers</h3>
        <div className="space-y-3">
          {TOP_SELLERS.map((p, i) => (
            <div key={p.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-cream">{p.name}</span>
                <span className="text-cream-muted">{p.units} units</span>
              </div>
              <div className="h-2 bg-forest-mid rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber rounded-full"
                  style={{
                    width: mounted ? `${p.pct}%` : "0%",
                    opacity: 1 - i * 0.12,
                    transition: `width 700ms cubic-bezier(0.16,1,0.3,1) ${120 + i * 90}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Traffic */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(160)}>
        <h3 className="text-cream font-semibold text-sm mb-1">Today&apos;s Traffic</h3>
        <p className="text-cream-muted/60 text-[10px] mb-4">Transactions by hour</p>
        <div className="flex items-end gap-1.5" style={{ height: 80 }}>
          {HOURLY.map((h, i) => (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end" style={{ height: 60 }}>
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    backgroundColor: h.hour === "5p" ? "#FFB900" : "rgba(255,185,0,0.45)",
                    height: mounted ? `${(h.val / maxHourly) * 100}%` : "3px",
                    minHeight: 3,
                    transition: `height 500ms cubic-bezier(0.16,1,0.3,1) ${200 + i * 45}ms`,
                  }}
                />
              </div>
              <span className="text-[9px] text-cream-muted leading-none">{h.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Revenue Sparkline */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(240)}>
        <h3 className="text-cream font-semibold text-sm mb-1">Weekly Revenue</h3>
        <p className="text-cream-muted/60 text-[10px] mb-4">This week vs daily</p>
        <div className="flex items-end gap-2" style={{ height: 80 }}>
          {WEEK_REV.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-end" style={{ height: 60 }}>
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    backgroundColor: w.val === maxWeekRev ? "#FFB900" : "rgba(255,185,0,0.5)",
                    height: mounted ? `${(w.val / maxWeekRev) * 100}%` : "3px",
                    minHeight: 3,
                    transition: `height 500ms cubic-bezier(0.16,1,0.3,1) ${280 + i * 55}ms`,
                  }}
                />
              </div>
              <span className="text-[10px] text-cream-muted">{w.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-forest rounded-2xl border border-forest-mid p-5" style={card(320)}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-cream font-semibold text-sm">Low Stock Alerts</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber/20 text-amber">
            {LOW_STOCK.length} items
          </span>
        </div>
        <div className="space-y-2.5">
          {LOW_STOCK.map((item) => {
            const pct = Math.round((item.remaining / item.reorder) * 100);
            return (
              <div key={item.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-cream">{item.name}</span>
                  <span className="text-amber text-[10px]">{item.remaining} left</span>
                </div>
                <div className="h-1.5 bg-forest-mid rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber/60"
                    style={{
                      width: mounted ? `${pct}%` : "0%",
                      transition: `width 600ms cubic-bezier(0.16,1,0.3,1) 400ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
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
