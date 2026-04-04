import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 px-4 py-2 bg-amber">
      <p className="text-forest-deep text-[10px] tracking-widest uppercase font-bold whitespace-nowrap">
        Cove AI · Vermont Cannabis · 2026
      </p>
      <span className="text-forest-deep/40 text-[10px] font-bold">·</span>
      <Link
        href="/about"
        className="text-forest-deep text-[10px] tracking-widest uppercase font-bold hover:text-forest-deep/70 transition-colors whitespace-nowrap"
      >
        About
      </Link>
    </footer>
  );
}
