import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (
    !validUsername ||
    !validPassword ||
    username !== validUsername ||
    password !== validPassword
  ) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await createSession(`${username}@cove.admin`);
  return NextResponse.json({ success: true });
}
