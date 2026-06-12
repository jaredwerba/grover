"use client";

/**
 * Cove for Business — B2B conversion landing page (/business).
 *
 * A standalone marketing page aimed at Vermont dispensary owners,
 * growers, and manufacturers. Everything is animated with Motion:
 * scroll-triggered section reveals, count-up stats, parallax floating
 * cards in the hero, and an infinite dispensary marquee. The existing
 * consumer landing page at / is untouched.
 *
 * All animation is transform/opacity only (GPU-composited), gated by
 * useReducedMotion for accessibility.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { dispensaries } from "@/lib/dispensaries";
import { strains } from "@/lib/strains";

/* ── Shared animation variants ── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/* ── Count-up (same easing family as the AAI dashboards) ── */

function useCountUp(target: number, duration = 1200, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const steps = 50;
    const stepTime = duration / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const t = step / steps;
      setCount(Math.round(t * (2 - t) * target));
      if (step >= steps) {
        setCount(target);
        clearInterval(interval);
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [target, duration, active]);
  return count;
}

/* ════════════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════════════ */

export default function BusinessLanding() {
  return (
    <main className="relative text-cream overflow-x-clip" style={{ background: "#081f12" }}>
      <Aurora />
      <Hero />
      <ProofStrip />
      <div id="platform">
        <FeatureDashboards />
        <FeaturePassport />
        <FeatureAI />
      </div>
      <RetentionLoop />
      <StatsBand />
      <HowItWorks />
      <FinalCTA />
    </main>
  );
}

/* ── Aurora background — slow-drifting blurred color fields ── */

function Aurora() {
  const reduce = useReducedMotion();
  const blobs = [
    { color: "rgba(0,119,73,0.35)", size: 560, top: "-8%", left: "-10%", dur: 26 },
    { color: "rgba(255,185,0,0.10)", size: 480, top: "12%", left: "65%", dur: 32 },
    { color: "rgba(91,143,168,0.16)", size: 520, top: "55%", left: "-12%", dur: 38 },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={
            reduce
              ? undefined
              : { x: [0, 60, -40, 0], y: [0, -50, 30, 0], scale: [1, 1.15, 0.95, 1] }
          }
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Fine grain so the gradients don't band */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(247,238,216,0.8) 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}

/* ── Hero ── */

const HEADLINE_WORDS = ["Know", "your", "market", "before", "they", "walk", "in."];

function Hero() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Parallax: floating cards drift at different speeds as you scroll away
  const yslow = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const yFast = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <section
      ref={heroRef}
      className="relative z-10 flex flex-col items-center px-6 pt-16 sm:pt-24 pb-10 text-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src="/images/logotrans.png"
          alt="Cove"
          width={220}
          height={92}
          priority
          className="h-16 sm:h-20 w-auto"
        />
      </motion.div>

      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="mt-8 text-amber/80 text-[11px] sm:text-xs tracking-[0.35em] uppercase font-bold"
      >
        Cove for Business
      </motion.p>

      {/* Word-staggered headline — words are aria-hidden (margins, not
          spaces, separate them); the label carries the real sentence. */}
      <h1
        aria-label="Know your market before they walk in."
        className="mt-4 max-w-3xl text-4xl sm:text-6xl font-bold leading-[1.05] tracking-tight"
      >
        {HEADLINE_WORDS.map((word, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="inline-block mr-[0.28em]"
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              delay: 0.35 + i * 0.07,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word === "market" ? (
              <span className="text-amber">{word}</span>
            ) : (
              word
            )}
          </motion.span>
        ))}
      </h1>

      {/* Subhead */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.7 }}
        className="mt-6 max-w-xl text-cream/75 text-base sm:text-lg leading-relaxed"
      >
        Cove turns live menus, consumer demand, and verified in-store
        visits into a dashboard your shop can act on — built exclusively
        for Vermont cannabis.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.7 }}
        className="mt-9 flex flex-col sm:flex-row gap-3"
      >
        <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/me"
            className="inline-block bg-amber text-forest-deep font-bold px-10 py-4 rounded-full text-sm tracking-widest uppercase shadow-lg shadow-amber/25 hover:bg-amber-hover transition-colors"
          >
            Request Access
          </Link>
        </motion.span>
        <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
          <a
            href="#platform"
            className="inline-block border border-amber/40 text-amber px-8 py-4 rounded-full text-xs tracking-widest uppercase hover:border-amber/70 hover:bg-amber/10 transition-colors"
          >
            Explore the Platform
          </a>
        </motion.span>
      </motion.div>

      {/* Floating dashboard cards — parallax cluster */}
      <div className="relative mt-16 w-full max-w-4xl h-[300px] sm:h-[340px]">
        <FloatingCard
          style={{ y: yMid }}
          className="left-1/2 -translate-x-1/2 top-0 w-[300px] sm:w-[360px] z-10"
          delay={1.3}
          float={!reduce}
        >
          <DemandMock />
        </FloatingCard>

        <FloatingCard
          style={{ y: yFast }}
          className="hidden sm:block left-[4%] top-12 w-[200px]"
          delay={1.5}
          float={!reduce}
        >
          <MiniStatMock label="Passport scans · 7 days" value="187" trend="+32%" />
        </FloatingCard>

        <FloatingCard
          style={{ y: yslow }}
          className="hidden sm:block right-[4%] top-20 w-[210px]"
          delay={1.65}
          float={!reduce}
        >
          <MiniStatMock label="Products live on Cove" value="142" trend="synced 12m ago" />
        </FloatingCard>
      </div>

      {/* Dispensary marquee */}
      <Marquee />
    </section>
  );
}

