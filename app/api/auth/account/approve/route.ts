import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  verifyApprovalToken,
  getAccountStatus,
  setAccountApproved,
} from "@/lib/account-status";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return htmlResponse("Missing token", "No approval token was provided.", 400);
  }

  const payload = await verifyApprovalToken(token);
  if (!payload || payload.action !== "approve") {
    return htmlResponse(
      "Invalid or expired link",
      "This approval link is invalid or has expired. Ask the user to register again.",
      400
    );
  }

  const existing = await getAccountStatus(payload.email);
  if (existing?.status === "approved") {
    return htmlResponse(
      "Already approved",
      `The account for ${payload.email} was already approved.`,
      200
    );
  }

  await setAccountApproved(payload.email);

  // Send confirmation email to the user
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Cove <onboarding@resend.dev>",
      to: payload.email,
      subject: "Your Cove account has been approved",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#1b3a2a;color:#f0ebe0;border-radius:16px;">
          <div style="font-size:48px;font-weight:900;color:#d4a843;margin-bottom:4px;letter-spacing:-2px;">C</div>
          <h1 style="color:#f0ebe0;font-size:22px;font-weight:700;margin:0 0 8px;">You're in!</h1>
          <p style="color:#c8c0b0;margin:0 0 28px;font-size:15px;line-height:1.5;">
            Your Cove account has been approved. You can now sign in with Face ID and access your dashboard.
          </p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "https://covebud.com"}/me"
             style="display:inline-block;padding:14px 32px;background:#d4a843;color:#122a1e;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none;">
            Sign in to Cove
          </a>
          <p style="color:#c8c0b0;font-size:12px;margin-top:32px;line-height:1.5;">
            Welcome to Cove. We're glad to have you.
          </p>
        </div>
      `,
    });
  } catch {
    // Don't fail the approval if email fails — account is already approved
    console.error("[approve] Failed to send confirmation email to", payload.email);
  }

  return htmlResponse(
    "Account approved",
    `The account for <strong>${payload.email}</strong> has been approved. They will receive a confirmation email.`,
    200
  );
}

function htmlResponse(title: string, message: string, status: number) {
  const isSuccess = status === 200;
  const color = isSuccess ? "#d4a843" : "#e57373";
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Cove</title></head>
    <body style="font-family:system-ui,sans-serif;background:#0f2d1c;color:#f0ebe0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;">
      <div style="max-width:420px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">${isSuccess ? "&#10003;" : "&#10007;"}</div>
        <h1 style="color:${color};font-size:24px;margin:0 0 12px;">${title}</h1>
        <p style="color:#c8c0b0;font-size:15px;line-height:1.6;">${message}</p>
      </div>
    </body>
    </html>`,
    { status, headers: { "Content-Type": "text/html" } }
  );
}
