import { NextResponse } from "next/server";

export async function POST() {
  // Always redirect to the canonical domain in production so sign-out
  // never lands on a *.vercel.app preview URL.
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://covebud.com"
      : (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000");
  const response = NextResponse.redirect(new URL("/", baseUrl));

  // Explicitly clear the session cookie on the response so it survives
  // the redirect chain (cookies() API changes can be lost on redirect).
  response.cookies.set("cove_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
