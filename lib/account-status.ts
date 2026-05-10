import "server-only";
import { Redis } from "@upstash/redis";
import { SignJWT, jwtVerify } from "jose";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

/* ── Types ── */

export interface AccountStatus {
  status: "pending" | "approved" | "denied";
  email: string;
  requestedAt: string;
  approvedAt?: string;
  deniedAt?: string;
}

/* ── Keys ── */

function statusKey(email: string) {
  return `account:status:${email.toLowerCase().trim()}`;
}

/* ── CRUD ── */

export async function getAccountStatus(
  email: string
): Promise<AccountStatus | null> {
  try {
    return kv.get<AccountStatus>(statusKey(email));
  } catch {
    return null;
  }
}

export async function setAccountPending(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  await kv.set(statusKey(normalized), {
    status: "pending",
    email: normalized,
    requestedAt: new Date().toISOString(),
  } satisfies AccountStatus);
}

export async function setAccountApproved(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const existing = await getAccountStatus(normalized);
  await kv.set(statusKey(normalized), {
    status: "approved",
    email: normalized,
    requestedAt: existing?.requestedAt ?? new Date().toISOString(),
    approvedAt: new Date().toISOString(),
  } satisfies AccountStatus);
}

export async function setAccountDenied(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const existing = await getAccountStatus(normalized);
  await kv.set(statusKey(normalized), {
    status: "denied",
    email: normalized,
    requestedAt: existing?.requestedAt ?? new Date().toISOString(),
    deniedAt: new Date().toISOString(),
  } satisfies AccountStatus);
}

/* ── Approval Tokens (JWT) ── */

const MAGIC_SECRET = process.env.MAGIC_LINK_SECRET!;

function encodedKey() {
  return new TextEncoder().encode(MAGIC_SECRET);
}

/** Create a signed approval/denial token (7-day expiry). */
export async function createApprovalToken(
  email: string,
  action: "approve" | "deny"
): Promise<string> {
  return new SignJWT({ email, action, purpose: "account-approval" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey());
}

/** Verify an approval/denial token. Returns payload or null. */
export async function verifyApprovalToken(
  token: string
): Promise<{ email: string; action: "approve" | "deny" } | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey(), {
      algorithms: ["HS256"],
    });
    if (
      payload.purpose !== "account-approval" ||
      typeof payload.email !== "string" ||
      (payload.action !== "approve" && payload.action !== "deny")
    ) {
      return null;
    }
    return { email: payload.email, action: payload.action as "approve" | "deny" };
  } catch {
    return null;
  }
}
