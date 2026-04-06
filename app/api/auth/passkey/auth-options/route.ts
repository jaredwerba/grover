import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { saveChallenge, getUserCredentialIds } from "@/lib/passkey-kv";

export async function POST(req: NextRequest) {
  const { email } = await req.json() as { email: string };
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const credIds = await getUserCredentialIds(email);
  if (credIds.length === 0) {
    return NextResponse.json({ error: "no_credentials" }, { status: 404 });
  }

  const options = await generateAuthenticationOptions({
    rpID: process.env.NEXT_PUBLIC_RP_ID!,
    userVerification: "preferred",
    allowCredentials: credIds.map((id) => ({
      id,
    })),
  });

  const challengeToken = await saveChallenge({
    challenge: options.challenge,
    email,
    type: "authentication",
  });

  return NextResponse.json({ options, challengeToken });
}
