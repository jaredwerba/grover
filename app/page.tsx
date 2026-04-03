import Link from "next/link";
import Image from "next/image";
import MountainFooter from "@/components/MountainFooter";

export default function LandingPage() {
  return (
    <main className="text-cream flex flex-col relative z-10" style={{ background: "transparent" }}>
      {/* Solid content area — ski map hidden behind this */}
      <div style={{ background: "#0b2d1b", position: "relative", zIndex: 1 }}>
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

      {/* Chat UI — prototype */}
      <section className="w-full">
        <div className="px-6 pb-16 max-w-2xl mx-auto">
        {/* Chat window */}
        <div className="bg-forest border-2 border-forest-mid rounded-sm overflow-hidden"
          style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.06)" }}>

          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-forest-mid">
            <div className="w-2 h-2 rounded-full bg-amber" />
            <span className="text-amber text-xs tracking-widest uppercase font-bold">Cove AI</span>
            <span className="text-cream-muted/40 text-xs ml-auto">Cannabis Concierge</span>
          </div>

          {/* Messages */}
          <div className="px-4 py-5 space-y-4 min-h-[200px]">
            {/* AI greeting */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-sm bg-amber/20 border border-amber/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber text-xs font-groovy">C</span>
              </div>
              <div className="bg-forest-mid/50 rounded-sm px-4 py-3 max-w-xs">
                <p className="text-cream text-sm leading-relaxed">
                  Hey — I&apos;m Cove. Ask me anything about Vermont cannabis: strains, dispensaries, effects, or dosing.
                </p>
              </div>
            </div>

            {/* User message */}
            <div className="flex gap-3 justify-end">
              <div className="bg-amber/10 border border-amber/20 rounded-sm px-4 py-3 max-w-xs">
                <p className="text-cream text-sm leading-relaxed">
                  where is the best locally grown blue dragon?
                </p>
              </div>
              <div className="w-6 h-6 rounded-sm bg-forest-mid border border-forest-mid flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-cream-muted text-xs">U</span>
              </div>
            </div>

            {/* AI typing indicator */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-sm bg-amber/20 border border-amber/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber text-xs font-groovy">C</span>
              </div>
              <div className="bg-forest-mid/50 rounded-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="border-t border-forest-mid px-4 py-3 flex gap-3 items-center">
            <input
              type="text"
              defaultValue="where is the best locally grown blue dragon?"
              readOnly
              className="flex-1 bg-transparent text-cream text-sm placeholder:text-cream-muted/40 outline-none"
            />
            <button
              className="bg-amber text-forest-deep text-xs font-bold px-4 py-2 rounded-sm tracking-widest uppercase hover:bg-amber-hover transition-colors"
            >
              Ask
            </button>
          </div>
        </div>

        <p className="text-center text-cream-muted text-sm tracking-wide mt-4">
          Join to unlock the full Cove experience
        </p>
        </div>
      </section>

      {/* Value props */}
      <section className="w-full">
        <div className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: "▲",
              title: "AI Concierge",
              body: "Ask anything about strains, effects, dosing, or terpenes. Cove gives you knowledgeable, personalized guidance.",
              href: undefined,
            },
            {
              icon: "◉",
              title: "The Cannatrail",
              body: "Vermont's curated network of licensed dispensaries — browse menus, hours, and locations across the state.",
              href: "/trail",
            },
            {
              icon: "★",
              title: "Vermont-First",
              body: "Built for the Vermont market. Local knowledge, local dispensaries, and a community that knows the Green Mountain State.",
              href: "/vermont-first",
            },
          ].map(({ icon, title, body, href }) => (
            <div
              key={title}
              className="bg-forest border-2 border-forest-mid p-6 rounded-sm relative"
              style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.07)" }}
            >
              <div className="text-amber text-xl mb-3 font-groovy">{icon}</div>
              <h3 className="text-cream font-groovy text-lg mb-2">{title}</h3>
              <p className="text-cream-muted text-sm leading-relaxed mb-3">{body}</p>
              {href && (
                <Link href={href} className="text-amber text-xs font-bold tracking-widest uppercase hover:text-amber-hover transition-colors">
                  Explore ↗
                </Link>
              )}
            </div>
          ))}
        </div>
        </div>
      </section>

        {/* Gradient — last section fades into footer reveal */}
        <div style={{ height: "120px", background: "linear-gradient(to bottom, #0b2d1b, transparent)" }} />
      </div>{/* end solid content area */}

      {/* Transparent spacer — reveals fixed ski map underneath on scroll */}
      <MountainFooter />
    </main>
  );
}
