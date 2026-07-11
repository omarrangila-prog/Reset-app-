/**
 * Wins Journal + Victory Wall + Future-Me letter — local, private records that
 * reinforce helpful behavior instead of only tracking problems.
 */
export interface Win { id: string; text: string; date: string } // date = ISO day

const WINS_KEY = "reset_wins";
const LETTER_KEY = "reset_future_me";

// Suggested victories users can tap to add quickly.
export const SUGGESTED_WINS = [
  "Left the room instead of scrolling",
  "Used Calm Mode",
  "Journaled after a difficult moment",
  "Went to bed earlier",
  "Asked for help",
  "Went for a walk instead of scrolling",
  "Paused before acting",
  "Reduced late-night screen time",
];

export function loadWins(): Win[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(WINS_KEY) || "[]"); } catch { return []; }
}
export function addWin(text: string): Win[] {
  const win: Win = { id: `w-${Date.now()}`, text, date: new Date().toISOString().split("T")[0] };
  const next = [win, ...loadWins()].slice(0, 200);
  try { localStorage.setItem(WINS_KEY, JSON.stringify(next)); } catch {}
  return next;
}
export function removeWin(id: string): Win[] {
  const next = loadWins().filter((w) => w.id !== id);
  try { localStorage.setItem(WINS_KEY, JSON.stringify(next)); } catch {}
  return next;
}

export function loadLetter(): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(LETTER_KEY) || ""; } catch { return ""; }
}
export function saveLetter(text: string): void {
  try { localStorage.setItem(LETTER_KEY, text); } catch {}
}
