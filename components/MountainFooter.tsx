import Image from "next/image";

export default function MountainFooter() {
  return (
    <>
      {/* Fixed ski map — sits behind scrolling content */}
      <div className="fixed bottom-0 left-0 right-0 z-0">
        <Image
          src="/images/footer.jpg"
          alt="Vermont ski trail map"
          width={1020}
          height={428}
          className="w-full h-auto block"
          style={{ display: "block" }}
        />
        {/* Legal overlay */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-2 gap-0.5"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }}>
          <p className="text-white text-xs tracking-widest uppercase drop-shadow">
            Cove · Adults 21+ Only · Vermont State Law Applies
          </p>
          <p className="text-white/60 text-xs tracking-wide drop-shadow">
            Daniels AI · 2026
          </p>
        </div>
      </div>

      {/* Spacer — height matches footer image aspect ratio at full width */}
      <div className="w-full" style={{ paddingBottom: "clamp(160px, 42vw, 428px)" }} />
    </>
  );
}
