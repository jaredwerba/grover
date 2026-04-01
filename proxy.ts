import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Middleware cannot import from lib/auth (uses next/headers which is unavailable here)
// so we inline the session verification using req.cookies directly.
function encodedKey(secret: string) {
  return new TextEncoder().encode(secret);
}

const PROTECTED = ["/chat"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("cove_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/join", req.url));
  }

  try {
    await jwtVerify(token, encodedKey(process.env.SESSION_SECRET!), {
      algorithms: ["HS256"],
    });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/join", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icons|.*\\.png$|.*\\.svg$|sw\\.js|manifest\\.json).*)"],
};
