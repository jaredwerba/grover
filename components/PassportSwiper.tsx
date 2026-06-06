"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import type { Dispensary } from "@/lib/dispensaries";
import PassportPage from "./PassportPage";
import StickerScanner from "./StickerScanner";

const pageVariants: Variants = {
  enter: (direction: 1 | -1) => ({
    x: direction === 1 ? 320 : -320,
    rotate: direction === 1 ? 8 : -8,
    opacity: 0,
  }),
  center: { x: 0, rotate: 0, opacity: 1 },
  exit: (direction: 1 | -1) => ({
    x: direction === 1 ? -320 : 320,
    rotate: direction === 1 ? -8 : 8,
    opacity: 0,
  }),
};

const reducedVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const ERROR_COPY: Record<string, string> = {
  missing: "That QR code didn't include a sticker token.",
  invalid: "That sticker QR isn't recognized. It may be from a different program.",
  unknown: "That sticker doesn't match a dispensary on CRAVE.",
};

/**
 * Swipeable CRAVE Passport — full-screen on mobile, centered on desktop.
 * Pages enter from the right and exit to the left (or reverse) with a
 * subtle rotation to suggest a passport being flipped open. Drag, tap,
 * or keyboard arrows to advance.
 */
export default function PassportSwiper({
  dispensaries,
  collectedMap = {},
  justCollectedShopId,
  newlyCollected = false,
  errorCode,
}: {
  dispensaries: Dispensary[];
  collectedMap?: Record<string, { collected_at: string }>;
  justCollectedShopId?: string;
  newlyCollected?: boolean;
  errorCode?: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const total = dispensaries.length;

  // Index lookup for `?collected=<shopId>` so we can jump to it on mount.
  const initialIndex = useMemo(() => {
    if (!justCollectedShopId) return 0;
    const idx = dispensaries.findIndex((d) => d.id === justCollectedShopId);
    return idx >= 0 ? idx : 0;
  }, [justCollectedShopId, dispensaries]);

  const [[index, direction], setIndex] = useState<[number, 1 | -1]>([
    initialIndex,
    1,
  ]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showError, setShowError] = useState(!!errorCode);
  const [celebrate, setCelebrate] = useState(false);

  // Trigger the celebration animation once on mount if we landed here
  // from a scan and the sticker was newly added.
  useEffect(() => {
    if (!justCollectedShopId || !newlyCollected) return;
    setCelebrate(true);
    const t = setTimeout(() => setCelebrate(false), 1600);
    return () => clearTimeout(t);
  }, [justCollectedShopId, newlyCollected]);

  // Drop the `?collected=…&new=1&error=…` query after we've consumed it
  // so refreshing the page doesn't replay the celebration / error.
  useEffect(() => {
    if (!justCollectedShopId && !errorCode) return;
    const t = setTimeout(() => {
      router.replace("/crave-passport", { scroll: false });
    }, 200);
    return () => clearTimeout(t);
  }, [justCollectedShopId, errorCode, router]);

  const goTo = useCallback(
    (next: number, fromDir: 1 | -1) => {
      const bounded = (next + total) % total;
      setIndex([bounded, fromDir]);
    },
    [total]
  );

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  // Keyboard navigation — left/right arrows
  useEffect(() => {
    if (scannerOpen) return; // don't fight the scanner modal
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, scannerOpen]);

  const current = dispensaries[index];
  const collected = collectedMap[current.id];

  // Show scan button only when getUserMedia is supported. SSR-safe via
  // a mounted flag (we can't read navigator on the server).
  const [supportsCamera, setSupportsCamera] = useState(false);
  useEffect(() => {
    setSupportsCamera(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia
    );
  }, []);

  const swipeThreshold = 80;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Error toast */}
      <AnimatePresence>
        {showError && errorCode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-sm sm:max-w-md mb-3 px-4 py-3 rounded-xl border border-rose-400/40 bg-rose-900/40 text-rose-100 text-xs flex items-center justify-between gap-3"
            role="alert"
          >
            <span>{ERROR_COPY[errorCode] ?? "Something went wrong with that scan."}</span>
            <button
              onClick={() => setShowError(false)}
              aria-label="Dismiss error"
              className="shrink-0 w-6 h-6 rounded-full text-rose-100/70 hover:text-rose-100 flex items-center justify-center"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan button */}
      {supportsCamera && (
        <button
          onClick={() => setScannerOpen(true)}
          className="mb-5 inline-flex items-center gap-2 bg-amber text-forest-deep font-bold px-6 py-3 rounded-full text-xs tracking-widest uppercase shadow-lg shadow-amber/20 hover:bg-amber-hover transition-colors"
        >
          <CameraIcon />
          Scan Sticker
        </button>
      )}

      {/* Passport stack */}
      <div
        className="relative w-full max-w-sm sm:max-w-md"
        style={{ aspectRatio: "3 / 4", perspective: "1400px" }}
        role="region"
        aria-roledescription="carousel"
        aria-label={`CRAVE Passport — ${index + 1} of ${total}: ${current.name}`}
      >
        {/* Subtle "next" peek behind the active page (depth cue) */}
        {total > 1 && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            aria-hidden="true"
            style={{
              transform: "translate(8px, 10px) rotate(2deg) scale(0.97)",
              background: "linear-gradient(180deg, #d8cba8, #c4b89a)",
              boxShadow:
                "0 12px 28px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(0,0,0,0.08)",
              zIndex: 0,
              opacity: 0.55,
            }}
          />
        )}
        {total > 2 && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            aria-hidden="true"
            style={{
              transform: "translate(16px, 18px) rotate(-1.5deg) scale(0.94)",
              background: "linear-gradient(180deg, #cdc09e, #b9ad8e)",
              boxShadow:
                "0 8px 18px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(0,0,0,0.06)",
              zIndex: -1,
              opacity: 0.4,
            }}
          />
        )}

        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current.id}
            custom={direction}
            variants={reduceMotion ? reducedVariants : pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
              mass: 0.9,
            }}
            drag={reduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -swipeThreshold || info.velocity.x < -500) {
                goNext();
              } else if (
                info.offset.x > swipeThreshold ||
                info.velocity.x > 500
              ) {
                goPrev();
              }
            }}
            whileDrag={{ cursor: "grabbing", scale: 0.98 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ zIndex: 1, touchAction: "pan-y" }}
          >
            <motion.div
              className="w-full h-full"
              animate={
                celebrate && current.id === justCollectedShopId
                  ? { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              <PassportPage
                dispensary={current}
                index={index}
                total={total}
                collected={collected}
              />
            </motion.div>

            {/* Amber flash on celebrate */}
            <AnimatePresence>
              {celebrate && current.id === justCollectedShopId && (
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.45, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(255,185,0,0.6) 0%, rgba(255,185,0,0) 70%)",
                  }}
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page counter + controls */}
      <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between mt-6 px-1">
        <button
          onClick={goPrev}
          aria-label="Previous passport page"
          className="w-11 h-11 rounded-full border-2 border-forest-mid text-cream-muted hover:text-amber hover:border-amber/60 transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <p className="text-cream-muted text-xs tracking-widest uppercase font-bold tabular-nums">
          {index + 1} <span className="text-cream-muted/40 mx-1">/</span>{" "}
          {total}
        </p>

        <button
          onClick={goNext}
          aria-label="Next passport page"
          className="w-11 h-11 rounded-full border-2 border-forest-mid text-cream-muted hover:text-amber hover:border-amber/60 transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* Dot scrubber */}
      <div className="w-full max-w-sm sm:max-w-md mt-4 px-1">
        <div className="flex gap-1 flex-wrap justify-center">
          {dispensaries.map((d, i) => {
            const isCollected = !!collectedMap[d.id];
            return (
              <button
                key={d.id}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                aria-label={`Jump to ${d.name}`}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === index ? 18 : 6,
                  background:
                    i === index
                      ? "#FFB900"
                      : isCollected
                      ? "rgba(255, 185, 0, 0.45)"
                      : "rgba(196, 184, 154, 0.3)",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Hint text */}
      <p className="text-cream-muted/50 text-[10px] tracking-widest uppercase mt-5">
        Swipe or use arrow keys
      </p>

      {/* Camera scanner modal */}
      <StickerScanner open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
