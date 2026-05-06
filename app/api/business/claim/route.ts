import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { claimShop, getBusinessClaim } from "@/lib/business";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const claim = await getBusinessClaim(session.email);
  return NextResponse.json({ claim });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { shopId } = await req.json();
  if (!shopId || typeof shopId !== "string") {
    return NextResponse.json({ error: "missing shopId" }, { status: 400 });
  }

  const claim = await claimShop(session.email, shopId);
  if (!claim) {
    return NextResponse.json({ error: "shop not found" }, { status: 404 });
  }

  return NextResponse.json({ claim });
}
