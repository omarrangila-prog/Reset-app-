/**
 * Fallback / demonstration insights.
 *
 * Shown ONLY when the real API is unavailable, returns nothing useful, or the
 * device session never establishes — so the Insights tab can never sit on an
 * infinite skeleton. Real API data replaces this automatically when present.
 *
 * Shaped to match the fields the dashboard derives from a real `MeProfile`, so
 * the same render path works for both. Values are plausible but clearly sample.
 */
export interface DemoAnalytics {
  streak: number;
  longestStreak: number;
  totalUrges: number;
  totalRelapses: number;
  triggerPatterns: Array<{ id: string; type: string; frequency: number; lastSeen: string }>;
  dailyActivity: Array<{ date: string; urges: number; successes: number; relapses: number }>;
}

// Build a trailing 14-day activity series from two compact arrays so the demo
// chart looks like a real recovery trend rather than random noise.
function demoDailyActivity(): DemoAnalytics["dailyActivity"] {
  const urges = [3, 2, 3, 2, 1, 2, 1, 2, 1, 1, 2, 1, 0, 1];
  const wins = [1, 2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 0, 1];
  const today = new Date();
  return urges.map((u, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (urges.length - 1 - i));
    return {
      date: d.toISOString().split("T")[0],
      urges: u,
      successes: wins[i],
      relapses: 0,
    };
  });
}

export const DEMO_ANALYTICS: DemoAnalytics = {
  streak: 12,
  longestStreak: 14,
  totalUrges: 22,
  totalRelapses: 1,
  triggerPatterns: [
    { id: "d1", type: "LATE_NIGHT", frequency: 8, lastSeen: new Date().toISOString() },
    { id: "d2", type: "STRESS", frequency: 6, lastSeen: new Date().toISOString() },
    { id: "d3", type: "BOREDOM", frequency: 4, lastSeen: new Date().toISOString() },
    { id: "d4", type: "LONELINESS", frequency: 2, lastSeen: new Date().toISOString() },
  ],
  dailyActivity: demoDailyActivity(),
};

// Narrative insight strings (used by the editorial insight sections).
export const DEMO_INSIGHTS = {
  weeklySummary: "You recovered more quickly from difficult moments this week.",
  moodPattern: "Your evenings have been calmer after journaling.",
  topTrigger: "Late-night scrolling appears most often between 10 PM and midnight.",
  helpfulAction: "Walking helped in 4 of your last 5 difficult moments.",
  recommendation: "Try a five-minute walk before opening social media tonight.",
} as const;

// True when a real API profile carries enough signal to prefer it over demo.
export function hasUsefulAnalytics(a: { dailyActivity?: Array<{ urges: number; successes: number }> } | null | undefined): boolean {
  if (!a?.dailyActivity?.length) return false;
  return a.dailyActivity.some((d) => d.urges > 0 || d.successes > 0);
}
