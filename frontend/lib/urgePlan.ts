/**
 * Personal Urge Plan — the ordered set of actions a user commits to *before* an
 * urge happens, so SOS can show their own plan instead of generic advice.
 * Stored locally (private). One centralized model + helpers, like recoveryProfile.
 */
export interface UrgeAction {
  id: string;
  label: string;
  /** route to open when the action is a one-tap app action, else undefined */
  href?: string;
}

const KEY = "reset_urge_plan";

// Suggested actions the user can pick from (or add custom).
export const SUGGESTED_ACTIONS: UrgeAction[] = [
  { id: "phone-away", label: "Put my phone away" },
  { id: "leave-room", label: "Move to another room" },
  { id: "breaths", label: "Take 10 deep breaths", href: "/urge" },
  { id: "calm", label: "Start Calm Mode", href: "/urge" },
  { id: "journal", label: "Open Journal", href: "/journey/journal" },
  { id: "walk", label: "Go for a walk" },
  { id: "water", label: "Drink water" },
  { id: "audio", label: "Listen to calming audio", href: "/urge" },
  { id: "coach", label: "Talk to the Coach", href: "/coach" },
  { id: "delay", label: "Wait 10 minutes before deciding", href: "/urge/delay" },
];

// A sensible default plan (used until the user customizes one).
export const DEFAULT_PLAN: UrgeAction[] = [
  { id: "phone-away", label: "Put my phone away" },
  { id: "leave-room", label: "Move to another room" },
  { id: "calm", label: "Start Calm Mode", href: "/urge" },
  { id: "delay", label: "Wait 10 minutes before deciding", href: "/urge/delay" },
];

export function loadPlan(): UrgeAction[] {
  if (typeof window === "undefined") return DEFAULT_PLAN;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PLAN;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_PLAN;
  } catch {
    return DEFAULT_PLAN;
  }
}

export function savePlan(plan: UrgeAction[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(plan)); } catch { /* non-fatal */ }
}

export function hasCustomPlan(): boolean {
  if (typeof window === "undefined") return false;
  try { return !!localStorage.getItem(KEY); } catch { return false; }
}
