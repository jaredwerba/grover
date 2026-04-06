import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { saveChallenge, getUserCredentialIds } from "@/lib/passkey-kv";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const existingIds = await getUserCredentialIds(email);

  const options = await generateRegistrationOptions({
    rpName: "Cove",
    rpID: process.env.NEXT_PUBLIC_RP_ID!,
    userName: email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
    excludeCredentials: existingIds.map((id) => ({
      id,
    })),
  });

  const challengeToken = await saveChallenge({
    challenge: options.challenge,
    email,
    type: "registration",
  });

  return NextResponse.json({ options, challengeToken });
}
