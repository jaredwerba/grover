import Image from "next/image";
import Link from "next/link";
import QuickLoginButton from "@/components/QuickLoginButton";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-forest-deep text-cream flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 py-24">
        <div className="mb-6">
          <Image
            src="/images/logo.jpg"
            alt="Cove"
            width={240}
            height={357}
            priority
            className="w-40 h-auto sm:w-52 md:w-60 drop-shadow-2xl"
          />
        </div>
        <p className="text-xl text-cream-muted mb-3 max-w-md leading-relaxed">
          Your Vermont cannabis companion
        </p>
        <p className="text-sm text-cream-muted mb-12 max-w-sm">
          Explore the Cannatrail, discover local dispensaries, and get expert
          guidance — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <QuickLoginButton />
          <Link
            href="/trail"
            className="border border-forest-mid text-cream px-10 py-4 rounded-full hover:border-forest-light hover:bg-forest transition-colors text-base"
          >
            Explore the Cannatrail
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-forest rounded-2xl p-6 border border-forest-mid">
            <div className="text-amber text-2xl mb-3">✦</div>
            <h3 className="text-cream font-semibold text-lg mb-2">
              AI Concierge
            </h3>
            <p className="text-cream-muted text-sm leading-relaxed">
              Ask anything about strains, effects, dosing, or terpenes. Cove
              gives you knowledgeable, personalized guidance.
            </p>
          </div>
          <div className="bg-forest rounded-2xl p-6 border border-forest-mid">
            <div className="text-amber text-2xl mb-3">⊹</div>
            <h3 className="text-cream font-semibold text-lg mb-2">
              The Cannatrail
            </h3>
            <p className="text-cream-muted text-sm leading-relaxed">
              Vermont&apos;s curated network of licensed dispensaries — browse
              menus, hours, and locations across the state.
            </p>
          </div>
          <div className="bg-forest rounded-2xl p-6 border border-forest-mid">
            <div className="text-amber text-2xl mb-3">◈</div>
            <h3 className="text-cream font-semibold text-lg mb-2">
              Vermont-First
            </h3>
            <p className="text-cream-muted text-sm leading-relaxed">
              Built for the Vermont market. Local knowledge, local dispensaries,
              and a community that knows the Green Mountain State.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-forest-mid px-6 py-6 text-center">
        <p className="text-cream-muted text-xs">
          Cove is for adults 21+ only. Vermont state law applies. Not medical
          advice.
        </p>
      </footer>
    </main>
  );
}
