import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
import { isoBase64URL } from "@simplewebauthn/server/helpers";

export interface StoredChallenge {
  challenge: string;
  email?: string;
  type: "registration" | "authentication";
}

export interface StoredCredential {
  credentialId: string;
  publicKey: string; // base64url-encoded Uint8Array
  counter: number;
  email: string;
  deviceType: string;
  backedUp: boolean;
  createdAt: string;
}

// --- Challenges ---

export async function saveChallenge(data: StoredChallenge): Promise<string> {
  const token = crypto.randomUUID();
  await kv.set(`passkey:challenge:${token}`, data, { ex: 120 });
  return token;
}

export async function getAndDeleteChallenge(
  token: string
): Promise<StoredChallenge | null> {
  const key = `passkey:challenge:${token}`;
  const data = await kv.get<StoredChallenge>(key);
  if (data) await kv.del(key);
  return data;
}

// --- Credentials ---

export async function saveCredential(cred: StoredCredential): Promise<void> {
  await kv.set(`passkey:credential:${cred.credentialId}`, cred);
}

export async function getCredential(
  credentialId: string
): Promise<StoredCredential | null> {
  return kv.get<StoredCredential>(`passkey:credential:${credentialId}`);
}

export async function updateCredentialCounter(
  credentialId: string,
  newCounter: number
): Promise<void> {
  const cred = await getCredential(credentialId);
  if (cred) {
    await kv.set(`passkey:credential:${credentialId}`, {
      ...cred,
      counter: newCounter,
    });
  }
}

// --- User credential index ---

export async function getUserCredentialIds(email: string): Promise<string[]> {
  const ids = await kv.get<string[]>(`passkey:user:${email}`);
  return ids ?? [];
}

export async function addCredentialToUser(
  email: string,
  credentialId: string
): Promise<void> {
  const existing = await getUserCredentialIds(email);
  if (!existing.includes(credentialId)) {
    await kv.set(`passkey:user:${email}`, [...existing, credentialId]);
  }
}

// --- Encoding helpers ---

export function encodePublicKey(publicKey: Uint8Array): string {
  return isoBase64URL.fromBuffer(publicKey as Uint8Array<ArrayBuffer>);
}

export function decodePublicKey(encoded: string): Uint8Array {
  return isoBase64URL.toBuffer(encoded);
}
