/**
 * Secure structured logger.
 *
 * Rule: NEVER log sensitive recovery content (journal text, notes, emotions,
 * triggers, message bodies). We log event names, coarse metadata, and error
 * types only. This keeps operational visibility without turning logs into a
 * secondary leak of special-category data.
 */

type Level = "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set([
  "note",
  "content",
  "emotion",
  "trigger",
  "message",
  "journal",
  "reflection",
  "publicKey",
  "signature",
]);

function redact(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(k)) {
      out[k] = "[redacted]";
    } else if (typeof v === "string" && v.length > 120) {
      out[k] = `[len:${v.length}]`;
    } else {
      out[k] = v;
    }
  }
  return out;
}

function emit(level: Level, event: string, meta: Record<string, unknown> = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...redact(meta),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, meta?: Record<string, unknown>) => emit("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => emit("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => emit("error", event, meta),
};

/** Audit log for security-relevant events (no content, just the fact it happened). */
export function audit(event: string, userId: string | null, meta: Record<string, unknown> = {}) {
  emit("info", `audit.${event}`, { userId: userId ? `${userId.slice(0, 8)}…` : null, ...meta });
}
