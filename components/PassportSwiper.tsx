"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import type { Dispensary } from "@/lib/dispensaries";
import PassportPage from "./PassportPage";
import StickerScanner from "./StickerScanner";

// Three-slot stack: left history | active middle | next card sitting
// CENTERED BEHIND the active (peeking from the back, not the side).
// When the user swipes the active card off to the left, the next card
// scales up into the middle position — it doesn't slide in from a
// side, which felt unnatural because cards don't physically come from
// the right in a passport-flip metaphor.
//   slot -1: tucked behind on the LEFT (most recently swiped card)
//   slot  0: ACTIVE middle card, draggable
//   slot  1: NEXT card, centered behind the active, peeking out top
type Slot = -1 | 0 | 1;

interface SlotStyle {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

const SLOT_STYLES: Record<Slot, SlotStyle> = {
  "-1": { x: -140, y: 14, rotate: -8,  scale: 0.82, opacity: 0.85, zIndex: 2 },
  "0":  { x: 0,    y: 0,  rotate: 0,   scale: 1,    opacity: 1,    zIndex: 10 },
  // No x offset on slot 1: the next card sits centered behind the
  // active. y: -10 puts it a few pixels higher so the top edge is
  // visible above the active card, like a stack of pages.
  "1":  { x: 0,    y: -10, rotate: 0,  scale: 0.94, opacity: 1,    zIndex: 5 },
};

const REDUCED_SLOT_STYLES: Record<Slot, SlotStyle> = {
  "-1": { x: 0, y: 0, rotate: 0, scale: 1, opacity: 0, zIndex: 2 },
  "0":  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: 10 },
  "1":  { x: 0, y: 0, rotate: 0, scale: 1, opacity: 0, zIndex: 5 },
};

// Enter/exit variants. MUST be variants (not inline objects on
// motion.div) so the variant function reads `custom` at the time the
// card actually exits — not at the time of the previous render.
//
// Asymmetric by direction to match the new slot semantics:
//   Forward (dir = 1):
//     • Entering card goes to slot 1 (centered BEHIND the active).
//       It just fades + scales in from invisible — no sideways slide
//       so we don't repeat the "card-coming-from-the-right" weirdness.
//     • Exiting card was at slot -1 (left history). It slides further
//       LEFT to x=-360 and fades.
//   Backward (dir = -1):
//     • Entering card goes to slot -1 (left history). Slides in from
//       off-screen-left (x=-360) so it visibly comes from "even older
//       history".
//     • Exiting card was at slot 1 (centered behind). It fades out in
//       place — there's no natural direction for it to slide to.
const enterExitVariants = {
  enter: (direction: 1 | -1) => ({
    x: direction === 1 ? 0 : -360,
    y: direction === 1 ? -10 : 14,
    rotate: direction === 1 ? 0 : -8,
    scale: direction === 1 ? 0.7 : 0.82,
    opacity: 0,
  }),
  exit: (direction: 1 | -1) => ({
    x: direction === 1 ? -360 : 0,
    y: direction === 1 ? 14 : -10,
    rotate: direction === 1 ? -8 : 0,
    scale: direction === 1 ? 0.82 : 0.7,
    opacity: 0,
  }),
};

const reducedEnterExitVariants = {
  enter: { opacity: 0 },
  exit: { opacity: 0 },
};

const ERROR_COPY: Record<string, string> = {
  missing: "That QR code didn't include a sticker token.",
  invalid: "That sticker QR isn't recognized. It may be from a different program.",
  unknown: "That sticker doesn't match a dispensary on COVE Trail.",
};

