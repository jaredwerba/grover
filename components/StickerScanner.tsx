"use client";

/**
 * In-app QR scanner for the Crave Cannatrail Passport. Opens a fullscreen modal,
 * requests rear-camera access, and on a successful decode routes to
 * the same server route a phone's-native-camera scan hits so the
 * code paths are unified.
 *
 * Uses `html5-qrcode` (ZXing-based) rather than `@yudiel/react-qr-scanner`
 * because the latter's BarcodeDetector polyfill was silently failing
 * on iOS Safari — camera streamed fine, no errors fired, but onScan
 * never received any codes. `html5-qrcode` is the most battle-tested
 * QR library for iOS Safari (PayPal, GitHub Education, etc).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
// NOTE: html5-qrcode is dynamically imported inside the start effect
// (`await import("html5-qrcode")`) instead of statically here. Reasons:
//  1. Defers loading the QR/ZXing bundle (~250kb) until the user
//     actually taps "Scan Sticker".
//  2. Lets us catch any throws-during-module-evaluation in our
//     try/catch instead of letting them propagate to the Next.js
//     error boundary and crash the whole page.
type Html5QrcodeInstance = import("html5-qrcode").Html5Qrcode;

type Status = "starting" | "scanning" | "denied" | "no-camera" | "error";

const SCANNER_ELEMENT_ID = "crave-cannatrail-sticker-scanner-region";

/**
 * Decide where to navigate based on a decoded QR string. We accept:
 *
 *   • Short slug URL: https://covebud.com/s/papa-g-dispensary
 *     → navigate to /s/papa-g-dispensary (server mints the JWT)
 *   • Direct scan URL: https://covebud.com/crave-cannatrail-passport/scan?t=<jwt>
 *     → navigate to /crave-cannatrail-passport/scan?t=<jwt>
 *   • Bare JWT (legacy stickers printed without a domain)
 *     → navigate to /crave-cannatrail-passport/scan?t=<jwt>
 *
 * Returns the in-app path to push, or null if the decoded value
 * doesn't look like ours and we should keep scanning.
 */
function extractScanTarget(raw: string): string | null {
  try {
    const u = new URL(raw);
    const path = u.pathname;
    if (/^\/s\/[a-z0-9-]+$/i.test(path)) {
      return path;
    }
    if (path === "/crave-cannatrail-passport/scan" && u.searchParams.get("t")) {
      return `${path}?t=${encodeURIComponent(u.searchParams.get("t")!)}`;
    }
  } catch {
    // not a URL
  }
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(raw)) {
    return `/crave-cannatrail-passport/scan?t=${encodeURIComponent(raw)}`;
  }
  return null;
}

