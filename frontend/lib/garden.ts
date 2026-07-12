/**
 * Recovery Garden — growth, not badges. Healthy actions (wins, reflections,
 * calm sessions, days shown up) accumulate into "growth points" that never
 * decrease. A lapse doesn't kill anything; growth simply slows. This reinforces
 * that recovery is about nurturing, not perfection.
 */
import { loadWins } from "./wins";

export interface GardenState {
  points: number;         // monotonic growth score
  stage: number;          // 0..5 overall garden maturity
  flowers: number;        // blooms unlocked
  trees: number;          // trees grown
  butterflies: number;    // appear at higher growth
  nextAt: number;         // points needed for the next visible growth
  season: "spring" | "summer" | "autumn" | "winter";
}

// Each source contributes growth points. Streak is capped-generous so a reset
// doesn't erase the garden — points already earned stay earned.
export function computeGarden(opts: { streak?: number; longestStreak?: number; journalCount?: number; calmSessions?: number }): GardenState {
  const wins = loadWins().length;
  const journal = opts.journalCount ?? 0;
  const calm = opts.calmSessions ?? 0;
  // Longest streak preserves earned growth even after a difficult moment.
  const streakGrowth = Math.max(opts.streak ?? 0, opts.longestStreak ?? 0);

  const points = wins * 6 + journal * 5 + calm * 7 + streakGrowth * 3;

  const stage = points >= 300 ? 5 : points >= 180 ? 4 : points >= 100 ? 3 : points >= 50 ? 2 : points >= 20 ? 1 : 0;
  const flowers = Math.min(9, Math.floor(points / 14));
  const trees = Math.min(4, Math.floor(points / 70));
  const butterflies = points >= 120 ? Math.min(3, Math.floor((points - 120) / 60) + 1) : 0;

  const thresholds = [20, 50, 100, 180, 300, 450];
  const nextAt = thresholds.find((t) => t > points) ?? points + 150;

  // Season rotates by real month — a calm, slow ambient change.
  const m = new Date().getMonth();
  const season = m <= 1 || m === 11 ? "winter" : m <= 4 ? "spring" : m <= 7 ? "summer" : "autumn";

  return { points, stage, flowers, trees, butterflies, nextAt, season };
}

// A gentle, honest line about the garden's current growth.
export function gardenMessage(g: GardenState): string {
  if (g.points === 0) return "Your garden is ready. Every healthy action helps it grow.";
  if (g.stage >= 4) return "Your garden is flourishing. Look how much you've nurtured.";
  if (g.stage >= 2) return "Things are taking root. Keep tending, gently.";
  return "The first shoots are appearing. Growth has begun.";
}
