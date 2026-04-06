import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import {
  getAndDeleteChallenge,
  saveCredential,
  addCredentialToUser,
  encodePublicKey,
} from "@/lib/passkey-kv";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    challengeToken: string;
    registrationResponse: RegistrationResponseJSON;
    email: string;
  };

  const { challengeToken, registrationResponse, email } = body;
  if (!challengeToken || !registrationResponse || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const stored = await getAndDeleteChallenge(challengeToken);
  if (!stored) {
    return NextResponse.json({ error: "Challenge expired or invalid" }, { status: 400 });
  }
  if (stored.type !== "registration" || stored.email !== email) {
    return NextResponse.json({ error: "Challenge mismatch" }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: stored.challenge,
      expectedOrigin: req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL!,
      expectedRPID: process.env.NEXT_PUBLIC_RP_ID!,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  await saveCredential({
    credentialId: credential.id,
    publicKey: encodePublicKey(credential.publicKey),
    counter: credential.counter,
    email,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    createdAt: new Date().toISOString(),
  });

  await addCredentialToUser(email, credential.id);
  await createSession(email);

  return NextResponse.json({ success: true });
}
