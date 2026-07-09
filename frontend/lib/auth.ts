import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/memoryStore";

/**
 * Anonymous device-identity authentication.
 *
 * There are no emails or passwords — appropriate for a highly stigmatized
 * recovery context where collecting PII is itself a risk. Instead:
 *
 * 1. The device generates an Ed25519 keypair (client-side, never leaves device
 *    as a private key).
 * 2. On registration the device sends its PUBLIC key; the server creates a User
 *    bound to a hash of that public key and issues a signed, httpOnly session
 *    cookie (a stateless HMAC token).
 * 3. Every subsequent request is authenticated by the session cookie. The
 *    server derives userId from the verified cookie and NEVER trusts a userId
 *    supplied in the body/path. This closes the IDOR class of bugs entirely.
 *
 * The session cookie is an HMAC-signed token: base64url(payload).base64url(sig)
 * where payload = { uid, exp } and sig = HMAC-SHA256(payload, SESSION_SECRET).
 */

const SESSION_COOKIE = "reset_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  // Temp/demo tolerance: derive an ephemeral secret so the app runs with zero
  // setup. Sessions won't survive a server restart. ALWAYS set SESSION_SECRET
  // in production (openssl rand -base64 48).
  return ((globalThis as any).__resetEphemeralSecret ??= crypto.randomBytes(48).toString("base64"));
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

interface SessionPayload {
  uid: string;
  exp: number; // unix seconds
}

/** Create a signed session token for a user id. */
export function createSessionToken(userId: string): string {
  const payload: SessionPayload = {
    uid: userId,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest();
  return `${payloadB64}.${b64url(sig)}`;
}

/** Verify a session token; returns userId or null. Constant-time signature check. */
export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);

  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(payloadB64)
    .digest();
  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(sigB64, "base64url");
  } catch {
    return null;
  }
  if (
    providedSig.length !== expectedSig.length ||
    !crypto.timingSafeEqual(providedSig, expectedSig)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as SessionPayload;
    if (!payload.uid || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null; // expired
    return payload.uid;
  } catch {
    return null;
  }
}

/** Hash a device public key to a stable identifier (we never store the raw key form redundantly). */
export function hashPublicKey(publicKeyPem: string): string {
  return crypto.createHash("sha256").update(publicKeyPem.trim()).digest("hex");
}

/**
 * Verify an Ed25519 signature over `message` using a PEM/SPKI public key.
 * Used at registration to prove the device controls the private key.
 */
export function verifyDeviceSignature(
  publicKeyPem: string,
  message: string,
  signatureB64: string
): boolean {
  try {
    const key = crypto.createPublicKey(publicKeyPem);
    const sig = Buffer.from(signatureB64, "base64");
    // Ed25519 uses null algorithm in crypto.verify
    return crypto.verify(null, Buffer.from(message), key, sig);
  } catch {
    return false;
  }
}

/** Build the Set-Cookie options for the session cookie. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

/**
 * Resolve the authenticated userId from the request's session cookie.
 * Returns null when unauthenticated.
 */
export function getUserIdFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Guard helper for route handlers. Runs `handler` with the authenticated
 * userId, or returns 401. Also confirms the user still exists.
 */
export async function withAuth(
  req: NextRequest,
  handler: (userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!store.getUser(userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handler(userId);
}
