import { NextResponse } from "next/server";
import { dispensaries } from "@/lib/dispensaries";

export async function GET() {
  // Return all dispensaries as claimable shops (id + name only)
  const shops = dispensaries.map((d) => ({ id: d.id, name: d.name }));
  return NextResponse.json({ shops });
}
