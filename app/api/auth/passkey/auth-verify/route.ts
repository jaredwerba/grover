import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import {
  getAndDeleteChallenge,
  getCredential,
  updateCredentialCounter,
  decodePublicKey,
} from "@/lib/passkey-kv";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    challengeToken: string;
    authResponse: AuthenticationResponseJSON;
    email: string;
  };

  const { challengeToken, authResponse, email } = body;
  if (!challengeToken || !authResponse || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const stored = await getAndDeleteChallenge(challengeToken);
  if (!stored) {
    return NextResponse.json({ error: "Challenge expired or invalid" }, { status: 400 });
  }
  if (stored.type !== "authentication" || stored.email !== email) {
    return NextResponse.json({ error: "Challenge mismatch" }, { status: 400 });
  }

  const cred = await getCredential(authResponse.id);
  if (!cred) {
    return NextResponse.json({ error: "credential_not_found" }, { status: 400 });
  }
  if (cred.email !== email) {
    return NextResponse.json({ error: "Email mismatch" }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge: stored.challenge,
      expectedOrigin: process.env.NEXT_PUBLIC_BASE_URL!,
      expectedRPID: process.env.NEXT_PUBLIC_RP_ID!,
      credential: {
        id: cred.credentialId,
        publicKey: decodePublicKey(cred.publicKey) as Uint8Array<ArrayBuffer>,
        counter: cred.counter,
        transports: ["internal"],
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Verification failed" }, { status: 401 });
  }

  await updateCredentialCounter(cred.credentialId, verification.authenticationInfo.newCounter);
  await createSession(cred.email);

  return NextResponse.json({ success: true });
}
