import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON } from "@simplewebauthn/server";
import { Resend } from "resend";
import {
  getAndDeleteChallenge,
  saveCredential,
  addCredentialToUser,
  encodePublicKey,
} from "@/lib/passkey-kv";
import { createSession } from "@/lib/auth";
import {
  getAccountStatus,
  setAccountPending,
  setAccountApproved,
  createApprovalToken,
} from "@/lib/account-status";

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

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL!;
  const rpID = process.env.NEXT_PUBLIC_RP_ID!;
  console.log("[register-verify]", { origin, rpID, challenge: stored.challenge?.slice(0, 20) });

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: stored.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("[register-verify] error:", err);
    return NextResponse.json({ error: msg, debug: { origin, rpID, hasChallenge: !!stored.challenge } }, { status: 400 });
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

  // ── Account approval gate ──
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  // Auto-approve the admin
  if (adminEmail && normalizedEmail === adminEmail) {
    await setAccountApproved(email);
    await createSession(email);
    return NextResponse.json({ success: true });
  }

  const status = await getAccountStatus(email);

  if (status?.status === "approved") {
    // Returning user adding a second device
    await createSession(email);
    return NextResponse.json({ success: true });
  }

  if (status?.status === "denied") {
    return NextResponse.json({ error: "account_denied" }, { status: 403 });
  }

  if (status?.status === "pending") {
    // Already pending — don't re-send admin email
    return NextResponse.json({ success: true, pending: true });
  }

  // New user — set pending + notify admin
  await setAccountPending(email);

  if (adminEmail) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const baseUrl =
        new URL(req.url).origin ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        "http://localhost:3000";

      const [approveToken, denyToken] = await Promise.all([
        createApprovalToken(email, "approve"),
        createApprovalToken(email, "deny"),
      ]);

      const approveUrl = `${baseUrl}/api/auth/account/approve?token=${approveToken}`;
      const denyUrl = `${baseUrl}/api/auth/account/deny?token=${denyToken}`;

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "Cove <onboarding@resend.dev>",
        to: adminEmail,
        subject: `New AAI account request: ${email}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#1b3a2a;color:#f0ebe0;border-radius:16px;">
            <div style="font-size:48px;font-weight:900;color:#d4a843;margin-bottom:4px;letter-spacing:-2px;">C</div>
            <h1 style="color:#f0ebe0;font-size:22px;font-weight:700;margin:0 0 8px;">New Account Request</h1>
            <p style="color:#c8c0b0;margin:0 0 24px;font-size:15px;line-height:1.5;">
              <strong style="color:#f0ebe0;">${email}</strong> would like to create a Cove AAI account.
            </p>
            <div style="display:flex;gap:12px;">
              <a href="${approveUrl}"
                 style="display:inline-block;padding:14px 28px;background:#4caf50;color:#fff;border-radius:50px;font-weight:700;font-size:14px;text-decoration:none;">
                Approve
              </a>
              <a href="${denyUrl}"
                 style="display:inline-block;padding:14px 28px;background:#e57373;color:#fff;border-radius:50px;font-weight:700;font-size:14px;text-decoration:none;">
                Deny
              </a>
            </div>
            <p style="color:#c8c0b0;font-size:12px;margin-top:32px;line-height:1.5;">
              These links expire in 7 days.
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.error("[register-verify] Failed to send admin notification:", err);
    }
  }

  return NextResponse.json({ success: true, pending: true });
}
