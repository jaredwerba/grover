import Image from "next/image";

export default function MountainFooter() {
  return (
    <footer className="relative overflow-hidden" style={{ flex: "0 0 auto" }}>
      {/* Vintage ski trail map */}
      <Image
        src="/images/footer.jpg"
        alt="Vermont ski trail map"
        width={1020}
        height={428}
        className="w-full h-auto block"
        style={{ display: "block" }}
      />

      {/* Legal text overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-2 gap-1 z-10"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}>
        <p className="text-white text-xs tracking-widest uppercase drop-shadow">
          Cove · Adults 21+ Only · Vermont State Law Applies
        </p>
        <p className="text-white/70 text-xs tracking-wide drop-shadow">
          Daniels AI · 2026
        </p>
      </div>
    </footer>
  );
}
