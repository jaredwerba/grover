import Link from "next/link";
import Image from "next/image";
import HeroVideo from "@/components/HeroVideo";
import HeroLogo from "@/components/HeroLogo";
import HeroChat from "@/components/HeroChat";

export default function LandingPage() {
  return (
    <main className="text-cream flex flex-col relative z-10" style={{ background: "transparent" }}>
      {/* Solid content area */}
      <div style={{ background: "#0b2d1b", position: "relative", zIndex: 1 }}>
      {/* Hero — pulled up behind transparent nav */}
      <section className="relative flex flex-col items-center justify-center flex-1 text-center px-6 pb-16 sm:pb-20 overflow-hidden -mt-12 pt-28 sm:pt-32">

        {/* Background video with gradient overlay */}
        <HeroVideo />

        {/* Logo — double-tap opens Spotify playlist */}
        <HeroLogo />

        {/* Motto */}
        <p className="hero-motto font-groovy text-amber text-lg sm:text-2xl tracking-wide mb-4 relative z-10 drop-shadow-lg">
          Vermont&apos;s Cannabis Companion
        </p>

        {/* Tagline */}
        <p className="hero-tagline text-sm sm:text-base text-amber mb-8 max-w-xs sm:max-w-sm leading-relaxed relative z-10 drop-shadow-md">
          Local strains. Local dispensaries. One&nbsp;app.
        </p>

        {/* CTAs */}
        <div className="hero-cta flex flex-col sm:flex-row gap-3 relative z-10">
          <Link
            href="/join"
            className="bg-amber text-forest-deep font-bold px-12 py-4 rounded-full hover:bg-amber-hover transition-colors text-sm tracking-wide uppercase shadow-lg shadow-amber/20"
          >
            Get Started
          </Link>
          <Link
            href="/trail"
            className="border border-amber/40 text-amber px-8 py-4 rounded-full hover:border-amber/70 hover:bg-amber/10 transition-colors text-xs tracking-widest uppercase"
          >
            Explore the Cannatrail
          </Link>
        </div>
      </section>

      {/* Animated chat demo */}
      <HeroChat />

      {/* Browse by Category — 3D product icons */}
      <section className="w-full">
        <div className="px-6 pb-16 max-w-5xl mx-auto">
          <p className="text-amber/70 text-xs tracking-[0.3em] uppercase font-semibold mb-3 text-center">
            Browse by Category
          </p>
          <h2 className="text-2xl sm:text-3xl font-groovy text-cream tracking-wide text-center mb-8">
            What are you looking for?
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {[
              { type: "flower", label: "Flower" },
              { type: "preroll", label: "Pre-Rolls" },
              { type: "vape", label: "Vapes" },
              { type: "edible", label: "Edibles" },
              { type: "concentrate", label: "Concentrates" },
              { type: "drink", label: "Drinks" },
            ].map(({ type, label }) => (
              <Link
                key={type}
                href={`/strain?type=${type}`}
                className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-md border border-forest-mid/60 bg-forest/50 hover:border-amber/40 hover:bg-forest transition-all"
              >
                <Image
                  src={`/images/icons/3d/${type === "preroll" ? "preroll" : type}.png`}
                  alt={label}
                  width={64}
                  height={64}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-md group-hover:scale-110 transition-transform"
                />
                <span className="text-cream-muted group-hover:text-cream text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      </div>{/* end solid content area */}

    </main>
  );
}
