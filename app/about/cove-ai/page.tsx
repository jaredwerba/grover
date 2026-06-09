import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Cove AAI — Augmented & Artificial Intelligence for Cannabis",
  description:
    "Cove AAI is an AI-native cannabtech company based in Stowe, Vermont. From agentic retrieval pipelines to fully autonomous cultivation — the future of cannabis is compute-native.",
  openGraph: {
    title: "Cove AAI — Augmented & Artificial Intelligence",
    description:
      "AI-native cannabtech. Real-time inventory intelligence today. Fully autonomous AI-driven cultivation tomorrow. Based in Stowe, VT.",
    url: "https://covebud.com/about/cove-ai",
    siteName: "Cove",
    type: "website",
  },
  alternates: {
    canonical: "https://covebud.com/about/cove-ai",
  },
};

export default function CoveAIPage() {
  return (
    <main className="min-h-screen bg-forest-deep text-cream">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10">
        <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-3">
          Stowe, Vermont
        </p>
        <h1 className="text-4xl sm:text-5xl font-groovy text-cream tracking-wide leading-tight mb-3">
          Cove AAI
        </h1>
        <p className="text-amber text-sm sm:text-base tracking-widest uppercase font-bold mb-6">
          Augmented &amp; Artificial Intelligence
        </p>
        <p className="text-cream-muted text-base sm:text-lg leading-relaxed max-w-2xl">
          Cove is an AI-native cannabtech company building the intelligence
          layer for the legal cannabis economy — from seed to sale to
          session. We ship software that thinks, connects systems that
          don&rsquo;t talk to each other, and architect the compute
          infrastructure for a future where the farm runs itself.
        </p>
      </div>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-amber/20" />
      </div>

      {/* What Cove Does Today */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <p className="text-amber text-[10px] tracking-[0.35em] uppercase font-bold mb-4">
          Current Architecture
        </p>
        <h2 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide leading-tight mb-6">
          What Cove ships today
        </h2>
        <div className="space-y-6 text-cream-muted text-sm sm:text-base leading-relaxed">
          <p>
            Cove&rsquo;s production stack is a <strong className="text-cream">multi-model agentic
            pipeline</strong> that ingests, normalizes, and reasons over live
            cannabis data from dispensaries across Vermont. The system
            operates across four layers:
          </p>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <Card
              icon="/images/icons/photo/flower.png"
              label="Cove Connect"
              text="A headless connector mesh that polls dispensary menus in
              real-time via platform-specific adapters — SSR hydration
              extraction (Next.js __NEXT_DATA__, Remix __remixContext),
              public REST API traversal, and headless browser orchestration
              for WAF-gated SPA endpoints. Raw product records are
              normalized into a unified ontology across 10 product types,
              deduplicated, and written to a low-latency key-value store."
            />
            <Card
              icon="/images/icons/3d/flower.png"
              label="Strain Entity Resolution"
              text='Fuzzy entity matching pipeline that resolves dispensary
              product names to canonical strain identities using
              Levenshtein distance, token-set ratio scoring, and a
              manually-curated alias table. Handles brand prefixes,
              weight suffixes, and the "Banana Runtz vs Runtz Banana"
              class of naming inversions common in craft cannabis.'
            />
            <Card
              icon="/images/icons/3d/misc.png"
              label="Cove AI Chat"
              text="Retrieval-augmented generation (RAG) grounded in
              hyperlocal Vermont dispensary data, real-time product
              availability, and a structured strain knowledge base.
              Frontier LLM inference via Anthropic Claude, with
              context-window management, system-prompt persona control,
              and safety guardrails tuned for cannabis-specific
              regulatory constraints."
            />
            <Card
              icon="/images/icons/3d/seeds.png"
              label="CRAV Cannatrail"
              text="Geospatial dispensary intelligence — an interactive map
              of every licensed retail cannabis location in the state,
              enriched with live inventory badges, sync freshness
              indicators, and deep-linked product availability. Server-rendered
              for zero-JS initial paint with client hydration for
              map interactivity."
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-amber/20" />
      </div>

      {/* Mission Statements */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <p className="text-amber text-[10px] tracking-[0.35em] uppercase font-bold mb-4">
          Mission
        </p>
        <div className="space-y-10">
          <Statement
            heading="Cove AI enables"
            body="growers, dispensaries, and consumers to make faster, smarter
            decisions grounded in real data — not guesswork. Growers
            optimize yield and compliance with live environmental
            telemetry. Dispensaries surface the right product to the
            right customer at the right moment. Consumers discover
            strains matched to their preferences, compare live prices
            across every shop in the state, and walk into a dispensary
            already knowing what they want."
          />
          <Statement
            heading="Cove AI leverages"
            body="frontier foundation models grounded in hyperlocal Vermont
            data to deliver inference that generic AI cannot. Our RAG
            pipeline doesn't hallucinate dispensary hours or invent
            strains — it reads from live-synced menus, a curated strain
            ontology, and Vermont-specific regulatory context. Every
            recommendation is traceable to a real product on a real
            shelf, priced in real-time, at a shop you can drive to."
          />
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-amber/20" />
      </div>

      {/* Future State — Autonomous Farming */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <p className="text-amber text-[10px] tracking-[0.35em] uppercase font-bold mb-4">
          Future State
        </p>
        <h2 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide leading-tight mb-3">
          Autonomous Cultivation
        </h2>
        <p className="text-amber/80 text-xs tracking-widest uppercase font-bold mb-8">
          Self-Custody Compute &middot; Air-Gapped Inference &middot; Zero Chemical Inputs
        </p>

        <div className="space-y-6 text-cream-muted text-sm sm:text-base leading-relaxed">
          <p>
            Cove&rsquo;s terminal architecture is a <strong className="text-cream">fully
            autonomous cultivation system</strong> — an AI-native grow
            operation where every environmental variable is sensed,
            modeled, and actuated by on-premise intelligence with{" "}
            <strong className="text-cream">zero outbound connection to the internet</strong>.
          </p>

          <p>
            The compute layer runs on <strong className="text-cream">local self-custody
            hardware</strong> — inference-optimized edge accelerators
            (NVIDIA Jetson-class or Apple Silicon Mac clusters) executing
            quantized open-weight models fine-tuned on cultivar-specific
            grow data. No cloud dependency. No API calls leaving the
            building. The farm&rsquo;s intelligence lives on the
            farm&rsquo;s hardware, owned by the farmer.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 pt-2">
            <FutureCard
              icon="/images/icons/photo/accessory.png"
              label="IoT Sensor Mesh"
              text="High-density environmental telemetry — temperature,
              relative humidity, VPD, CO2 concentration, photosynthetically
              active radiation (PAR), soil moisture tension, pH, electrical
              conductivity, dissolved oxygen. Sub-minute sampling intervals
              feeding a local time-series database."
            />
            <FutureCard
              icon="/images/icons/photo/capsules.png"
              label="Closed-Loop Actuation"
              text="AI-driven control surfaces for HVAC, CO2 injection,
              irrigation drip schedules, LED spectrum tuning, and
              dehumidification. The model observes, predicts, and
              adjusts — no human in the loop for routine environmental
              homeostasis. Operator overrides via a local dashboard,
              never a cloud console."
            />
            <FutureCard
              icon="/images/icons/photo/concentrate.png"
              label="Computer Vision Phenotyping"
              text="Multispectral canopy imaging for early pathogen
              detection, trichome maturity staging, nutrient deficiency
              classification, and harvest-window prediction. On-device
              inference at the camera node — latency measured in
              milliseconds, not round-trips."
            />
            <FutureCard
              icon="/images/icons/3d/flower-v2.png"
              label="Biological Pest Management"
              text="A fully autonomous farm needs zero pesticides and zero
              insecticides. Cove's vision system identifies pest
              pressure before it's visible to the human eye — mite
              colonies at the 10-individual stage, powdery mildew
              spores pre-germination — and triggers targeted biological
              countermeasures: beneficial insect release, UV-C
              sterilization pulses, microclimate adjustments that
              suppress pathogen vectors without chemical intervention."
            />
          </div>

          <p className="pt-4">
            The result: <strong className="text-cream">craft-quality cannabis grown at
            computational precision</strong>, with a full provenance chain
            from seed genetics to cured flower — every environmental
            decision logged, every input traceable, every harvest
            reproducible. The farmer becomes the architect, not the
            operator. The AI handles the <em>how</em>. The human decides
            the <em>what</em> and the <em>why</em>.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="h-px bg-amber/20" />
      </div>

      {/* Closing CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 pb-24">
        <p className="text-cream-muted text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
          Cove AAI is building the augmented intelligence layer for cannabis —
          bridging the gap between today&rsquo;s fragmented dispensary data
          and tomorrow&rsquo;s fully autonomous grow operations. Based in
          Stowe, Vermont. Shipping production software now.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/trail"
            className="bg-amber text-forest-deep text-xs font-bold px-5 py-2.5 rounded-sm tracking-widest uppercase hover:bg-amber/90 transition-colors"
          >
            Open CRAV Cannatrail
          </Link>
          <Link
            href="/strain"
            className="border border-forest-mid text-cream-muted text-xs font-bold px-5 py-2.5 rounded-sm tracking-widest uppercase hover:border-amber/40 hover:text-cream transition-colors"
          >
            Strain Library
          </Link>
          <Link
            href="/chat"
            className="border border-forest-mid text-cream-muted text-xs font-bold px-5 py-2.5 rounded-sm tracking-widest uppercase hover:border-amber/40 hover:text-cream transition-colors"
          >
            Talk to Cove
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ── Reusable sub-components (server components, no "use client") ──── */

function Card({ label, text, icon }: { label: string; text: string; icon?: string }) {
  return (
    <div
      className="rounded-sm p-5 border border-forest-mid/40"
      style={{ background: "rgba(255,185,0,0.03)" }}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <Image
            src={icon}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            aria-hidden="true"
          />
        )}
        <p className="text-amber text-[10px] tracking-[0.3em] uppercase font-bold">
          {label}
        </p>
      </div>
      <p className="text-cream-muted text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function FutureCard({ label, text, icon }: { label: string; text: string; icon?: string }) {
  return (
    <div
      className="rounded-sm p-5 border border-amber/15"
      style={{ background: "rgba(255,185,0,0.05)" }}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <Image
            src={icon}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            aria-hidden="true"
          />
        )}
        <p className="text-cream text-xs tracking-[0.25em] uppercase font-bold">
          {label}
        </p>
      </div>
      <p className="text-cream-muted text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function Statement({ heading, body }: { heading: string; body: string }) {
  return (
    <div>
      <h3 className="text-cream text-lg sm:text-xl font-bold mb-2 leading-snug">
        {heading}
      </h3>
      <p className="text-cream-muted text-sm sm:text-base leading-relaxed max-w-2xl">
        {body}
      </p>
    </div>
  );
}
