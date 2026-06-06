import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { dispensaries } from "@/lib/dispensaries";
import { signStickerToken } from "@/lib/sticker-tokens";

export const metadata: Metadata = {
  title: "CRAVE Sticker QR",
  robots: { index: false, follow: false },
};

/**
 * Server-renders the signed sticker QR for a given shop. Used during
 * development to put a scannable QR on screen (or on a second monitor)
 * so the in-app scanner can decode it. Long-term this will move into a
 * dispenser-owner dashboard so each shop can print their own.
 *
 * URL: /crave-passport/qr/papa-g-dispensary
 */
export default async function StickerQrPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  const shop = dispensaries.find((d) => d.id === shopId);
  if (!shop) notFound();

  const token = await signStickerToken(shop.id);

  // Build an absolute URL so a phone's native camera app can also open
  // the QR. Reads the actual request host/proto so this works on
  // localhost, Vercel preview, and production without config.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "covebud.com";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const scanUrl = `${proto}://${host}/crave-passport/scan?t=${encodeURIComponent(token)}`;

  // Server-side QR generation as a data URL — keeps us within the CSP
  // (which allows `data:` in img-src) without needing an external host.
  const qrDataUrl = await QRCode.toDataURL(scanUrl, {
    margin: 2,
    width: 320,
    color: { dark: "#0f2d1c", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });

  return (
    <main className="min-h-screen bg-cream text-forest-deep flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-4 border-forest-deep">
        <p className="text-amber font-bold text-[10px] tracking-[0.3em] uppercase mb-2">
          CRAVE Passport Sticker
        </p>
        <h1 className="font-groovy text-3xl text-forest-deep mb-1">
          {shop.name}
        </h1>
        <p className="text-forest-deep/70 text-xs mb-6">
          {shop.address} · {shop.city}, VT
        </p>

        {/* QR rendered server-side as a data URL — works inline within
            the existing CSP and on any printed surface. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code for ${shop.name} CRAVE sticker`}
          width={320}
          height={320}
          className="mx-auto rounded-lg"
        />

        <p className="text-[10px] text-forest-deep/50 mt-6 leading-relaxed break-all">
          {scanUrl}
        </p>
      </div>
      <p className="text-forest-deep/60 text-xs mt-6 max-w-md text-center leading-relaxed">
        Point the in-app CRAVE Passport scanner at this code. The sticker
        will be added to the signed-in user&apos;s passport.
      </p>
    </main>
  );
}
