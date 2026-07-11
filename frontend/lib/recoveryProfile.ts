/**
 * RecoveryProfile — the single centralized model for onboarding personalization.
 *
 * Stored locally (private by default) under one key. Every recommendation the
 * app makes (Home focus, reminder time, SOS ordering, coach tone hints) derives
 * from this profile via the pure helpers below — so the data lives in ONE place,
 * not scattered across components.
 */
export interface RecoveryProfile {
  primaryGoals: string[];
  highRiskTimes: string[];
  triggers: string[];
  locations: string[];
  frequency: string;
  successGoals: string[];
  reminderTime: string; // "HH:MM" 24h, or "" for none
  onboardingCompleted: boolean;
}

const KEY = "reset_recovery_profile";

export const DEFAULT_PROFILE: RecoveryProfile = {
  primaryGoals: [],
  highRiskTimes: [],
  triggers: [],
  locations: [],
  frequency: "",
  successGoals: [],
  reminderTime: "21:30",
  onboardingCompleted: false,
};

export function loadProfile(): RecoveryProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(p: RecoveryProfile): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private/full storage — non-fatal */ }
}

// ── Option catalogs (labels shown in onboarding + editor) ──────────────────────
export const GOAL_OPTIONS = [
  "I want to quit porn",
  "I want to reduce how often I watch",
  "I want better self-control",
  "I want healthier habits",
  "I want better focus",
  "I'm just exploring",
];
export const TIME_OPTIONS = ["Morning", "Afternoon", "Evening", "Late night", "After work", "After studying", "Weekends", "Randomly"];
export const TRIGGER_OPTIONS = ["Stress", "Boredom", "Loneliness", "Anxiety", "Social media", "Being in bed", "Phone at night", "Arguments", "Feeling rejected", "Habit", "Other"];
export const LOCATION_OPTIONS = ["Bedroom", "Bathroom", "Living room", "Office", "Anywhere", "Prefer not to answer"];
export const FREQUENCY_OPTIONS = ["Less than once a week", "1–2 times per week", "3–5 times per week", "Almost every day", "More than once a day", "Prefer not to answer"];
export const SUCCESS_OPTIONS = ["Quit completely", "Reduce my usage", "Feel more in control", "Sleep better", "Improve my focus", "Improve relationships", "Reduce guilt", "Build healthier habits"];
export const REMINDER_OPTIONS = [
  { label: "Morning", time: "08:00" },
  { label: "Afternoon", time: "14:00" },
  { label: "Evening", time: "21:00" },
  { label: "Late night", time: "22:30" },
];

// ── Derived recommendations (pure — used across Home / SOS / reminders) ────────
export interface DerivedRecovery {
  primaryGoal: string;
  topTrigger: string;
  highRiskTime: string;
  highRiskPlace: string;
  firstStep: string;
  weeklyFocus: string;
  reminderTime: string;
  confidence: string; // supportive message, NOT a score
}

export function deriveRecovery(p: RecoveryProfile): DerivedRecovery {
  const primaryGoal = p.primaryGoals[0] || "Regain self-control";
  const topTrigger = p.triggers[0] || "Stress";
  const lateNight = p.highRiskTimes.some((t) => /late night|evening|after work/i.test(t));
  const highRiskTime = p.highRiskTimes[0] || "Late night";
  const highRiskPlace = p.locations.find((l) => l !== "Prefer not to answer") || "Bedroom";

  // Reminder: default to just before the risk window when it's late.
  const reminderTime = p.reminderTime || (lateNight ? "21:30" : "21:00");

  // First step adapts to the strongest signals.
  let firstStep = "Use Calm Mode when a difficult moment begins, and take it one decision at a time.";
  if (/bedroom/i.test(highRiskPlace) || lateNight) {
    firstStep = "Keep your phone outside the bedroom after 10 PM, and start Calm Mode when an urge begins.";
  } else if (/stress/i.test(topTrigger)) {
    firstStep = "When stress builds, try a 3-minute Calm Mode reset before reaching for your phone.";
  } else if (p.successGoals.some((g) => /focus/i.test(g))) {
    firstStep = "Notice the trigger, delay 10 minutes, and redirect to one focused task.";
  }

  // Weekly focus.
  let weeklyFocus = "Notice one pattern behind your difficult moments.";
  if (lateNight) weeklyFocus = "Reduce late-night scrolling.";
  else if (/stress/i.test(topTrigger)) weeklyFocus = "Practice one calm response to stress each day.";
  else if (p.successGoals.some((g) => /sleep/i.test(g))) weeklyFocus = "Build a gentle evening wind-down.";

  const focusAreas: string[] = [];
  if (lateNight) focusAreas.push("late-night habits");
  if (/stress/i.test(topTrigger)) focusAreas.push("stress management");
  if (focusAreas.length === 0) focusAreas.push("noticing your patterns");
  const confidence = `Based on what you've shared, we'll focus on ${focusAreas.join(" and ")} first. Small changes there are likely to have the biggest impact.`;

  return { primaryGoal, topTrigger, highRiskTime, highRiskPlace, firstStep, weeklyFocus, reminderTime, confidence };
}