function FloatingCard({
  children,
  className,
  style,
  delay,
  float,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.ComponentProps<typeof motion.div>["style"];
  delay: number;
  float: boolean;
}) {
  return (
    <motion.div className={`absolute ${className ?? ""}`} style={style}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={float ? { y: [0, -8, 0] } : undefined}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
          className="rounded-2xl border border-amber/15 p-4"
          style={{
            background: "rgba(11,45,27,0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow:
              "0 24px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(247,238,216,0.06)",
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function DemandMock() {
  const bars = [
    { name: "Blue Dream", pct: 96 },
    { name: "Sour Diesel", pct: 74 },
    { name: "OG Kush", pct: 62 },
    { name: "Wedding Cake", pct: 41 },
  ];
  return (
    <div className="text-left">
      <div className="flex items-center justify-between mb-3">
        <p className="text-cream font-semibold text-xs">Demand Radar</p>
        <span className="flex items-center gap-1.5 text-[9px] text-cream-muted/70 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
          Live
        </span>
      </div>
      <div className="space-y-2.5">
        {bars.map((b, i) => (
          <div key={b.name}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-cream/90">{b.name}</span>
              <span className="text-cream-muted">{b.pct}</span>
            </div>
            <div className="h-1.5 bg-forest-mid/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${b.pct}%` }}
                transition={{
                  delay: 1.6 + i * 0.12,
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ opacity: 1 - i * 0.14 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStatMock({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="text-left">
      <p className="text-cream-muted text-[9px] uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-amber font-bold text-2xl leading-none tabular-nums">{value}</p>
      <p className="text-cream-muted/70 text-[10px] mt-1.5">{trend}</p>
    </div>
  );
}

/* ── Infinite dispensary marquee ── */

function Marquee() {
  const reduce = useReducedMotion();
  const names = dispensaries.slice(0, 20).map((d) => d.name);
  const row = [...names, ...names]; // duplicate for seamless loop
  return (
    <div className="relative mt-14 w-full max-w-5xl overflow-hidden" aria-hidden="true">
      {/* Edge fades */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
        style={{ background: "linear-gradient(to right, #081f12, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
        style={{ background: "linear-gradient(to left, #081f12, transparent)" }}
      />
      <motion.div
        className="flex gap-3 whitespace-nowrap w-max"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
      >
        {row.map((name, i) => (
          <span
            key={i}
            className="text-cream-muted/60 text-[11px] tracking-wider uppercase border border-forest-mid/60 rounded-full px-4 py-1.5"
          >
            {name}
          </span>
        ))}
      </motion.div>
      <p className="mt-4 text-center text-cream-muted/50 text-[10px] tracking-[0.3em] uppercase">
        Licensed Vermont dispensaries, live on Cove
      </p>
    </div>
  );
}

/* ── Proof strip — animated counts ── */

function ProofStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const shops = useCountUp(dispensaries.length, 1200, inView);
  const trails = useCountUp(4, 900, inView);
  const strainCount = useCountUp(strains.length, 1400, inView);

  const items = [
    { value: shops, label: "Licensed VT dispensaries" },
    { value: trails, label: "Regions covered" },
    { value: strainCount, label: "Strains tracked" },
  ];

  return (
    <section ref={ref} className="relative z-10 px-6 py-14">
      <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
        {items.map(({ value, label }) => (
          <div key={label}>
            <p className="text-amber font-bold text-3xl sm:text-5xl tabular-nums">
              {value}
            </p>
            <p className="mt-2 text-cream-muted text-[10px] sm:text-xs tracking-widest uppercase">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Feature row scaffolding ── */

function FeatureRow({
  eyebrow,
  title,
  body,
  bullets,
  cta,
  mock,
  flip,
}: {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  cta: { label: string; href: string };
  mock: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <section className="relative z-10 px-6 py-16 sm:py-24">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        className={`max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center ${
          flip ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Copy */}
        <motion.div variants={fadeUp}>
          <p className="text-amber/80 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold mb-3">
            {eyebrow}
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-cream/70 text-sm sm:text-base leading-relaxed mb-6">{body}</p>
          <ul className="space-y-3 mb-8">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-cream/85">
                <span
                  className="mt-1 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,185,0,0.15)" }}
                >
                  <svg className="w-2.5 h-2.5 text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {b}
              </li>
            ))}
          </ul>
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 text-amber text-xs font-bold tracking-widest uppercase hover:text-amber-hover transition-colors"
          >
            {cta.label}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </motion.div>

        {/* Mock */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: flip ? -48 : 48, rotate: flip ? -1.5 : 1.5 },
            show: {
              opacity: 1,
              x: 0,
              rotate: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          {mock}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* Card shell shared by the three feature mocks */
function MockShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border border-amber/15 p-5 sm:p-6"
      style={{
        background: "rgba(11,45,27,0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
          "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(247,238,216,0.06)",
      }}
    >
      {children}
    </div>
  );
}

/* ── Feature 1 — AAI dashboards ── */

function FeatureDashboards() {
  const gaps = [
    { name: "Purple Haze", at: "2 shops nearby", favs: 22 },
    { name: "Jack Herer", at: "1 shop nearby", favs: 18 },
    { name: "Gelato #33", at: "3 shops nearby", favs: 15 },
  ];
  return (
    <FeatureRow
      eyebrow="AAI Dashboards"
      title="See demand before it surfaces."
      body="Cove watches every live menu and consumer signal on the platform, then shows you exactly where your shelf and your market disagree."
      bullets={[
        "Demand Radar — what Vermont consumers are favoriting right now",
        "Market Gaps — popular products nearby that you don't carry",
        "Price Check — your pricing vs every shop within 30 miles",
      ]}
      cta={{ label: "Request dashboard access", href: "/me" }}
      mock={
        <MockShell>
          <div className="flex items-center justify-between mb-4">
            <p className="text-cream font-semibold text-sm">Market Gaps</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber/20 text-amber font-bold">
              3 gaps
            </span>
          </div>
          <div className="space-y-3">
            {gaps.map((g, i) => (
              <motion.div
                key={g.name}
                className="flex items-center justify-between rounded-xl px-3.5 py-3"
                style={{ background: "rgba(39,94,60,0.25)" }}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div>
                  <p className="text-cream text-xs font-semibold">{g.name}</p>
                  <p className="text-cream-muted/70 text-[10px]">{g.at}</p>
                </div>
                <span className="text-amber text-xs font-bold">{g.favs} ♥</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-4 text-cream-muted/50 text-[10px]">
            Updated from live menus · Champlain Valley region
          </p>
        </MockShell>
      }
    />
  );
}

/* ── Feature 2 — digital passport foot traffic ── */

function FeaturePassport() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const scans = useCountUp(187, 1400, inView);
  return (
    <FeatureRow
      flip
      eyebrow="Cove Digital Passport"
      title="Turn foot traffic into a number you can grow."
      body="Every passport sticker scanned at your counter is a verified visit. Cove counts them, spots your repeat customers, and shows you the visits nearby shops are getting that you aren't."
      bullets={[
        "A QR sticker kit for your counter — we generate, you print",
        "Verified visits and repeat-visitor rate, per week",
        "Cross-shop overlap — see which nearby shops share your customers",
      ]}
      cta={{ label: "See the consumer map", href: "/trail" }}
      mock={
        <div ref={ref}>
          <MockShell>
            <div className="flex items-center gap-5">
              {/* Mini passport page */}
              <div
                className="shrink-0 w-28 h-36 rounded-lg p-2 flex flex-col items-center justify-between"
                style={{
                  background: "linear-gradient(180deg, #f7eed8, #f0e0bc)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
                }}
              >
                <p className="text-[6px] font-bold tracking-[0.2em] uppercase text-forest-deep/70">
                  Cove Passport
                </p>
                {/* Gold stamp */}
                <motion.div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 28%, #fff7d6 0%, #f5c542 40%, #c98a18 75%, #8a5a08 100%)",
                    border: "2px solid #6b3f04",
                    transform: "rotate(-8deg)",
                  }}
                  initial={{ scale: 0, rotate: -40 }}
                  whileInView={{ scale: 1, rotate: -8 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 16 }}
                >
                  <span className="text-[7px] font-bold tracking-widest text-[#6b3f04] text-center leading-tight">
                    COLLECTED
                  </span>
                </motion.div>
                <p className="text-[6px] text-forest-deep/50 font-mono">VT-187290</p>
              </div>
              {/* Scan counter */}
              <div className="flex-1">
                <p className="text-cream-muted text-[10px] uppercase tracking-widest mb-1">
                  Scans at your counter
                </p>
                <p className="text-amber font-bold text-4xl tabular-nums leading-none">
                  {scans}
                </p>
                <p className="text-cream-muted/70 text-[11px] mt-2">past 7 days</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                    41% repeat
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-amber/15 text-amber font-bold">
                    +32% wk/wk
                  </span>
                </div>
              </div>
            </div>
          </MockShell>
        </div>
      }
    />
  );
}

/* ── Feature 3 — Cove AI ── */

function FeatureAI() {
  return (
    <FeatureRow
      eyebrow="Cove AI Concierge"
      title="Be the answer when customers ask."
      body="Cove AI answers thousands of strain and dispensary questions with live data. When your menu is connected, your products are the recommendation."
      bullets={[
        "Proximity-aware — “near me” answers route to your door",
        "Live menu grounding — recommendations only include what's in stock",
        "Built only for Vermont — no national noise, no out-of-state shops",
      ]}
      cta={{ label: "Ask Cove yourself", href: "/join" }}
      mock={
        <MockShell>
          <div className="space-y-3">
            <motion.div
              className="flex justify-end"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div
                className="rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] text-xs text-cream"
                style={{ background: "#1a3d28", border: "1px solid rgba(255,185,0,0.15)" }}
              >
                where can I get Blue Dream near Waterbury?
              </div>
            </motion.div>
            <motion.div
              className="flex gap-2.5"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.75, duration: 0.5 }}
            >
              <div className="w-6 h-6 rounded-md bg-amber/20 border border-amber/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber text-[10px] font-bold">C</span>
              </div>
              <div
                className="rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs text-cream leading-relaxed"
                style={{ background: "#0f2d1c" }}
              >
                <span className="text-amber font-semibold">Zenbarn Farms</span> in
                Waterbury Center has Blue Dream in stock right now — about 4
                minutes from where you&apos;re standing.
              </div>
            </motion.div>
            <motion.p
              className="text-center text-cream-muted/50 text-[10px] pt-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2 }}
            >
              Your shop. Your inventory. The answer.
            </motion.p>
          </div>
        </MockShell>
      }
    />
  );
}

/* ── Retention — diagnosis first, then the machine ──
   The section leads with the pain most owners can't see (no shop can
   measure its repeat rate: cash is anonymous and the normal win-back
   channels — ads, SMS, email — are banned for cannabis). Then the
   four-step loop shows how one counter scan makes the return visit
   measurable and engineered, and a concrete timeline ("Sarah")
   makes it tangible. Active step auto-advances while on screen;
   tapping a card focuses it. */

const PAIN_CHIPS = [
  { k: "Banned from ads", v: "Google & Meta won't take cannabis money" },
  { k: "Blocked from texts", v: "carriers filter cannabis SMS" },
  { k: "Blind to repeats", v: "cash can't tell a regular from a tourist" },
];

const LOOP_STEPS = [
  {
    title: "An anonymous sale",
    body: "A customer pays cash and walks out. Today that's where your data ends — you can't tell a regular from a tourist.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 9l1.5-5h15L21 9M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6" />
      </svg>
    ),
  },
  {
    title: "One scan, one known customer",
    body: "A passport stamp at checkout turns that sale into a returning identity. No signup form, no phone number begged at the counter.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 17h1v4h-4v-1" />
      </svg>
    ),
  },
  {
    title: "The restock alert",
    body: "Small batches sell out — that's Vermont. When the product they loved comes back, Cove tells them before a competitor's shelf does.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
  {
    title: "The decision moment",
    body: "Next time they ask Cove where to buy, the answer is the shop that stamped them — with their product in stock.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16M3 21v-5h5" />
      </svg>
    ),
  },
];

const STORY_ROWS = [
  { d: "Mar 14", t: "Sarah buys Sour Diesel at your counter — and stamps her passport.", final: false },
  { d: "Mar 20", t: "The batch sells out. Small-batch grower, six-week gap.", final: false },
  { d: "Apr 12", t: "Your menu syncs the restock. Cove notices within minutes.", final: false },
  { d: "Apr 12", t: "Sarah gets the back-in-stock alert.", final: false },
  { d: "Apr 13", t: "She's back at your counter.", final: true },
];

const STEP_INTERVAL_MS = 2600;

function RetentionLoop() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const [active, setActive] = useState(0);

  // Auto-advance the highlighted step while the section is on screen.
  // Reduced motion gets all steps fully lit, no cycling.
  useEffect(() => {
    if (!inView || reduce) return;
    const t = setInterval(
      () => setActive((a) => (a + 1) % LOOP_STEPS.length),
      STEP_INTERVAL_MS
    );
    return () => clearInterval(t);
  }, [inView, reduce]);

  return (
    <section ref={ref} className="relative z-10 px-6 py-16 sm:py-24">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        className="max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-8 max-w-2xl mx-auto">
          <p className="text-amber/80 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold mb-3">
            Retention
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            What&apos;s your repeat-visit rate?
            <br />
            <span className="text-amber">Most shops can&apos;t answer.</span>
          </h2>
          <p className="mt-5 text-cream/70 text-sm sm:text-base leading-relaxed">
            Not because owners don&apos;t care — because the number is
            unmeasurable. Cash is anonymous, and the receipt is the last
            time you can reach them. Lapsed regulars don&apos;t look like
            churn; they look like a slow Tuesday. Cove makes the return
            visit measurable, then engineers it — the first visit costs
            you marketing, the second one is free.
          </p>
        </motion.div>

        {/* The structural blackout — pains an owner instantly recognizes */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap justify-center gap-2.5 mb-12"
        >
          {PAIN_CHIPS.map((p) => (
            <span
              key={p.k}
              className="text-[11px] sm:text-xs rounded-full px-4 py-2 border"
              style={{
                background: "rgba(225,29,72,0.08)",
                borderColor: "rgba(251,113,133,0.25)",
              }}
            >
              <span className="font-bold text-rose-200/90">{p.k}</span>
              <span className="text-cream/60"> — {p.v}</span>
            </span>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOOP_STEPS.map((s, i) => {
            const isActive = reduce || active === i;
            return (
              <motion.div
                key={s.title}
                variants={fadeUp}
                onClick={() => setActive(i)}
                animate={{
                  scale: isActive ? 1.02 : 1,
                  opacity: isActive ? 1 : 0.55,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl border p-6 cursor-pointer overflow-hidden"
                style={{
                  background: "rgba(11,45,27,0.6)",
                  borderColor: isActive
                    ? "rgba(255,185,0,0.5)"
                    : "rgba(39,94,60,0.6)",
                  boxShadow: isActive
                    ? "0 16px 40px rgba(0,0,0,0.35), 0 0 24px rgba(255,185,0,0.08)"
                    : "none",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                    style={{
                      background: isActive
                        ? "rgba(255,185,0,0.18)"
                        : "rgba(39,94,60,0.4)",
                      color: isActive ? "#FFB900" : "#c4b89a",
                    }}
                  >
                    {s.icon}
                  </span>
                  <span className="font-groovy text-amber/60 text-xl">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-cream font-bold text-base mb-2">{s.title}</h3>
                <p className="text-cream/65 text-sm leading-relaxed">{s.body}</p>

                {/* Step timer — fills while this card is the active one */}
                {!reduce && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-mid/40">
                    {active === i && (
                      <motion.div
                        key={`timer-${active}`}
                        className="h-full bg-amber"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: STEP_INTERVAL_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* The story — one concrete narrative beats ten charts */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 28 },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                staggerChildren: 0.25,
                delayChildren: 0.3,
              },
            },
          }}
          className="mt-12 max-w-2xl mx-auto rounded-2xl border border-amber/15 p-6 sm:p-8"
          style={{ background: "rgba(11,45,27,0.6)" }}
        >
          <p className="text-amber/80 text-[10px] tracking-[0.3em] uppercase font-bold mb-6 text-center">
            How it plays out
          </p>
          <ol className="space-y-4">
            {STORY_ROWS.map((row) => (
              <motion.li
                key={`${row.d}-${row.t}`}
                variants={fadeUp}
                className="flex items-start gap-4"
              >
                <span
                  className={`shrink-0 w-14 text-[10px] font-mono tabular-nums pt-0.5 ${
                    row.final ? "text-amber" : "text-cream-muted/60"
                  }`}
                >
                  {row.d}
                </span>
                <span
                  className={`shrink-0 mt-1.5 w-2 h-2 rounded-full ${
                    row.final ? "bg-amber" : "bg-forest-mid"
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={`text-sm leading-relaxed ${
                    row.final ? "text-amber font-semibold" : "text-cream/75"
                  }`}
                >
                  {row.t}
                </span>
              </motion.li>
            ))}
          </ol>
          <motion.p
            variants={fadeUp}
            className="mt-6 pt-5 border-t border-forest-mid/50 text-center text-cream/80 text-sm font-semibold"
          >
            One restock alert. One returned customer. Zero ad spend.
          </motion.p>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="mt-10 text-center text-cream-muted/70 text-sm tracking-wide"
        >
          No punch cards. No app to build. No mailing list to beg for.
        </motion.p>
      </motion.div>
    </section>
  );
}

/* ── Stats band ── */

function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const synced = useCountUp(24, 900, inView);
  const regions = useCountUp(4, 900, inView);
  const zero = useCountUp(0, 400, inView);

  return (
    <section ref={ref} className="relative z-10 px-6 py-16">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto rounded-3xl border border-amber/15 px-6 sm:px-12 py-10 sm:py-12 grid grid-cols-3 gap-6 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,185,0,0.08), rgba(11,45,27,0.6) 40%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {[
          { v: `${synced}/7`, l: "Live menu sync" },
          { v: `${regions}`, l: "Vermont regions covered" },
          { v: `$${zero}`, l: "Cost during 2026 season" },
        ].map(({ v, l }) => (
          <div key={l}>
            <p className="text-amber font-bold text-2xl sm:text-4xl tabular-nums">{v}</p>
            <p className="mt-2 text-cream-muted text-[10px] sm:text-xs tracking-widest uppercase">
              {l}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── How it works ── */

const STEPS = [
  {
    n: "01",
    title: "Claim your shop",
    body: "Request access with your business email and claim your dispensary, grow, or manufacturing license on Cove.",
  },
  {
    n: "02",
    title: "Connect your menu",
    body: "Cove Connect syncs your existing menu platform automatically. No new POS, no manual entry, nothing to maintain.",
  },
  {
    n: "03",
    title: "Act on your dashboard",
    body: "Demand, gaps, pricing, and foot traffic — refreshed continuously and exportable when you need to share it.",
  },
];

function HowItWorks() {
  return (
    <section className="relative z-10 px-6 py-16 sm:py-24">
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-120px" }}
        className="max-w-5xl mx-auto"
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <p className="text-amber/80 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold mb-3">
            Onboarding
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Live in an afternoon.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {STEPS.map((s) => (
            <motion.div
              key={s.n}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="rounded-2xl border border-forest-mid/60 p-6 sm:p-7"
              style={{ background: "rgba(11,45,27,0.55)" }}
            >
              <p className="font-groovy text-amber/90 text-3xl mb-4">{s.n}</p>
              <h3 className="text-cream font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-cream/65 text-sm leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ── Final CTA ── */

function FinalCTA() {
  return (
    <section className="relative z-10 px-6 pt-10 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden px-6 sm:px-16 py-14 sm:py-20 text-center"
        style={{
          background:
            "radial-gradient(120% 160% at 50% 0%, rgba(255,185,0,0.16) 0%, rgba(11,45,27,0.85) 55%)",
          border: "1px solid rgba(255,185,0,0.25)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        <p className="text-amber/80 text-[10px] sm:text-xs tracking-[0.35em] uppercase font-bold mb-4">
          Limited 2026 cohort
        </p>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
          Get your shop on the map.
        </h2>
        <p className="text-cream/70 text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-9">
          Cove is onboarding Vermont dispensaries, growers, and manufacturers
          for the 2026 season — free while the program grows.
        </p>
        <motion.span
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block"
        >
          <Link
            href="/me"
            className="inline-block bg-amber text-forest-deep font-bold px-12 py-4 rounded-full text-sm tracking-widest uppercase shadow-xl shadow-amber/30 hover:bg-amber-hover transition-colors"
          >
            Request Access
          </Link>
        </motion.span>
        <p className="mt-6 text-cream-muted/60 text-xs">
          Exclusive, invite-only · Approved within 48 hours
        </p>
      </motion.div>
    </section>
  );
}
