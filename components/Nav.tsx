import Link from "next/link";

export default function Nav({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-forest-mid">
      <Link
        href="/"
        className="text-amber font-groovy text-2xl leading-none"
      >
        Cove
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/trail"
          className="text-cream-muted hover:text-cream transition-colors text-sm px-3 py-2 rounded-lg hover:bg-forest"
        >
          Cannatrail
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              href="/chat"
              className="text-cream-muted hover:text-cream transition-colors text-sm px-3 py-2 rounded-lg hover:bg-forest"
            >
              Chat
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-cream-muted hover:text-cream transition-colors text-sm px-3 py-2 rounded-lg hover:bg-forest"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/join"
            className="bg-amber text-forest-deep text-sm font-semibold px-5 py-2 rounded-full hover:bg-amber-hover transition-colors ml-2"
          >
            Join
          </Link>
        )}
      </div>
    </nav>
  );
}
