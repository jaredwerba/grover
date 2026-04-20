import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Proxy cannot import from lib/auth (uses next/headers which is unavailable here)
// so we inline the session verification using req.cookies directly.
function encodedKey(secret: string) {
  return new TextEncoder().encode(secret);
}

const PROTECTED = ["/chat", "/me/dashboard"];

// Markdown-for-Agents: when a client sends `Accept: text/markdown`
// for one of these pages, we rewrite to the markdown API route.
// Browsers (which don't ask for markdown) fall through to HTML.
// See: https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
const MD_PATHS = new Set<string>([
  "/",
  "/about",
  "/trail",
  "/strain",
  "/vermont-first",
]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Content negotiation — agent asked for markdown, we have markdown.
  if (MD_PATHS.has(pathname)) {
    const accept = req.headers.get("accept") || "";
    if (accept.includes("text/markdown")) {
      const url = req.nextUrl.clone();
      url.pathname = pathname === "/" ? "/api/md" : `/api/md${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("cove_session")?.value;
  const redirectTo = pathname.startsWith("/me/") ? "/me" : "/join";
  if (!token) {
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  try {
    await jwtVerify(token, encodedKey(process.env.SESSION_SECRET!), {
      algorithms: ["HS256"],
    });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icons|.*\\.png$|.*\\.svg$|sw\\.js|manifest\\.json).*)"],
};
