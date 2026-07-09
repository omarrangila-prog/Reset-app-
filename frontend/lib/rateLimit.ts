import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight fixed-window rate limiter.
 *
 * NOTE ON SERVERLESS: in-memory state is per-instance, so on Vercel this
 * provides best-effort protection per warm instance. For strict global limits,
 * back this with a shared store (Vercel KV / Upstash Redis) by swapping the
 * `hit()` implementation — the interface is designed for that. It is
 * intentionally dependency-free so it works out of the box.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup to bound memory.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export function hit(key: string, config: RateLimitConfig): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { ok: true, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > config.max) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Derive a client key from IP (proxied) + a name for the limit scope. */
export function clientKey(req: NextRequest, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0].trim() : "unknown";
  return `${scope}:${ip}`;
}

/**
 * Enforce a rate limit. Returns a 429 NextResponse when exceeded, else null.
 * `identifier` lets you scope per-user (authenticated) instead of per-IP.
 */
export function enforceRateLimit(
  req: NextRequest,
  scope: string,
  config: RateLimitConfig,
  identifier?: string
): NextResponse | null {
  const key = identifier ? `${scope}:${identifier}` : clientKey(req, scope);
  const result = hit(key, config);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Too many requests. Take a breath and try again shortly." },
      { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
    );
  }
  return null;
}

export const LIMITS = {
  auth: { windowMs: 15 * 60 * 1000, max: 20 },
  coach: { windowMs: 60 * 1000, max: 10 },
  write: { windowMs: 60 * 1000, max: 60 },
  read: { windowMs: 60 * 1000, max: 120 },
} as const;
