/**
 * Non-punitive recovery scoring.
 *
 * Clinical rationale: relapse is an expected part of behavior change (CFT/ACT/
 * MI all reject shame and punishment). We therefore:
 *  - reward consistency and engagement,
 *  - NEVER deduct points for a relapse,
 *  - treat "showing up after a slip" as itself worth points.
 *
 * The score is a 0..100 momentum indicator, not a moral judgment.
 */

export interface ScoreInputs {
  currentStreak: number;
  totalCheckIns: number;
  /** engagement actions in the last 7 days (urge tools used, journal entries, check-ins) */
  weeklyEngagement: number;
}

export function computeDisciplineScore(inputs: ScoreInputs): number {
  const { currentStreak, weeklyEngagement } = inputs;
  // Streak contributes with diminishing returns (sqrt) so early days feel
  // rewarding and long streaks don't dominate.
  const streakComponent = Math.min(60, Math.round(Math.sqrt(currentStreak) * 12));
  // Engagement rewards using the tools even on hard days.
  const engagementComponent = Math.min(40, weeklyEngagement * 5);
  return Math.max(0, Math.min(100, streakComponent + engagementComponent));
}

/** A gentle label for the current momentum, never shaming. */
export function momentumLabel(score: number): string {
  if (score >= 80) return "You're doing great";
  if (score >= 55) return "Going well";
  if (score >= 30) return "Off to a good start";
  return "Just getting started";
}
