import { type NextRequest, NextResponse } from "next/server";
import {
  verifyApprovalToken,
  getAccountStatus,
  setAccountDenied,
} from "@/lib/account-status";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return htmlResponse("Missing token", "No denial token was provided.", 400);
  }

  const payload = await verifyApprovalToken(token);
  if (!payload || payload.action !== "deny") {
    return htmlResponse(
      "Invalid or expired link",
      "This link is invalid or has expired.",
      400
    );
  }

  const existing = await getAccountStatus(payload.email);
  if (existing?.status === "denied") {
    return htmlResponse(
      "Already denied",
      `The account for ${payload.email} was already denied.`,
      200
    );
  }

  await setAccountDenied(payload.email);

  return htmlResponse(
    "Account denied",
    `The account for <strong>${payload.email}</strong> has been denied. They will not be able to sign in.`,
    200
  );
}

function htmlResponse(title: string, message: string, status: number) {
  const isSuccess = status === 200;
  return new NextResponse(
    `<!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Cove</title></head>
    <body style="font-family:system-ui,sans-serif;background:#0f2d1c;color:#f0ebe0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;">
      <div style="max-width:420px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">${isSuccess ? "&#10003;" : "&#10007;"}</div>
        <h1 style="color:${isSuccess ? "#d4a843" : "#e57373"};font-size:24px;margin:0 0 12px;">${title}</h1>
        <p style="color:#c8c0b0;font-size:15px;line-height:1.6;">${message}</p>
      </div>
    </body>
    </html>`,
    { status, headers: { "Content-Type": "text/html" } }
  );
}
