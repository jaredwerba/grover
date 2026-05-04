import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getSession } from "@/lib/auth";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

/** 30-day TTL — location is a convenience cache, not permanent record. */
const LOCATION_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { lat, lng } = body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "invalid coordinates" }, { status: 400 });
  }

  await kv.set(
    `user:location:${session.email}`,
    { lat, lng, updated_at: new Date().toISOString() },
    { ex: LOCATION_TTL_SECONDS }
  );

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const location = await kv.get<{ lat: number; lng: number; updated_at: string }>(
    `user:location:${session.email}`
  );

  return NextResponse.json({ location });
}