/**
 * Swipeable COVE Trail Passport — full-screen on mobile, centered on desktop.
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
  isSignedIn = false,
}: {
  dispensaries: Dispensary[];
  collectedMap?: Record<string, { collected_at: string }>;
  justCollectedShopId?: string;
  newlyCollected?: boolean;
  errorCode?: string;
  isSignedIn?: boolean;
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
  // Becomes true on the first navigation. Gates the slot-(-1) tuck so
  // that on first paint there's no phantom "previous" card visible —
  // it only appears after the user has actually swiped through at least
  // one card and there's a real history to peek at.
  const [hasNavigated, setHasNavigated] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  // Stable identities for the modal — passing `() => …` inline would
  // give StickerScanner a new function each render, which would
  // recreate the Scanner's onScan binding and reset the camera mid-scan.
  const openScanner = useCallback(() => setScannerOpen(true), []);
  const closeScanner = useCallback(() => setScannerOpen(false), []);
  const [showError, setShowError] = useState(!!errorCode);
  const [celebrate, setCelebrate] = useState(false);
  // Stash the just-collected ID in local state so the celebration
  // condition survives the URL cleanup below — otherwise the
  // `current.id === celebrateShopId` check goes false the moment we
  // strip `?collected=…` from the URL and the animation cuts off early.
  const [celebrateShopId, setCelebrateShopId] = useState<string | undefined>(
    justCollectedShopId && newlyCollected ? justCollectedShopId : undefined
  );

  // Trigger the celebration animation once on mount if we landed here
  // from a scan and the sticker was newly added.
  useEffect(() => {
    if (!justCollectedShopId || !newlyCollected) return;
    setCelebrate(true);
    const t = setTimeout(() => {
      setCelebrate(false);
      setCelebrateShopId(undefined);
    }, 1600);
    return () => clearTimeout(t);
  }, [justCollectedShopId, newlyCollected]);

  // Drop the `?collected=…&new=1&error=…` query after we've consumed it
  // so refreshing the page doesn't replay the celebration / error. The
  // local `celebrateShopId` keeps the animation going through the URL
  // change, so 200ms is fine.
  useEffect(() => {
    if (!justCollectedShopId && !errorCode) return;
    const t = setTimeout(() => {
      router.replace("/cove-trail-passport", { scroll: false });
    }, 200);
    return () => clearTimeout(t);
  }, [justCollectedShopId, errorCode, router]);

  const goTo = useCallback(
    (next: number, fromDir: 1 | -1) => {
      const bounded = (next + total) % total;
      setIndex([bounded, fromDir]);
      setHasNavigated(true);
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

  // Build the sliding-window stack. Slot -1 (tucked-behind-left) only
  // appears AFTER the user has navigated at least once — before any
  // swipe there's no "previously-visited" card to peek behind on the
  // left, and showing one would look like a phantom history entry.
  const visibleCards: { slot: Slot; idx: number; dispensary: Dispensary }[] = [];
  const seenIds = new Set<string>();
  const slots: Slot[] = hasNavigated ? [-1, 0, 1] : [0, 1];
  for (const slot of slots) {
    const idx = ((index + slot) % total + total) % total;
    const dispensary = dispensaries[idx];
    if (seenIds.has(dispensary.id)) continue;
    seenIds.add(dispensary.id);
    visibleCards.push({ slot, idx, dispensary });
  }

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

      {/* Scan button — signed-in users open the camera; signed-out
          users get nudged to sign in first. */}
      {isSignedIn ? (
        supportsCamera && (
          <button
            onClick={openScanner}
            className="mb-5 inline-flex items-center gap-2 bg-amber text-forest-deep font-bold px-6 py-3 rounded-full text-xs tracking-widest uppercase shadow-lg shadow-amber/20 hover:bg-amber-hover transition-colors"
          >
            <CameraIcon />
            Scan Sticker
          </button>
        )
      ) : (
        <a
          href="/join?next=/cove-trail-passport"
          className="mb-5 inline-flex items-center gap-2 bg-amber text-forest-deep font-bold px-6 py-3 rounded-full text-xs tracking-widest uppercase shadow-lg shadow-amber/20 hover:bg-amber-hover transition-colors"
        >
          <CameraIcon />
          Sign In to Collect
        </a>
      )}

      {/* Passport stack */}
      <div
        className="relative w-full max-w-sm sm:max-w-md"
        style={{ aspectRatio: "3 / 4", perspective: "1400px" }}
        role="region"
        aria-roledescription="carousel"
        aria-label={`COVE Trail Passport — ${index + 1} of ${total}: ${current.name}`}
      >
        {/* Sliding-window stack — render the four visible cards across
            slots [-1, 0, 1, 2]. The card at slot 0 is the draggable
            active page. After a swipe the previously-active card lands
            in slot -1 (tucked behind on the left) so it stays visible
            instead of unmounting. */}
        <AnimatePresence initial={false} custom={direction}>
          {visibleCards.map(({ slot, idx, dispensary }) => {
            const isActive = slot === 0;
            const slotStyles = reduceMotion ? REDUCED_SLOT_STYLES : SLOT_STYLES;
            const t = slotStyles[slot];
            return (
              <motion.div
                key={dispensary.id}
                custom={direction}
                variants={
                  reduceMotion ? reducedEnterExitVariants : enterExitVariants
                }
                initial="enter"
                exit="exit"
                animate={{
                  x: t.x,
                  y: t.y,
                  rotate: t.rotate,
                  scale: t.scale,
                  opacity: t.opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 30,
                  mass: 0.9,
                }}
                drag={isActive && !reduceMotion ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={
                  isActive
                    ? (_, info) => {
                        if (
                          info.offset.x < -swipeThreshold ||
                          info.velocity.x < -500
                        ) {
                          goNext();
                        } else if (
                          info.offset.x > swipeThreshold ||
                          info.velocity.x > 500
                        ) {
                          goPrev();
                        }
                      }
                    : undefined
                }
                whileDrag={isActive ? { cursor: "grabbing", scale: 0.98 } : undefined}
                className={`absolute inset-0 ${
                  isActive ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
                }`}
                style={{
                  zIndex: t.zIndex,
                  touchAction: isActive ? "pan-y" : "none",
                }}
              >
                <motion.div
                  className="w-full h-full"
                  animate={
                    isActive && celebrate && dispensary.id === celebrateShopId
                      ? { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }
                      : { scale: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.9, ease: "easeOut" }}
                >
                  <PassportPage
                    dispensary={dispensary}
                    index={idx}
                    total={total}
                    collected={collectedMap[dispensary.id]}
                  />
                </motion.div>

                {/* Amber flash on celebrate — only on the active card */}
                <AnimatePresence>
                  {isActive && celebrate && dispensary.id === celebrateShopId && (
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
            );
          })}
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

      {/* Hint text */}
      <p className="text-cream-muted/50 text-[10px] tracking-widest uppercase mt-5">
        Swipe or use arrow keys
      </p>

      {/* Camera scanner modal */}
      <StickerScanner open={scannerOpen} onClose={closeScanner} />
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
