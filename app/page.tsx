import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-forest text-cream flex flex-col">
      {/* Hero — vintage Vermont poster layout */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20">

        {/* Poster badge frame */}
        <div className="relative inline-flex flex-col items-center border-2 border-amber/40 px-10 py-10 mb-10"
          style={{ boxShadow: "inset 0 0 0 4px rgba(255,185,0,0.1)" }}>

          {/* Corner marks */}
          <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber/60" />
          <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber/60" />
          <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber/60" />
          <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber/60" />

          {/* State tag */}
          <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-4">
            Vermont · Est. 2024
          </p>

          <div className="text-[7rem] md:text-[9rem] font-groovy text-amber leading-none mb-1">
            C
          </div>
          <h1 className="text-5xl md:text-7xl font-groovy text-cream mb-3 tracking-wide">
            Cove
          </h1>

          {/* Divider rule */}
          <div className="flex items-center gap-3 mb-3 w-full max-w-xs">
            <div className="flex-1 h-px bg-amber/30" />
            <span className="text-amber/50 text-xs">✦</span>
            <div className="flex-1 h-px bg-amber/30" />
          </div>

          <p className="text-sm tracking-[0.2em] uppercase text-cream-muted font-medium">
            Cannabis Companion
          </p>
        </div>

        <p className="text-base text-cream-muted mb-10 max-w-sm leading-relaxed">
          Explore the Cannatrail, discover local dispensaries, and get expert
          guidance — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/join"
            className="bg-amber text-forest-deep font-bold px-10 py-4 rounded-sm hover:bg-amber-hover transition-colors text-base tracking-wide uppercase text-sm"
          >
            VIP
          </Link>
          <Link
            href="/trail"
            className="border-2 border-forest-mid text-cream px-10 py-4 rounded-sm hover:border-amber/50 hover:bg-forest transition-colors text-sm tracking-wide uppercase"
          >
            Explore the Cannatrail
          </Link>
        </div>
      </section>

      {/* Logo section — replaces value prop cards */}
      <section className="flex flex-col items-center pb-24">
        <Image
          src="/images/logotrans.png"
          alt="Cove"
          width={280}
          height={117}
          className="block mb-4"
        />
        <p className="text-cream-muted text-xs tracking-[0.3em] uppercase font-semibold">
          Cannabis Companion
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-forest-mid px-6 py-5 text-center">
        <p className="text-cream-muted text-xs tracking-widest uppercase">
          Cove · Adults 21+ Only · Vermont State Law Applies
        </p>
      </footer>
    </main>
  );
}
