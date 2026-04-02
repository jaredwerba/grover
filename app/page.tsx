import Link from "next/link";
import Image from "next/image";
import MountainFooter from "@/components/MountainFooter";

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

      {/* Value props */}
      <section className="px-6 pb-24 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: "▲",
              title: "AI Concierge",
              body: "Ask anything about strains, effects, dosing, or terpenes. Cove gives you knowledgeable, personalized guidance.",
            },
            {
              icon: "◉",
              title: "The Cannatrail",
              body: "Vermont's curated network of licensed dispensaries — browse menus, hours, and locations across the state.",
            },
            {
              icon: "★",
              title: "Vermont-First",
              body: "Built for the Vermont market. Local knowledge, local dispensaries, and a community that knows the Green Mountain State.",
            },
          ].map(({ icon, title, body }) => (
            <div
              key={title}
              className="bg-forest border-2 border-forest-mid p-6 rounded-sm relative"
              style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.07)" }}
            >
              <div className="text-amber text-xl mb-3 font-groovy">{icon}</div>
              <h3 className="text-cream font-groovy text-lg mb-2">{title}</h3>
              <p className="text-cream-muted text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <MountainFooter />
    </main>
  );
}
