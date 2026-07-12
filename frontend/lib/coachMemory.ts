/**
 * AI coach memory (local, private). Stores short conversation snippets + notable
 * themes the user mentioned, so the coach can open with continuity — "Last week
 * you said evenings were hardest. Has anything changed?" — instead of feeling
 * generic. Nothing leaves the device.
 */
export interface MemoryNote { text: string; ts: number }

const KEY = "reset_coach_memory";
const MAX = 20;

export function loadMemory(): MemoryNote[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export function rememberUserMessage(text: string): void {
  const t = text.trim();
  if (t.length < 12) return; // only remember substantive messages
  const notes = loadMemory();
  notes.push({ text: t.slice(0, 240), ts: Date.now() });
  try { localStorage.setItem(KEY, JSON.stringify(notes.slice(-MAX))); } catch {}
}

// A gentle continuity opener based on the most recent notable note, if it's a
// few days old (so it reads as "remembering", not echoing this session).
export function memoryOpener(): string | null {
  const notes = loadMemory();
  if (notes.length === 0) return null;
  const dayMs = 86400000;
  // Prefer a note from 3–14 days ago; else the most recent older-than-1-day one.
  const now = Date.now();
  const candidate =
    notes.slice().reverse().find((n) => now - n.ts >= 3 * dayMs && now - n.ts <= 14 * dayMs) ||
    notes.slice().reverse().find((n) => now - n.ts >= dayMs);
  if (!candidate) return null;
  const daysAgo = Math.round((now - candidate.ts) / dayMs);
  const when = daysAgo >= 7 ? "Last week" : `A few days ago`;
  return `${when} you mentioned: “${candidate.text}”. Has anything shifted since then?`;
}

// Recent notes joined for the AI's context window (server prompt).
export function memoryContext(): string {
  const notes = loadMemory();
  if (notes.length === 0) return "";
  return notes.slice(-6).map((n) => `- ${n.text}`).join("\n");
}
