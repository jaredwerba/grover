import { type NextRequest, NextResponse } from "next/server";
import { verifyMagicToken, createSession } from "@/lib/auth";

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

  await createSession(email);
  return NextResponse.redirect(new URL("/chat", req.url));
}
