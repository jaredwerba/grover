"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Nav({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isMePage = pathname === "/me";

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3"
      style={{
        background: "rgba(11, 45, 27, 0.55)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255,185,0,0.12)",
      }}
    >
      {/* Logo — hidden on home page, shown on all other pages */}
      {isHome ? (
        <div className="w-0 sm:w-0" />
      ) : (
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/logotrans.png"
            alt="Cove"
            width={72}
            height={30}
            className="h-7 w-auto"
            priority
          />
        </Link>
      )}

      {/* Auth links */}
      <div className="flex items-center gap-1">
        {isAuthenticated ? (
          <>
            <Link
              href="/chat"
              className="text-cream-muted hover:text-cream transition-colors text-xs px-3 py-2 rounded-sm hover:bg-forest/60 tracking-wide uppercase"
            >
              Chat
            </Link>
            <Link
              href="/me/dashboard"
              className="text-cream-muted hover:text-cream transition-colors text-xs px-3 py-2 rounded-sm hover:bg-forest/60 tracking-wide uppercase"
            >
              Me
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-cream-muted hover:text-cream transition-colors text-xs px-3 py-2 rounded-sm hover:bg-forest/60 tracking-wide uppercase"
              >
                Sign out
              </button>
            </form>
          </>
        ) : isMePage ? (
          // On the /me sign-in page, offer Sign Out instead of Join —
          // Join would just circle back to another auth page, which
          // is a confusing destination from here.
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="border border-amber/60 text-amber text-xs font-bold px-4 py-2 rounded-sm hover:bg-amber/10 transition-colors tracking-widest uppercase"
            >
              Sign Out
            </button>
          </form>
        ) : (
          <Link
            href="/join"
            className="bg-amber text-forest-deep text-xs font-bold px-4 py-2 rounded-sm hover:bg-amber-hover transition-colors tracking-widest uppercase"
          >
            Join
          </Link>
        )}
      </div>
    </nav>
  );
}
