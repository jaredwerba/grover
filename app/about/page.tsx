"use client";

import { useState } from "react";
import Link from "next/link";

const AEO_SECTIONS = [
  {
    id: "what-is-cannatrail",
    question: "What is Cannatrail?",
    shortAnswer:
      "Cannatrail is Vermont's curated map of every licensed cannabis dispensary — built so you can browse locations, menus, and hours before you leave the house.",
    body: [
      {
        heading: "Vermont's cannabis guide, all in one place",
        text: "Vermont legalized adult-use cannabis in 2022. Since then, licensed dispensaries have opened across the state — from Burlington's South End to the Northeast Kingdom. Cannatrail plots every one of them on an interactive map with real addresses, phone numbers, and direct links to menus.",
      },
      {
        heading: "Medical and recreational, together",
        text: "Some dispensaries are adult-use only. Others hold medical registrations and serve patients with a Vermont Medical Cannabis Registry card. Cannatrail shows both — filter by type, or browse everything at once.",
      },
      {
        heading: "Built for Vermonters (and the people who visit them)",
        text: "Whether you live here or you're passing through on the way to Stowe, Cannatrail makes it easy to find the closest dispensary, compare their product selection, and get there without guessing. Every location on the trail is state-licensed and verified.",
      },
      {
        heading: "The Cannatrail is part of Cove",
        text: "Cove is a Vermont cannabis companion app — Cannatrail is its map layer. Alongside the trail you'll find a strain library, an AI concierge, and resources for new and experienced cannabis consumers alike.",
      },
    ],
  },
  {
    id: "best-afternoon-strain",
    question: "Best afternoon strain",
    shortAnswer:
      "For afternoon use, sativa-dominant strains are ideal — they deliver focused, creative energy without sedation. Top picks include Durban Poison, Jack Herer, and Lemon Haze.",
    body: [
      {
        heading: "Why afternoon calls for a different strain",
        text: "The afternoon window — roughly 1pm to 6pm — sits between the productive morning and the wind-down evening. You want something that keeps you present and functional, not couch-locked. That rules out most heavy Indicas and points squarely at Sativas and light Hybrids.",
      },
      {
        heading: "Top afternoon Sativas",
        text: "Durban Poison is the benchmark: a pure landrace Sativa from South Africa with clean, focused energy and a sweet anise aroma. Jack Herer adds a creative, blissful quality — named for the cannabis activist, it's a classic for a reason. Lemon Haze brings a bright citrus lift that works well for social afternoons or outdoor activity.",
      },
      {
        heading: "Light Hybrids that work",
        text: "If pure Sativas feel too racy, Green Crack and Pineapple Express sit in a sweet spot — sativa-dominant hybrids that carry the productive energy of a Sativa with just enough body to stay grounded. Both are commonly available at Vermont dispensaries.",
      },
      {
        heading: "What to avoid in the afternoon",
        text: "Avoid high-myrcene Indicas like Granddaddy Purple, Northern Lights, or Purple Punch in the afternoon — their sedative terpene profile is better saved for evening. Similarly, Gorilla Glue #4 and Wedding Cake can feel heavy if you have things to do.",
      },
      {
        heading: "Ask Cove",
        text: "Everyone's endocannabinoid system responds differently. Cove's AI can help you narrow down the right afternoon strain based on your tolerance, goals, and what's actually available at your nearest dispensary on the Cannatrail.",
      },
    ],
  },
  {
    id: "why-ai-before-ordering",
    question: "Why AI improves understanding before ordering",
    shortAnswer:
      "AI helps you match cannabis to your actual needs — effects, tolerance, terpenes — before you walk into a dispensary. You get a better outcome, and the budtender can focus on serving rather than educating from scratch.",
    body: [
      {
        heading: "The problem with winging it at the counter",
        text: "Most cannabis consumers walk into a dispensary with a vague idea of what they want — 'something relaxing' or 'not too strong.' Budtenders are helpful, but they're working a busy counter, not running a consultation. The result is guesswork. You leave with something that might work, or might not.",
      },
      {
        heading: "What AI can do before you visit",
        text: "An AI cannabis concierge can ask the right questions: What are you trying to achieve? What time of day? What's your tolerance? Do you prefer flower, edibles, or vapes? What terpenes have worked for you before? It synthesizes your answers into a specific recommendation — strain, format, dose range — before you ever step foot in a store.",
      },
      {
        heading: "Terpenes are the real story",
        text: "THC percentage is the most visible number on a dispensary menu, but it's a poor predictor of experience. Terpenes — the aromatic compounds that give each strain its character — are a far better guide. Myrcene promotes sedation. Limonene elevates mood. Pinene sharpens focus. AI can explain the terpene profile of any strain and help you understand why it might or might not work for you.",
      },
      {
        heading: "Better decisions, less waste",
        text: "Cannabis isn't cheap. A $60 eighth of the wrong strain is money and an experience lost. Understanding your options before you buy — through a conversational AI that knows the strain library — dramatically reduces the chance of a mismatch. Cove's AI is built specifically for Vermont's market and the strains available on the Cannatrail.",
      },
      {
        heading: "The budtender relationship improves too",
        text: "When you arrive informed, the conversation with your budtender shifts from 101-level education to refinement. You can ask about specific cultivars, compare two strains you've already researched, or ask what's fresh that week. That's a better experience for everyone.",
      },
    ],
  },
];

