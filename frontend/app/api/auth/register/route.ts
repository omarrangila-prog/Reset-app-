import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/memoryStore";
import {
  createSessionToken,
  hashPublicKey,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
  verifyDeviceSignature,
} from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rateLimit";
import { audit, log } from "@/lib/logger";

/**
 * Register (or resume) an anonymous device identity. See lib/auth.ts.
 * Re-registering the same device key resumes the existing (in-memory) account.
 */
const RegisterSchema = z.object({
  publicKey: z.string().min(40).max(2000),
  nonce: z.string().min(8).max(200),
  signature: z.string().min(20).max(500),
  timezone: z.string().max(64).optional(),
});

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "auth", LIMITS.auth);
  if (limited) return limited;

  try {
    const body = RegisterSchema.parse(await req.json());

    if (!verifyDeviceSignature(body.publicKey, body.nonce, body.signature)) {
      audit("register.bad_signature", null);
      return NextResponse.json({ error: "Invalid device signature" }, { status: 400 });
    }

    const keyHash = hashPublicKey(body.publicKey);
    const timezone = body.timezone && body.timezone.length > 0 ? body.timezone : "UTC";
    const user = store.upsertUserByKey(keyHash, timezone);

    const token = createSessionToken(user.id);
    audit("register.success", user.id);

    const res = NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
    res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
    return res;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    log.error("auth.register.error", { type: (error as Error).name });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
