/**
 * Fallback / demonstration profile.
 *
 * Used ONLY when real profile data is missing or empty, so Profile and Settings
 * look complete immediately for a demo. Real API data replaces it automatically.
 * A subtle "Sample profile" badge should mark when this is shown.
 */
export const DEMO_PROFILE = {
  name: "Omar",
  chapter: "Building steadier evenings",
  streak: 12,
  longestStreak: 21,
  reflectionsThisMonth: 14,
  calmSessions: 9,
  urgesWorkedThrough: 18,
  strongestImprovement: "Late-night routine",
  helpfulAction: "Walking",
  currentGoal: "No phone after 10:30 PM",
  encouragement: "You have returned to your intention 12 days in a row.",
} as const;

export type DemoProfile = typeof DEMO_PROFILE;