export default function StickerScanner({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("starting");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const handledRef = useRef(false);
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);

  // Lock body scroll while the scanner is full-screen.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleDetected = useCallback(
    (decodedText: string) => {
      if (handledRef.current) return;
      const target = extractScanTarget(decodedText);
      if (typeof console !== "undefined") {
        console.log("[StickerScanner] decoded", { decodedText, target });
      }
      if (!target) return; // not a Crave Cannatrail QR — keep scanning
      handledRef.current = true;

      // Use a FULL browser navigation, not router.push.
      //
      // Why: the scan target is typically /s/<slug>, which is a route
      // handler that returns a redirect to /crave-cannatrail-passport/scan?t=,
      // which redirects again to /crave-cannatrail-passport. Following two server
      // redirects through Next.js's client router while we're also
      // unmounting the scanner mid-callback was crashing iOS Safari
      // with its "this page couldn't load" page-load error screen.
      // A full navigation hands the redirect chain to the browser —
      // exactly what the iOS Camera app does (which works), so behavior
      // is identical here.
      //
      // We also skip the explicit stop()/onClose() — the page unload
      // will tear everything down cleanly anyway, and dispatching
      // those before navigation was racing with the navigation itself.
      window.location.assign(target);
    },
    []
  );

  // Start the scanner whenever the modal opens.
  // Everything — including the library import and the constructor
  // call — runs inside a single try/catch so a sync throw lands in our
  // error UI instead of bubbling up to Next.js's error boundary and
  // crashing the page (which is what was happening on iOS Safari when
  // CSP blocked the library's blob: worker).
  useEffect(() => {
    if (!open) return;
    handledRef.current = false;
    setStatus("starting");
    setErrorMessage("");

    let cancelled = false;
    let instance: Html5QrcodeInstance | null = null;

    (async () => {
      try {
        const mod = await import("html5-qrcode");
        if (cancelled) return;

        instance = new mod.Html5Qrcode(SCANNER_ELEMENT_ID, {
          verbose: false,
        });
        scannerRef.current = instance;

        await instance.start(
          { facingMode: "environment" },
          {
            fps: 10,
            // qrbox uses a function so it adapts to the actual rendered
            // viewport size on first frame — keeps the targeting box
            // visible in both portrait and landscape.
            qrbox: (vw, vh) => {
              const side = Math.floor(Math.min(vw, vh) * 0.7);
              return { width: side, height: side };
            },
            // No aspectRatio — html5-qrcode will fall back to whatever
            // the actual camera reports, which avoids overconstrained
            // errors on iOS where the inner-window ratio can be weird.
          },
          (decodedText) => {
            handleDetected(decodedText);
          },
          // Per-frame "no QR in this frame" callback — not a real
          // error, intentionally swallowed.
          () => {}
        );

        if (cancelled) {
          void instance.stop().catch(() => {});
          return;
        }
        setStatus("scanning");
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (typeof console !== "undefined") {
          console.warn("[StickerScanner] init failed", { msg, err });
        }
        setErrorMessage(msg);
        if (/NotAllowed|Permission|denied/i.test(msg)) {
          setStatus("denied");
        } else if (/NotFound|no.*camera|DevicesNotFound/i.test(msg)) {
          setStatus("no-camera");
        } else {
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      // Best-effort stop + clear. html5-qrcode throws if you call
      // stop() when it isn't running, and clear() is synchronous void
      // (no promise), so wrap clear() in try/catch.
      if (instance) {
        void instance.stop().catch(() => {});
        try {
          instance.clear();
        } catch {
          // ignore
        }
      }
      if (instance && scannerRef.current === instance) {
        scannerRef.current = null;
      }
    };
  }, [open, handleDetected]);

  if (!open) return null;

  const showCamera = status === "starting" || status === "scanning";

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Scan a Crave Cannatrail sticker"
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-forest-deep/90 backdrop-blur-sm">
        <div>
          <p className="text-amber/70 text-[10px] tracking-[0.3em] uppercase font-bold">
            Crave Cannatrail Passport
          </p>
          <p className="text-cream text-sm font-semibold">Scan a Sticker</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close scanner"
          className="w-10 h-10 rounded-full border border-forest-mid text-cream hover:text-amber hover:border-amber/60 transition-colors flex items-center justify-center"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Camera viewport */}
      <div className="relative flex-1 overflow-hidden">
        {/* The html5-qrcode library mounts its <video> into this div by
            id. We always render it (even on error states) so that a
            "Try Again" can re-mount cleanly. Hidden when the fallback
            panels are shown. */}
        <div
          id={SCANNER_ELEMENT_ID}
          className="absolute inset-0 w-full h-full"
          style={{ display: showCamera ? "block" : "none" }}
        />

        {showCamera && status === "scanning" && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div
              className="rounded-3xl border-2 border-amber/80"
              style={{
                width: "min(70vw, 320px)",
                height: "min(70vw, 320px)",
                boxShadow:
                  "0 0 0 9999px rgba(0,0,0,0.45), 0 0 30px rgba(255,185,0,0.4)",
              }}
            />
          </div>
        )}

        {showCamera && status === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center text-cream-muted text-sm">
            Starting camera…
          </div>
        )}

        {status === "denied" && (
          <FallbackPanel
            title="Camera access denied"
            body="Cove needs your camera to read Crave Cannatrail stickers. Enable camera access for this site in your browser settings, then try again."
            ctaLabel="Try again"
            onCta={() => {
              setStatus("starting");
              handledRef.current = false;
            }}
            onClose={onClose}
          />
        )}

        {status === "no-camera" && (
          <FallbackPanel
            title="No camera found"
            body="We couldn't find a camera on this device. Try again on a phone or tablet."
            ctaLabel="Close"
            onCta={onClose}
            onClose={onClose}
          />
        )}

        {status === "error" && (
          <FallbackPanel
            title="Scanner unavailable"
            body="Something went wrong starting the camera. Try again, or use your phone's native camera app to scan the QR."
            debug={errorMessage}
            ctaLabel="Try again"
            onCta={() => {
              setStatus("starting");
              setErrorMessage("");
              handledRef.current = false;
            }}
            onClose={onClose}
          />
        )}
      </div>

      {/* Bottom hint + manual fallback */}
      <div className="shrink-0 px-6 py-4 bg-forest-deep/90 backdrop-blur-sm text-center">
        <p className="text-cream-muted text-xs leading-relaxed mb-2">
          Point your camera at a Crave Cannatrail sticker QR. Sticker is auto-collected
          when detected.
        </p>
        <button
          onClick={() => {
            const raw = window.prompt(
              "Having trouble scanning?\n\nEnter the shop ID printed on the sticker (e.g. papa-g-dispensary):"
            );
            if (!raw) return;
            const slug = raw.trim().toLowerCase();
            if (!/^[a-z0-9-]+$/.test(slug)) {
              window.alert("That doesn't look like a valid Crave Cannatrail shop ID.");
              return;
            }
            onClose();
            router.push(`/s/${slug}`);
          }}
          className="text-cream-muted/60 hover:text-cream text-[11px] underline underline-offset-2"
        >
          Can&apos;t scan? Enter shop ID manually
        </button>
      </div>
    </div>
  );
}

function FallbackPanel({
  title,
  body,
  debug,
  ctaLabel,
  onCta,
  onClose,
}: {
  title: string;
  body: string;
  debug?: string;
  ctaLabel: string;
  onCta: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-forest-deep">
      <h3 className="text-cream font-groovy text-2xl mb-3">{title}</h3>
      <p className="text-cream-muted text-sm leading-relaxed max-w-xs mb-6">
        {body}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onCta}
          className="bg-amber text-forest-deep font-bold px-8 py-3 rounded-full text-xs tracking-widest uppercase hover:bg-amber-hover transition-colors"
        >
          {ctaLabel}
        </button>
        <button
          onClick={onClose}
          className="border border-amber/40 text-amber px-6 py-3 rounded-full text-[11px] tracking-widest uppercase hover:bg-amber/10 transition-colors"
        >
          Close
        </button>
      </div>
      {debug && (
        <p className="text-cream-muted/40 text-[10px] font-mono mt-6 max-w-xs break-all">
          {debug}
        </p>
      )}
    </div>
  );
}
