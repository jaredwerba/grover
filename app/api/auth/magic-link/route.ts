import { NextRequest } from "next/server";
import { Resend } from "resend";
import { createMagicToken } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // Initialize per-request so build doesn't fail without RESEND_API_KEY
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Valid email required" }, { status: 400 });
  }


  const normalizedEmail = email.toLowerCase().trim();
  const token = await createMagicToken(normalizedEmail);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const magicUrl = `${baseUrl}/verify?token=${token}`;

  const { error } = await resend.emails.send({
    from: "Cove <onboarding@resend.dev>",
    to: normalizedEmail,
    subject: "Your Cove sign-in link",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 32px;background:#1b3a2a;color:#f0ebe0;border-radius:16px;">
        <div style="font-size:48px;font-weight:900;color:#d4a843;margin-bottom:4px;letter-spacing:-2px;">C</div>
        <h1 style="color:#f0ebe0;font-size:22px;font-weight:700;margin:0 0 8px;">Welcome to Cove</h1>
        <p style="color:#c8c0b0;margin:0 0 28px;font-size:15px;line-height:1.5;">
          Click the button below to sign in to Cove. This link expires in 15 minutes.
        </p>
        <a href="${magicUrl}"
           style="display:inline-block;padding:14px 32px;background:#d4a843;color:#122a1e;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none;">
          Sign in to Cove
        </a>
        <p style="color:#c8c0b0;font-size:12px;margin-top:32px;line-height:1.5;">
          If you didn't request this, you can safely ignore this email.<br/>
          Cove is for adults 21+ only.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }

  return Response.json({ success: true });
}
