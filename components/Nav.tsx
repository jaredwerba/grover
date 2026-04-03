import Link from "next/link";

export default function Nav({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: "rgba(11, 45, 27, 0.55)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255,185,0,0.12)",
      }}
    >
      <div className="flex items-center gap-1 ml-auto">
        {isAuthenticated ? (
          <>
            <Link
              href="/chat"
              className="text-cream-muted hover:text-cream transition-colors text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-sm hover:bg-forest/60 tracking-wide uppercase"
            >
              Chat
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-cream-muted hover:text-cream transition-colors text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-sm hover:bg-forest/60 tracking-wide uppercase"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/join"
            className="bg-amber text-forest-deep text-xs font-bold px-3 sm:px-5 py-2 rounded-sm hover:bg-amber-hover transition-colors ml-1 sm:ml-2 tracking-widest uppercase"
          >
            Join
          </Link>
        )}
      </div>
    </nav>
  );
}
