import type { Metadata } from "next";
import Link from "next/link";
import { dispensaries } from "@/lib/dispensaries";
import { getSession } from "@/lib/auth";
import { getStickers } from "@/lib/stickers";
import PassportSwiper from "@/components/PassportSwiper";

export const metadata: Metadata = {
  title: "Crave Cannatrail Passport — Your Vermont Cannabis Trail | Cove",
  description:
    "Your personal Crave Cannatrail Passport — collect stickers from Vermont dispensaries by scanning their QR codes. 40 stops across four regional trails.",
  openGraph: {
    title: "Crave Cannatrail Passport — Your Vermont Cannabis Trail",
    description:
      "Scan stickers at Vermont dispensaries to fill up your digital Crave Cannatrail Passport.",
    url: "https://covebud.com/crave-cannatrail-passport",
    siteName: "Cove",
    type: "website",
  },
  alternates: {
    canonical: "https://covebud.com/crave-cannatrail-passport",
  },
};

interface PageProps {
  searchParams: Promise<{
    collected?: string;
    new?: string;
    error?: string;
  }>;
}

export default async function CraveCannatrailPassportPage({ searchParams }: PageProps) {
  // Browsable without sign-in — anyone can flip through the passport.
  // Collecting still requires a session (the /scan route enforces it).
  const session = await getSession();
  const isSignedIn = !!session;

  // Shuffle the deck on every page load — each visit feels like
  // flipping through a different stretch of the passport. Fisher-Yates
  // in-place on a copy so we don't mutate the imported dispensaries.
  const ordered = [...dispensaries];
  for (let i = ordered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
  }

  // Only signed-in users have a sticker collection.
  const stickers = session ? await getStickers(session.email) : [];
  // Map shopId -> StickerEntry for O(1) lookup in the page renderer
  const collectedMap: Record<string, { collected_at: string }> = {};
  for (const s of stickers) {
    collectedMap[s.shopId] = { collected_at: s.collected_at };
  }

  const params = await searchParams;
  const justCollectedShopId = params.collected ?? undefined;
  const newlyCollected = params.new === "1";
  const errorCode = params.error ?? undefined;

  const collectedCount = stickers.length;
  const totalCount = ordered.length;

  return (
    <main className="bg-forest-deep text-cream min-h-screen flex flex-col">
      {/* Top intro — compact so the passport gets vertical space */}
      <section className="px-4 sm:px-6 pt-8 pb-4 max-w-2xl mx-auto w-full text-center">
        <p className="text-amber/70 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-semibold mb-2">
          2026 Edition
        </p>
        <h1 className="text-3xl sm:text-4xl font-groovy text-cream tracking-wide leading-tight mb-2">
          Crave Cannatrail Passport
        </h1>
        <p className="text-cream-muted text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
          Scan a Crave Cannatrail sticker at any participating dispensary to stamp
          your passport.
        </p>
        {/* Progress counter */}
        <p className="mt-3 text-amber text-xs tracking-widest uppercase font-bold tabular-nums">
          {collectedCount} <span className="text-cream-muted/40">/</span>{" "}
          {totalCount} collected
        </p>
      </section>

      {/* The passport itself */}
      <section className="flex-1 px-4 sm:px-6 pb-10 max-w-2xl mx-auto w-full flex items-center justify-center">
        <PassportSwiper
          dispensaries={ordered}
          collectedMap={collectedMap}
          justCollectedShopId={justCollectedShopId}
          newlyCollected={newlyCollected}
          errorCode={errorCode}
          isSignedIn={isSignedIn}
        />
      </section>

      {/* CTA strip */}
      <section className="px-4 sm:px-6 pb-12 max-w-2xl mx-auto w-full">
        <div className="border-t border-forest-mid/50 pt-8 text-center">
          <p className="text-cream-muted/80 text-xs sm:text-sm mb-4">
            Ready to plan a route? See every stop on the map.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/trail"
              className="bg-amber text-forest-deep font-bold px-8 py-3 rounded-full hover:bg-amber-hover transition-colors text-xs tracking-widest uppercase shadow-lg shadow-amber/20"
            >
              Open Crave Cannatrail Map
            </Link>
            <Link
              href="/about"
              className="border border-amber/40 text-amber px-6 py-3 rounded-full hover:border-amber/70 hover:bg-amber/10 transition-colors text-[11px] tracking-widest uppercase"
            >
              How It Works
            </Link>
          </div>
          <p className="text-cream-muted/40 text-[10px] leading-relaxed mt-8 max-w-md mx-auto">
            For adults 21+ only. Vermont recreational cannabis law applies.
            Always verify hours and product availability with the dispensary
            before visiting.
          </p>
        </div>
      </section>
    </main>
  );
}
