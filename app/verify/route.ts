import { type NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, createSession } from "@/lib/auth";
import { getAccountStatus } from "@/lib/account-status";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/join?error=missing_token", req.url));
  }

  const email = await verifyMagicToken(token);

  if (!email) {
    return NextResponse.redirect(new URL("/join?error=invalid_token", req.url));
  }

  // ── Account approval gate ──
  const status = await getAccountStatus(email);
  if (status?.status === "pending") {
    return NextResponse.redirect(new URL("/join?error=account_pending", req.url));
  }
  if (status?.status === "denied") {
    return NextResponse.redirect(new URL("/join?error=account_denied", req.url));
  }
  // approved or null (grandfathered pre-gating users) → proceed

  await createSession(email);
  return NextResponse.redirect(new URL("/chat", req.url));
}
