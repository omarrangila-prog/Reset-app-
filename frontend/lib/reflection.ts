import { LogEntry } from "./api";

export interface DailyActivity {
  date: string;
  urges: number;
  successes: number;
  relapses: number;
}

/**
 * A short, warm, personalized reflection for the top of Home — generated from
 * the user's *recent* activity so RESET feels like it understands their journey.
 *
 * Same honesty rule as deriveInsight: never fabricate a pattern. When there
 * isn't enough signal, return a gentle, true message. Plain, supportive tone.
 */
export function deriveReflection(
  logs: LogEntry[] | undefined,
  activity: DailyActivity[] | undefined,
  streak: number
): string {
  const days = activity ?? [];
  const recent = days.slice(-7);

  // Consecutive check-in days ending today (a real "showing up" streak).
  const checkinDays = countTrailingCheckinDays(logs);
  if (checkinDays >= 3) {
    return `You've checked in ${checkinDays} days in a row. Consistency is becoming your strength.`;
  }

  // Yesterday was hard but they reflected instead of ignoring it.
  const yesterday = recent[recent.length - 2];
  if (yesterday && yesterday.urges > 0 && yesterday.relapses === 0) {
    return "Yesterday had its hard moments, but you chose to face them instead of look away. That's meaningful progress.";
  }

  // A recent slip — meet it with compassion, not shame.
  const slippedRecently = recent.some((d) => d.relapses > 0);
  if (slippedRecently && streak >= 1) {
    return "You had a setback recently and still came back. Starting again is its own kind of strength.";
  }

  // Urges faced this week.
  const urgesThisWeek = recent.reduce((s, d) => s + d.urges, 0);
  if (urgesThisWeek >= 3) {
    return `You've worked through ${urgesThisWeek} tough moments this week. Each one you face makes the next a little easier.`;
  }

  // Momentum on a streak.
  if (streak >= 2) {
    return `Day ${streak} of showing up for yourself. Small, steady choices are how change is built.`;
  }

  // Not enough signal yet — true and encouraging, no false claims.
  return "However today feels, you're here — and that's where every reset begins.";
}

// Count distinct calendar days with a CHECK_IN, walking back from today with no gaps.
function countTrailingCheckinDays(logs: LogEntry[] | undefined): number {
  const checkins = (logs ?? []).filter((l) => l.type === "CHECK_IN");
  if (checkins.length === 0) return 0;

  const dayKeys = new Set(
    checkins.map((l) => new Date(l.timestamp).toISOString().split("T")[0])
  );

  let count = 0;
  const cursor = new Date();
  // Allow the streak to be anchored at today OR yesterday (they may not have
  // checked in yet today) — so a real run isn't reset the moment midnight passes.
  if (!dayKeys.has(cursor.toISOString().split("T")[0])) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dayKeys.has(cursor.toISOString().split("T")[0])) return 0;
  }
  while (dayKeys.has(cursor.toISOString().split("T")[0])) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
