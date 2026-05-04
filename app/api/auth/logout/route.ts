import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

export async function POST() {
  await deleteSession();
  // Always redirect to the canonical domain in production so sign-out
  // never lands on a *.vercel.app preview URL.
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://covebud.com"
      : (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000");
  return NextResponse.redirect(new URL("/", baseUrl));
}
