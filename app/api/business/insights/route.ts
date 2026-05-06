import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBusinessClaim, ensureDemoClaim, DEMO_EMAIL } from "@/lib/business";
import { buildShopInsights } from "@/lib/business-insights";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // Auto-seed demo account on first access
  if (session.email === DEMO_EMAIL) {
    await ensureDemoClaim();
  }

  const claim = await getBusinessClaim(session.email);
  if (!claim) {
    return NextResponse.json({ error: "no_claim", message: "No shop claimed" }, { status: 404 });
  }

  const insights = await buildShopInsights(claim.shopId);
  if (!insights) {
    return NextResponse.json({ error: "shop_not_found" }, { status: 404 });
  }

  return NextResponse.json(insights);
}
