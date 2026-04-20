import type { Metadata } from "next";
import Link from "next/link";
import AboutNav from "@/components/AboutNav";
import { AEO_SECTIONS } from "@/lib/about-sections";

export const metadata: Metadata = {
  title: "About Cove — Vermont Cannabis Guide, Cannatrail & AI Concierge",
  description:
    "Vermont cannabis guide — what first-timers need to know, edibles vs smoking, how long edibles last, tourist laws, and how AI helps you choose the right product before visiting a dispensary.",
  openGraph: {
    title: "About Cove — Vermont Cannabis Guide",
    description:
      "Vermont cannabis for first-timers, tourists, and curious consumers. Cannatrail dispensary map, strain library, and Cove AI — your Vermont cannabis companion.",
    url: "https://covebud.com/about",
    siteName: "Cove",
    type: "website",
  },
  alternates: {
    canonical: "https://covebud.com/about",
  },
};

// JSON-LD FAQ schema — parsed directly by Google and AI models
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: AEO_SECTIONS.map((s) => ({
    "@type": "Question",
    name: s.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: [s.shortAnswer, ...s.body.map((b) => `${b.heading}: ${b.text}`)].join(" "),
    },
  })),
};

const navSections = AEO_SECTIONS.map(({ id, question }) => ({ id, question }));

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-forest-deep text-cream">
      {/* JSON-LD — in body is valid and Next.js-idiomatic */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Page header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-2">
          Cove · Vermont Cannabis
        </p>
        <h1 className="text-3xl sm:text-4xl font-groovy text-cream tracking-wide leading-tight mb-2">
          About
        </h1>
        <p className="text-cream-muted text-sm max-w-xl leading-relaxed">
          Learn how Cannatrail works, how to choose the right strain, and why AI makes the experience better.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Sidebar nav — client island for scroll-aware highlighting */}
          <aside className="lg:w-64 shrink-0">
            <AboutNav sections={navSections} />
          </aside>

          {/* Content — all sections always in DOM, server-rendered */}
          <div className="flex-1 min-w-0 flex flex-col gap-16">
            {AEO_SECTIONS.map((section) => (
              <article key={section.id} id={section.id} className="scroll-mt-24">
                {/* Direct answer — structured for AI snippet extraction */}
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide leading-tight mb-4">
                    {section.question}
                  </h2>
                  <div
                    className="border-l-4 border-amber pl-4 py-1"
                    style={{ background: "rgba(255,185,0,0.06)" }}
                  >
                    <p className="text-cream text-sm sm:text-base leading-relaxed font-semibold">
                      {section.shortAnswer}
                    </p>
                  </div>
                </div>

                {/* Full body */}
                <div className="space-y-8">
                  {section.body.map((block) => (
                    <div key={block.heading}>
                      <h3 className="text-cream text-base sm:text-lg font-bold mb-2 leading-snug">
                        {block.heading}
                      </h3>
                      <p className="text-cream-muted text-sm sm:text-base leading-relaxed">
                        {block.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-10 pt-8 border-t border-forest-mid/40 flex flex-wrap gap-3">
                  <Link
                    href="/trail"
                    className="bg-amber text-forest-deep text-xs font-bold px-5 py-2.5 rounded-sm tracking-widest uppercase hover:bg-amber/90 transition-colors"
                  >
                    Open Cannatrail
                  </Link>
                  <Link
                    href="/strain"
                    className="border border-forest-mid text-cream-muted text-xs font-bold px-5 py-2.5 rounded-sm tracking-widest uppercase hover:border-amber/40 hover:text-cream transition-colors"
                  >
                    Browse Strains
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
