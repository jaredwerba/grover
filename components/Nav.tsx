import Link from "next/link";
import Image from "next/image";

export default function Nav({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b-2 border-forest-mid"
      style={{ borderBottomColor: "rgba(255,185,0,0.18)" }}>
      <Link href="/" className="leading-none block">
        <Image
          src="/images/logotrans.png"
          alt="Cove"
          width={110}
          height={46}
          className="block"
          priority
        />
      </Link>

      <div className="flex items-center gap-1">
        <Link
          href="/trail"
          className="text-cream-muted hover:text-cream transition-colors text-sm px-3 py-2 rounded-sm hover:bg-forest tracking-wide uppercase"
        >
          Cannatrail
        </Link>

        {isAuthenticated ? (
          <>
            <Link
              href="/chat"
              className="text-cream-muted hover:text-cream transition-colors text-sm px-3 py-2 rounded-sm hover:bg-forest tracking-wide uppercase"
            >
              Chat
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-cream-muted hover:text-cream transition-colors text-sm px-3 py-2 rounded-sm hover:bg-forest tracking-wide uppercase"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/join"
            className="bg-amber text-forest-deep text-xs font-bold px-5 py-2 rounded-sm hover:bg-amber-hover transition-colors ml-2 tracking-widest uppercase"
          >
            Join
          </Link>
        )}
      </div>
    </nav>
  );
}
