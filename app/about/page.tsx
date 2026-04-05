import type { Metadata } from "next";
import Link from "next/link";
import AboutNav from "@/components/AboutNav";

export const metadata: Metadata = {
  title: "About Cove — Vermont Cannabis Guide, Cannatrail & AI Concierge",
  description:
    "Vermont cannabis guide — what first-timers need to know, edibles vs smoking, how long edibles last, tourist laws, and how AI helps you choose the right product before visiting a dispensary.",
  openGraph: {
    title: "About Cove — Vermont Cannabis Guide",
    description:
      "Vermont cannabis for first-timers, tourists, and curious consumers. Cannatrail dispensary map, strain library, and Cove AI — your Vermont cannabis companion.",
    url: "https://cove.garden/about",
    siteName: "Cove",
    type: "website",
  },
  alternates: {
    canonical: "https://cove.garden/about",
  },
};

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
        heading: "Ask Cove AI",
        text: "Everyone's endocannabinoid system responds differently. Cove's AI can help you narrow down the right afternoon strain based on your tolerance, goals, and what's actually available at your nearest dispensary on the Cannatrail.",
      },
    ],
  },
  {
    id: "first-time-vermont",
    question: "I've never used cannabis before, what should I know in Vermont?",
    shortAnswer:
      "Vermont cannabis is legal for adults 21+. Start with a low dose, choose a dispensary on the Cannatrail, tell your budtender it's your first time, and pick a low-THC product. Go slow — you can always use more, never less.",
    body: [
      {
        heading: "Vermont is a legal, regulated market",
        text: "Vermont legalized adult-use cannabis in 2022. Every dispensary on the Cannatrail is licensed by the Vermont Cannabis Control Board — products are lab-tested for potency and contaminants. You're buying from a regulated, legal retailer, not the street.",
      },
      {
        heading: "Start low, go slow",
        text: "The most important rule for first-timers: less is more. Start with a product that has 5–10% THC or lower. For edibles, 2.5–5mg is a first-time dose — not the full 10mg. Effects can take 30–90 minutes to appear with edibles. With flower, one or two small puffs and wait 15 minutes before deciding if you want more.",
      },
      {
        heading: "Tell your budtender it's your first time",
        text: "Vermont dispensary staff are trained to help new consumers. If you walk in and say 'this is my first time,' they'll slow down, explain everything, and recommend something appropriate. There's no judgment — every regular was a first-timer once.",
      },
      {
        heading: "Choose the right format",
        text: "For first-timers, Cove recommends either a low-dose edible (easy to control, no smoke) or a pre-roll with a low-THC cultivar. Avoid concentrates, vape pens with high potency, or anything labeled 'live resin' or 'rosin' on your first visit — these are for experienced consumers.",
      },
      {
        heading: "Set and setting",
        text: "Where you are and how you feel going in matters. Choose a comfortable, familiar environment. Don't mix with alcohol. Have water and snacks nearby. Have a friend with you if possible. Plan to stay in for the evening — don't drive.",
      },
      {
        heading: "What if you use too much?",
        text: "Overconsumption is uncomfortable but not dangerous. If you feel anxious or overwhelmed: lie down, breathe slowly, drink water, eat something, and remind yourself that it will pass — typically within 1–2 hours. CBD can help counteract THC anxiety; some dispensaries carry CBD tinctures for exactly this purpose.",
      },
    ],
  },
  {
    id: "edibles-vs-smoking",
    question: "What's the difference between edibles and smoking weed?",
    shortAnswer:
      "Edibles are processed through your digestive system — slower to kick in (30–90 minutes), longer lasting (4–8 hours), and more intense per milligram. Smoking or vaping hits in minutes and fades in 1–3 hours. The same amount of THC feels very different between the two.",
    body: [
      {
        heading: "How edibles work",
        text: "When you eat a cannabis edible, THC is absorbed through the gut and processed by the liver, which converts it into 11-hydroxy-THC — a more potent compound than the delta-9 THC from smoking. This is why edibles feel stronger and last longer even at the same THC content. Onset is 30–90 minutes depending on your metabolism and whether you've eaten recently.",
      },
      {
        heading: "How smoking and vaping work",
        text: "Inhaled cannabis enters the bloodstream through the lungs in seconds. Effects are felt within minutes, peak around 20–30 minutes, and generally fade within 1–3 hours. This rapid onset makes it easier to control your experience — you can take one puff, wait, and decide if you want more.",
      },
      {
        heading: "Duration comparison",
        text: "Smoking/vaping: 1–3 hours. Edibles: 4–8 hours, sometimes longer. This is the most important difference for new consumers. An edible you take at 7pm may still be active at midnight. Plan your evening accordingly.",
      },
      {
        heading: "Dosing differences",
        text: "Vermont edibles are labeled in milligrams of THC. A standard dose is 10mg, but most cannabis educators recommend 2.5–5mg for beginners. The most common mistake: taking a 10mg edible, not feeling it after an hour, and taking another — then both kick in simultaneously. Wait at least 2 hours before taking more.",
      },
      {
        heading: "Which is right for you?",
        text: "Edibles are great for longer, more controlled experiences — sleep, relaxation, or managing chronic symptoms. Smoking is better for social situations, quick relief, or when you want to control the intensity in real time. Both are available at every dispensary on the Cannatrail. Cove AI can help you choose based on your goals.",
      },
    ],
  },
  {
    id: "how-long-10mg-edible",
    question: "How long does a 10mg edible last?",
    shortAnswer:
      "A 10mg THC edible typically lasts 4–6 hours, with effects peaking around 2–3 hours after consumption. For some people, especially those new to edibles, the experience can extend to 8 hours or more.",
    body: [
      {
        heading: "The timeline of a 10mg edible",
        text: "0–30 min: likely nothing noticeable. 30–90 min: onset — mild effects begin. 2–3 hours: peak effects — this is when the experience is strongest. 3–6 hours: gradual decline. 6–8 hours: most effects resolved, possible mild residual drowsiness. Total experience varies significantly by individual.",
      },
      {
        heading: "Why it varies person to person",
        text: "Metabolism, body weight, tolerance, whether you ate recently, and your individual endocannabinoid system all affect duration. Someone with no cannabis tolerance who takes 10mg on an empty stomach may feel effects for 8+ hours. A regular cannabis user might feel the same dose for 3–4 hours. There's no universal answer — that's why starting with 5mg is the standard first-timer recommendation.",
      },
      {
        heading: "Peak intensity at 10mg",
        text: "10mg is the standard 'one serving' printed on Vermont cannabis packaging. For an experienced user it's moderate. For a first-timer it can be quite strong. The peak at 2–3 hours is typically the most intense point — plan to be somewhere comfortable and not driving during this window.",
      },
      {
        heading: "When to take another dose (and when not to)",
        text: "The golden rule: wait at least 2 hours from your first dose before considering a second. Most overconsumption incidents happen because someone didn't feel anything at 45 minutes and took more — then both doses peaked together. If you've waited 2 hours and feel only mild effects, a small additional amount (2.5–5mg) is reasonable.",
      },
      {
        heading: "Planning your evening",
        text: "If you take a 10mg edible at 7pm, expect to feel it until at least midnight, possibly later. Don't plan to drive. Don't mix with alcohol. Have food and water available. Vermont law prohibits driving under the influence of cannabis — the same as alcohol.",
      },
    ],
  },
  {
    id: "cannabis-legal-tourists-vermont",
    question: "Is cannabis legal for tourists in Vermont?",
    shortAnswer:
      "Yes. Vermont's adult-use cannabis law applies to all adults 21+ regardless of residency. Tourists can legally purchase and consume cannabis in Vermont. You do not need to be a Vermont resident.",
    body: [
      {
        heading: "Vermont cannabis is open to all adults 21+",
        text: "Vermont's adult-use cannabis law — Act 164 — makes no distinction between residents and non-residents. Any adult 21 or older with valid government-issued ID can purchase cannabis at a licensed dispensary. Out-of-state IDs and passports are accepted.",
      },
      {
        heading: "What you can buy and how much",
        text: "Adults can purchase up to 1 ounce (28 grams) of cannabis flower, or the equivalent in other products, per transaction. Vermont dispensaries sell flower, pre-rolls, edibles, concentrates, tinctures, and topicals. All products are labeled with THC/CBD content and produced under state oversight.",
      },
      {
        heading: "Where you can consume",
        text: "Vermont law permits consumption on private property with the owner's permission. Public consumption — streets, parks, public buildings, ski resort property — is prohibited and can result in a fine. Check with your hotel, Airbnb, or rental property before consuming indoors. Most hotels prohibit it; many private rentals are more flexible.",
      },
      {
        heading: "Do not cross state lines",
        text: "This is the most important rule for tourists: cannabis purchased in Vermont cannot legally leave Vermont. Transporting cannabis across state lines is a federal offense, even if you're traveling to another legal state. Do not take it on an airplane. Do not put it in your car and drive to New Hampshire.",
      },
      {
        heading: "Find a dispensary on the Cannatrail",
        text: "Every licensed Vermont dispensary is mapped on the Cannatrail — Cove's interactive dispensary directory. Whether you're skiing Stowe, hiking the Long Trail, or visiting Burlington's Church Street, there's likely a licensed dispensary nearby. Use Cannatrail to find locations, hours, and menus before you visit.",
      },
    ],
  },
  {
    id: "cannabis-safely-first-time",
    question: "How do I use cannabis safely for the first time?",
    shortAnswer:
      "Choose a low-THC product, start with a very small amount, stay in a comfortable setting, don't mix with alcohol, and don't drive. Having a sober friend nearby is ideal. Give it time to work before taking more.",
    body: [
      {
        heading: "Choose the right product",
        text: "For first-timers, a 1:1 CBD:THC product (equal parts CBD and THC) is ideal — the CBD moderates the psychoactive effects of THC and reduces anxiety. Alternatively, a low-THC flower (10–15% THC) or a 2.5–5mg edible is appropriate. Avoid anything marketed as 'strong,' 'potent,' or with THC above 20% for your first experience.",
      },
      {
        heading: "Control your dose",
        text: "If smoking: one small puff, then wait 15 minutes. If you feel comfortable and want more, take another. If using an edible: 2.5–5mg and then wait a full 2 hours. The goal is to feel something gentle, not to get overwhelmed. You can always take more on a future occasion.",
      },
      {
        heading: "Prepare your environment",
        text: "Choose a comfortable, private space — your home, a friend's house, or a private rental. Have water, snacks, and something enjoyable to do (a show, music, a walk outside). Clear your schedule for the rest of the evening. Don't plan to drive, work, or handle any responsibilities.",
      },
      {
        heading: "Don't mix with alcohol",
        text: "Alcohol and cannabis together significantly amplify both effects — a common cause of unpleasant first experiences. Drink water instead. If you've had even one or two drinks, reduce your cannabis dose further or skip it entirely.",
      },
      {
        heading: "Know what to do if it's too much",
        text: "If you feel anxious, paranoid, or overwhelmed: you are safe and it will pass. Lie down, close your eyes, breathe slowly. Drink water and eat something. A few deep breaths of fresh air helps. CBD (a tincture or a CBD-dominant product) can reduce THC anxiety — ask your Vermont dispensary about having some on hand before your first experience.",
      },
      {
        heading: "Use Cove AI to prepare",
        text: "Before your first dispensary visit, ask Cove AI your questions — what strain, what format, what dose, what effects to expect. Coming in informed makes the dispensary experience less overwhelming and helps you make a better first choice. The Cannatrail will show you which dispensaries are closest to where you are in Vermont.",
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
