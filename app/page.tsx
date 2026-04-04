import Link from "next/link";
import Image from "next/image";

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
            Join
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
        <div className="border border-forest-mid rounded-sm overflow-hidden"
          style={{
            background: "#071a0e",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,185,0,0.08)"
          }}>

          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-forest-mid/60"
            style={{ background: "#0a2214" }}>
            <div className="w-2 h-2 rounded-full bg-amber" />
            <span className="text-amber text-xs tracking-widest uppercase font-bold">Cove AI</span>
            <span className="text-cream-muted/40 text-xs ml-auto">Cannabis Concierge</span>
          </div>

          {/* Messages */}
          <div className="px-4 py-5 space-y-4 min-h-[200px]">
            {/* AI greeting */}
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-sm bg-amber/20 border border-amber/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber text-xs font-bold">C</span>
              </div>
              <div className="rounded-sm px-4 py-3 max-w-xs" style={{ background: "#0f2d1c" }}>
                <p className="text-cream text-sm leading-relaxed">
                  Hey — I&apos;m Cove. Ask me anything about Vermont cannabis: strains, dispensaries, effects, or dosing.
                </p>
              </div>
            </div>

            {/* User message */}
            <div className="flex gap-3 justify-end">
              <div className="rounded-sm px-4 py-3 max-w-xs" style={{ background: "#1a3d28", border: "1px solid rgba(255,185,0,0.15)" }}>
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
                <span className="text-amber text-xs font-bold">C</span>
              </div>
              <div className="rounded-sm px-4 py-3" style={{ background: "#0f2d1c" }}>
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Input bar */}
          <div className="border-t border-forest-mid/60 px-4 py-3 flex gap-3 items-center"
            style={{ background: "#0a2214" }}>
            <input
              type="text"
              defaultValue="love 2 partake"
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
              icon: "/images/mountain.svg",
              title: "The Cannatrail",
              body: "Vermont's curated network of licensed dispensaries — browse menus, hours, and locations across the state.",
              href: "/trail",
            },
            {
              icon: "/images/vermont.svg",
              title: "Craft Growers",
              body: "Built for the Vermont market. Local knowledge, local dispensaries, and a community that knows the Green Mountain State.",
              href: "/vermont-first",
            },
            {
              icon: "/images/weed.svg",
              title: "Strain Library",
              body: "Explore Vermont cannabis strains — effects, terpenes, flavors, and potency data for every cultivar on the Cannatrail.",
              href: "/strain",
            },
          ].map(({ icon, title, body, href }) => (
            <div
              key={title}
              className="bg-forest border-2 border-forest-mid p-6 rounded-sm relative flex gap-5 items-start"
              style={{ boxShadow: "inset 0 0 0 3px rgba(255,185,0,0.07)" }}
            >
              {/* Icon — left-anchored, scales with viewport */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={icon}
                alt=""
                className="shrink-0 w-14 h-14 sm:w-16 sm:h-16"
                style={{
                  filter: "brightness(0) saturate(100%) invert(80%) sepia(100%) saturate(600%) hue-rotate(358deg) brightness(105%)",
                }}
              />
              {/* Text */}
              <div className="flex flex-col">
                <h3 className="text-cream font-groovy text-2xl leading-tight tracking-wide mb-2">{title}</h3>
                <p className="text-cream-muted text-sm leading-relaxed mb-3">{body}</p>
                {href && (
                  <Link href={href} className="text-amber text-xs font-bold tracking-widest uppercase hover:text-amber-hover transition-colors">
                    Explore ↗
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* About — Cannatrail */}
      <section className="w-full">
        <div className="px-6 pb-24 max-w-3xl mx-auto">
          <div className="border-t border-forest-mid/50 pt-12">
            <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-4">About the Cannatrail</p>
            <h2 className="text-3xl sm:text-4xl font-groovy text-cream tracking-wide leading-tight mb-6">
              Grown here. For you.
            </h2>
            <div className="space-y-4 text-cream-muted text-sm sm:text-base leading-relaxed">
              <p>
                Vermont has always done things its own way — and cannabis is no different. From the Northeast Kingdom to the Champlain Valley, Green Mountain cultivators are growing some of the most thoughtful, craft cannabis in the country. Medical or recreational, flower or concentrate, there&apos;s a Vermont grower behind every product on this trail.
              </p>
              <p>
                The Cannatrail was built to help you navigate Vermont&apos;s cannabis scene with confidence. Whether you&apos;re a lifelong Vermonter or just passing through on the way to the mountain, we want to connect you with the dispensaries and growers who call this state home.
              </p>
              <p>
                Our honest advice? <span className="text-cream font-semibold">Shop around.</span> Every dispensary on the trail has its own personality, its own staff, and its own rotating selection of locally-grown products. The best way to find your favorite is to explore — and Vermont is a pretty great place to do that.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              {["Vermont Native", "Locally Grown", "Medical & Recreational", "Community First", "Green Mountain Proud"].map((tag) => (
                <span key={tag} className="text-xs border border-amber/30 text-amber/70 px-3 py-1.5 rounded-sm font-semibold tracking-wider uppercase">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      </div>{/* end solid content area */}

      <footer className="w-full flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 px-4 py-2 bg-amber">
        <p className="text-forest-deep text-[10px] tracking-widest uppercase font-bold whitespace-nowrap">
          Cove AI · Vermont Cannabis · 2026
        </p>
      </footer>
    </main>
  );
}
