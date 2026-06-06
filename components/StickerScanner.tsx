"use client";

/**
 * In-app QR scanner for the CRAVE Passport. Opens a fullscreen modal,
 * requests rear-camera access, and on a successful decode routes to
 * the existing /crave-passport/scan?t=<jwt> server route so the
 * in-app path and a phone's-native-camera path are unified.
 *
 * iOS Safari notes:
 * - getUserMedia requires HTTPS (Vercel preview/prod is fine;
 *   localhost is also allowed). A LAN IP over plain HTTP will fail
 *   silently — use the Vercel preview URL when testing on a phone.
 * - @yudiel/react-qr-scanner sets playsInline internally for iOS.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";

type Status = "scanning" | "denied" | "no-camera" | "error";

function extractToken(raw: string): string | null {
  // Accept either a full URL (https://covebud.com/crave-passport/scan?t=...)
  // or just the raw JWT (so a sticker printed without a domain still works).
  try {
    const u = new URL(raw);
    const t = u.searchParams.get("t");
    if (t) return t;
  } catch {
    // not a URL
  }
  // Heuristic: JWTs are three base64url segments separated by dots.
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(raw)) {
    return raw;
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
  const [status, setStatus] = useState<Status>("scanning");
  // Ref instead of state so the next onScan tick from the camera lib
  // sees the updated value immediately — useState wouldn't commit
  // until the next React render, which could let a duplicate detection
  // sneak through and double-navigate.
  const handledRef = useRef(false);

  // Reset state every time the modal reopens.
  useEffect(() => {
    if (!open) return;
    handledRef.current = false;
    setStatus("scanning");
  }, [open]);

  // Lock body scroll while the scanner is full-screen — prevents the
  // passport behind from accepting touches and avoids iOS rubber-banding
  // behind the camera viewport.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onDetect = useCallback(
    (codes: IDetectedBarcode[]) => {
      if (handledRef.current) return;
      for (const code of codes) {
        const token = extractToken(code.rawValue);
        if (!token) continue;
        handledRef.current = true;
        // Close the camera modal then navigate to the scan route.
        onClose();
        router.push(`/crave-passport/scan?t=${encodeURIComponent(token)}`);
        return;
      }
    },
    [onClose, router]
  );

  const onError = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (
      /NotAllowed|Permission/i.test(msg) ||
      /denied/i.test(msg)
    ) {
      setStatus("denied");
    } else if (/NotFound|DevicesNotFound/i.test(msg)) {
      setStatus("no-camera");
    } else {
      setStatus("error");
    }
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Scan a CRAVE sticker"
    >
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-forest-deep/90 backdrop-blur-sm">
        <div>
          <p className="text-amber/70 text-[10px] tracking-[0.3em] uppercase font-bold">
            CRAVE Passport
          </p>
          <p className="text-cream text-sm font-semibold">Scan a Sticker</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close scanner"
          className="w-10 h-10 rounded-full border border-forest-mid text-cream hover:text-amber hover:border-amber/60 transition-colors flex items-center justify-center"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Camera viewport */}
      <div className="relative flex-1 overflow-hidden">
        {status === "scanning" && (
          <>
            <Scanner
              onScan={onDetect}
              onError={onError}
              constraints={{ facingMode: "environment" }}
              formats={["qr_code"]}
              scanDelay={250}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" },
              }}
            />
            {/* Targeting reticle overlay */}
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
          </>
        )}

        {status === "denied" && (
          <FallbackPanel
            title="Camera access denied"
            body="Cove needs your camera to read CRAVE stickers. Enable camera access for this site in your browser settings, then try again."
            ctaLabel="Try again"
            onCta={() => {
              setStatus("scanning");
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
            ctaLabel="Try again"
            onCta={() => {
              setStatus("scanning");
              handledRef.current = false;
            }}
            onClose={onClose}
          />
        )}
      </div>

      {/* Bottom hint */}
      <div className="shrink-0 px-6 py-4 bg-forest-deep/90 backdrop-blur-sm text-center">
        <p className="text-cream-muted text-xs leading-relaxed">
          Point your camera at a CRAVE sticker QR. Sticker is auto-collected
          when detected.
        </p>
      </div>
    </div>
  );
}

function FallbackPanel({
  title,
  body,
  ctaLabel,
  onCta,
  onClose,
}: {
  title: string;
  body: string;
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
    </div>
  );
}
