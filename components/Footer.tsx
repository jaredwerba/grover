"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export default function Footer() {
  const hidden = useScrollDirection();
  const pathname = usePathname();

  return (
    <footer
      className={`liquid-glass-nav fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 transition-transform duration-300 ease-in-out border-b-0 [&>*]:relative [&>*]:z-10 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
      style={{
        borderBottom: "none",
        borderTop: "1px solid rgba(255, 185, 0, 0.1)",
        boxShadow:
          "inset 0 1px 0 0 rgba(255,255,255,0.06), inset 0 -1px 0 0 rgba(0,0,0,0.1), 0 -1px 3px rgba(0,0,0,0.2)",
      }}
    >
      <FooterLink href="/" label="Home" active={pathname === "/"}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </FooterLink>

      <FooterLink href="/trail" label="Trail" active={pathname === "/trail"}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </FooterLink>

      <FooterLink href="/strain" label="Products" active={pathname === "/strain"}>
        <Image
          src="/images/icons/2d-white/flower.png"
          alt=""
          width={20}
          height={20}
          className={`w-5 h-5 object-contain ${pathname === "/strain" ? "brightness-0 saturate-100 invert-[.8] sepia-100 saturate-[600%] hue-rotate-[358deg] brightness-105" : "opacity-70"}`}
          style={pathname === "/strain" ? { filter: "brightness(0) saturate(100%) invert(80%) sepia(100%) saturate(600%) hue-rotate(358deg) brightness(105%)" } : undefined}
          aria-hidden="true"
        />
      </FooterLink>

      <FooterLink href="/about" label="About" active={pathname === "/about"}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </FooterLink>

      <FooterLink href="/me" label="Me" active={pathname?.startsWith("/me") ?? false}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </FooterLink>
    </footer>
  );
}

function FooterLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-sm transition-colors ${
        active
          ? "text-amber"
          : "text-cream-muted/70 hover:text-cream"
      }`}
    >
      {children}
      <span className="text-[9px] font-bold tracking-widest uppercase">
        {label}
      </span>
    </Link>
  );
}
