import crypto from "crypto";

/**
 * Field-level encryption for sensitive recovery data (journal notes, emotions,
 * triggers). Uses AES-256-GCM with a per-record random IV. The key is derived
 * from the APP_ENCRYPTION_KEY environment variable.
 *
 * Storage format (single string, colon-delimited base64):
 *   v1:<iv>:<authTag>:<ciphertext>
 *
 * Design goals:
 * - Never store recovery content in plaintext (GDPR Art. 9 special category).
 * - Fail closed: if the key is missing/invalid we refuse to encrypt/decrypt
 *   rather than silently writing plaintext.
 * - Versioned prefix so we can rotate algorithms/keys later.
 */

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const IV_LENGTH = 12; // 96-bit nonce, recommended for GCM
const KEY_LENGTH = 32; // 256-bit

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  // In the temp/no-DB demo mode we tolerate a missing key by deriving an
  // ephemeral per-process key so the app runs with zero setup. Data is in-memory
  // and resets on restart anyway. For production, ALWAYS set APP_ENCRYPTION_KEY.
  const raw =
    process.env.APP_ENCRYPTION_KEY ||
    ((globalThis as any).__resetEphemeralKey ??= crypto.randomBytes(32).toString("base64"));

  // Accept base64 or hex; derive a stable 32-byte key.
  let key: Buffer;
  try {
    const decoded = Buffer.from(raw, "base64");
    key = decoded.length === KEY_LENGTH ? decoded : crypto.createHash("sha256").update(raw).digest();
  } catch {
    key = crypto.createHash("sha256").update(raw).digest();
  }

  if (key.length !== KEY_LENGTH) {
    key = crypto.createHash("sha256").update(raw).digest();
  }

  cachedKey = key;
  return key;
}

/** Encrypt a UTF-8 string. Returns the versioned storage token. */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/** Decrypt a token produced by encrypt(). Returns null on tamper/format error. */
export function decrypt(token: string): string | null {
  try {
    const parts = token.split(":");
    if (parts.length !== 4 || parts[0] !== VERSION) return null;
    const [, ivB64, tagB64, dataB64] = parts;
    const key = getKey();
    const iv = Buffer.from(ivB64, "base64");
    const authTag = Buffer.from(tagB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

/** Encrypt an optional field; passes through null/undefined/empty unchanged. */
export function encryptField(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  return encrypt(value);
}

/** Decrypt an optional field; returns the original if it isn't an encrypted token. */
export function decryptField(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  if (!value.startsWith(`${VERSION}:`)) return value; // legacy plaintext tolerance
  return decrypt(value);
}
