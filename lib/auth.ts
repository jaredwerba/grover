import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_SECRET = process.env.SESSION_SECRET!;
const MAGIC_SECRET = process.env.MAGIC_LINK_SECRET!;

function encodedKey(secret: string) {
  return new TextEncoder().encode(secret);
}

// ── Magic link tokens (15-minute, single-purpose) ──────────────────────────

export async function createMagicToken(email: string): Promise<string> {
  return new SignJWT({ email, purpose: "magic-link" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(encodedKey(MAGIC_SECRET));
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey(MAGIC_SECRET), {
      algorithms: ["HS256"],
    });
    if (payload.purpose !== "magic-link" || typeof payload.email !== "string") {
      return null;
    }
    return payload.email;
  } catch {
    return null;
  }
}

// ── Session cookies (7-day, httpOnly) ──────────────────────────────────────

export interface SessionPayload {
  email: string;
}

export async function createSession(email: string): Promise<void> {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey(SESSION_SECRET));

  const cookieStore = await cookies();
  cookieStore.set("cove_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("cove_session")?.value;
  if (!raw) return null;
  try {
    const { payload } = await jwtVerify(raw, encodedKey(SESSION_SECRET), {
      algorithms: ["HS256"],
    });
    if (typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("cove_session");
}