export default function AboutPage() {
  const [active, setActive] = useState(AEO_SECTIONS[0].id);

  const activeSection = AEO_SECTIONS.find((s) => s.id === active)!;

  return (
    <main className="min-h-screen bg-forest-deep text-cream">
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

      {/* Desktop: two-column | Mobile: stacked */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Sidebar nav — sticky on desktop, horizontal pills on mobile */}
          <aside className="lg:w-64 shrink-0">
            {/* Mobile: horizontal pill row */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
              {AEO_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActive(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`shrink-0 text-[11px] font-bold tracking-widest uppercase px-4 py-2 rounded-sm transition-colors whitespace-nowrap ${
                    active === s.id
                      ? "bg-amber text-forest-deep"
                      : "border border-forest-mid text-cream-muted hover:border-amber/40 hover:text-cream"
                  }`}
                >
                  {s.question}
                </button>
              ))}
            </div>

            {/* Desktop: sticky vertical nav */}
            <nav className="hidden lg:flex flex-col gap-1 sticky top-20">
              <p className="text-amber/60 text-[10px] tracking-[0.3em] uppercase font-bold mb-3 px-3">
                Topics
              </p>
              {AEO_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActive(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`text-left text-sm px-3 py-2.5 rounded-sm transition-colors leading-snug ${
                    active === s.id
                      ? "bg-amber/15 text-amber border-l-2 border-amber"
                      : "text-cream-muted hover:text-cream hover:bg-forest-mid/30 border-l-2 border-transparent"
                  }`}
                >
                  {s.question}
                </button>
              ))}

              <div className="mt-8 pt-8 border-t border-forest-mid/40 px-3 flex flex-col gap-2">
                <Link
                  href="/trail"
                  className="text-amber text-xs font-bold tracking-widest uppercase hover:text-amber/70 transition-colors"
                >
                  Explore the Cannatrail ↗
                </Link>
                <Link
                  href="/strain"
                  className="text-amber text-xs font-bold tracking-widest uppercase hover:text-amber/70 transition-colors"
                >
                  Strain Library ↗
                </Link>
              </div>
            </nav>
          </aside>

          {/* Content — full readable articles */}
          <div className="flex-1 min-w-0">

            {/* Mobile: show all sections stacked */}
            <div className="flex lg:hidden flex-col gap-12">
              {AEO_SECTIONS.map((s) => (
                <article key={s.id} id={s.id}>
                  <AeoSection section={s} />
                </article>
              ))}
            </div>

            {/* Desktop: show active section as full page */}
            <div className="hidden lg:block">
              <article id={activeSection.id}>
                <AeoSection section={activeSection} />
              </article>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AeoSection({
  section,
}: {
  section: (typeof AEO_SECTIONS)[number];
}) {
  return (
    <div>
      {/* Direct answer — optimized for AI snippet extraction */}
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

      {/* Full body — scrollable sections */}
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
    </div>
  );
}
