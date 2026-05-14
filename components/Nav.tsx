"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { exportDashboardPdf } from "@/lib/export-pdf";
import { useScrollDirection } from "@/hooks/useScrollDirection";

type Persona = "grower" | "dispenser";

export default function Nav({
  isAuthenticated,
  email,
}: {
  isAuthenticated: boolean;
  email?: string | null;
}) {
  const pathname = usePathname();
  const hidden = useScrollDirection();
  const isHome = pathname === "/";
  const isMePage = pathname === "/me";
  const isDashboard = pathname === "/me/dashboard";

  async function handleExport() {
    // Read the current tab from the URL at click time — DashboardClient
    // syncs the tab state to ?tab=. Default to toker if missing.
    const search = new URLSearchParams(window.location.search);
    const raw = search.get("tab");
    const persona: Persona =
      raw === "dispenser" ? raw : "grower";
    if (!email) return;
    await exportDashboardPdf({ email, persona });
  }

  return (
    <nav
      className={`liquid-glass-nav sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3 [&>*]:relative [&>*]:z-10 transition-transform duration-300 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={isHome ? { background: "transparent", backdropFilter: "none", WebkitBackdropFilter: "none", boxShadow: "none", borderBottom: "none" } : undefined}
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
                {isDashboard && email && (
                  <button
                    onClick={handleExport}
                    aria-label="Export data as Cove PDF"
                    className="bg-amber text-forest-deep text-xs font-bold px-3 py-2 rounded-sm hover:bg-amber-hover transition-colors tracking-widest uppercase mr-1 flex items-center gap-1.5"
                  >
                    <DownloadIcon />
                    Export
                  </button>
                )}
                {!isDashboard && (
                  <Link
                    href="/chat"
                    className="text-cream-muted hover:text-cream transition-colors text-xs px-3 py-2 rounded-sm hover:bg-forest/60 tracking-wide uppercase"
                  >
                    Chat
                  </Link>
                )}
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
                Chat
              </Link>
            )}
          </div>
    </nav>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
