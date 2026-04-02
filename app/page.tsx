import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-forest text-cream flex flex-col">
      {/* Hero — vintage Vermont poster layout */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20">

        <Image
          src="/images/logotrans.png"
          alt="Cove"
          width={260}
          height={109}
          className="block mb-10"
          priority
        />

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

      {/* Footer */}
      <footer className="border-t-2 border-forest-mid px-6 py-5 text-center">
        <p className="text-cream-muted text-xs tracking-widest uppercase">
          Cove · Adults 21+ Only · Vermont State Law Applies
        </p>
      </footer>
    </main>
  );
}
