/**
 * Client-side device identity.
 *
 * Generates a non-extractable Ed25519 keypair in the browser, persists it in
 * IndexedDB (private key never leaves the device), and registers the public key
 * with the server to obtain an httpOnly session cookie. On reload we reuse the
 * stored key and re-establish the session if needed.
 *
 * This provides anonymous, PII-free authentication with per-device continuity.
 */

import { api } from "./api";

const DB_NAME = "reset-identity";
const STORE = "keys";
const KEY_ID = "device-ed25519";

interface StoredKey {
  privateKey: CryptoKey;
  publicKeyPem: string;
}

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<StoredKey | undefined> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: StoredKey): Promise<void> {
  const db = await idb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function toPem(spki: ArrayBuffer): string {
  const b64 = btoa(String.fromCharCode(...new Uint8Array(spki)));
  const lines = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}

async function generateKey(): Promise<StoredKey> {
  const pair = (await crypto.subtle.generateKey(
    { name: "Ed25519" } as any,
    false, // private key non-extractable
    ["sign", "verify"]
  )) as CryptoKeyPair;
  const spki = await crypto.subtle.exportKey("spki", pair.publicKey);
  const stored: StoredKey = { privateKey: pair.privateKey, publicKeyPem: toPem(spki) };
  await idbSet(KEY_ID, stored);
  return stored;
}

async function getOrCreateKey(): Promise<StoredKey> {
  const existing = await idbGet(KEY_ID);
  if (existing?.privateKey && existing.publicKeyPem) return existing;
  return generateKey();
}

/**
 * Ensure the device is authenticated. Returns the userId. Safe to call on every
 * app load; it reuses an existing session when present.
 */
export async function ensureDeviceSession(): Promise<string | null> {
  if (typeof window === "undefined" || !("indexedDB" in window) || !crypto.subtle) {
    return null;
  }
  try {
    // Already have a valid session?
    const session = await api.getSession().catch(() => ({ authenticated: false as const }));
    if (session.authenticated && session.userId) return session.userId;
  } catch {
    /* fall through to register */
  }

  try {
    const key = await getOrCreateKey();
    const nonce = crypto.randomUUID();
    const sig = await crypto.subtle.sign(
      { name: "Ed25519" } as any,
      key.privateKey,
      new TextEncoder().encode(nonce)
    );
    const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const res = await api.register({
      publicKey: key.publicKeyPem,
      nonce,
      signature,
      timezone,
    });
    return res.userId;
  } catch {
    return null;
  }
}
