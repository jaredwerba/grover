import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserPreferences } from "@/lib/user-preferences";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const prefs = await getUserPreferences(session.email);
  return NextResponse.json(prefs);
}
