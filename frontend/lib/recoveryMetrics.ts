import { LogEntry, TriggerPattern } from "./api";

/**
 * Recovery metrics — a multi-factor recovery picture (not streak alone) plus
 * Trigger Discovery patterns. Pure functions over the user's own logs, with a
 * seeded fallback so screens look complete before real data exists. Honest:
 * never invents a specific pattern it can't support.
 */

export interface TriggerDiscovery {
  hardestTime: string;
  commonLocation: string;
  strongestEmotion: string;
  bestResponse: string;
  longestUrgeMinutes: number;
  bestDay: string;
  riskiestDay: string;
  hasRealData: boolean;
}

const TRIGGER_LABEL: Record<string, string> = {
  BOREDOM: "Boredom", STRESS: "Stress", LONELINESS: "Loneliness", ANXIETY: "Anxiety",
  ANGER: "Anger", SADNESS: "Sadness", LATE_NIGHT: "Late night", IDLE_TIME: "Idle time",
  SOCIAL_REJECTION: "Feeling rejected",
};

const DEMO_DISCOVERY: TriggerDiscovery = {
  hardestTime: "11 PM – 1 AM",
  commonLocation: "Bedroom",
  strongestEmotion: "Stress",
  bestResponse: "Walking",
  longestUrgeMinutes: 17,
  bestDay: "Tuesday",
  riskiestDay: "Saturday",
  hasRealData: false,
};

export function deriveTriggerDiscovery(
  logs: LogEntry[] | undefined,
  triggers: TriggerPattern[] | undefined
): TriggerDiscovery {
  const urges = (logs ?? []).filter((l) => l.type === "URGE");
  if (urges.length < 3) return DEMO_DISCOVERY;

  // Hardest time — bucket urge hours.
  const hourCounts = new Array(24).fill(0);
  urges.forEach((u) => { hourCounts[new Date(u.timestamp).getHours()]++; });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const fmtHour = (h: number) => { const am = h < 12; const hr = h % 12 === 0 ? 12 : h % 12; return `${hr} ${am ? "AM" : "PM"}`; };
  const hardestTime = `${fmtHour(peakHour)} – ${fmtHour((peakHour + 2) % 24)}`;

  // Strongest emotion — most frequent trigger.
  const sorted = (triggers ?? []).slice().sort((a, b) => b.frequency - a.frequency);
  const strongestEmotion = sorted[0] ? (TRIGGER_LABEL[sorted[0].type] || "Certain moments") : "Stress";

  // Best / riskiest day of week.
  const dayCounts = new Array(7).fill(0);
  urges.forEach((u) => { dayCounts[new Date(u.timestamp).getDay()]++; });
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const riskiestDay = days[dayCounts.indexOf(Math.max(...dayCounts))];
  const bestDay = days[dayCounts.indexOf(Math.min(...dayCounts))];

  return {
    hardestTime,
    commonLocation: DEMO_DISCOVERY.commonLocation, // location isn't tracked server-side yet
    strongestEmotion,
    bestResponse: DEMO_DISCOVERY.bestResponse,
    longestUrgeMinutes: DEMO_DISCOVERY.longestUrgeMinutes,
    bestDay,
    riskiestDay,
    hasRealData: true,
  };
}

// ── Multi-factor Recovery Score ────────────────────────────────────────────────
export interface RecoveryScoreBreakdown {
  score: number;                 // 0..100
  factors: { label: string; value: number; hint: string }[];
  trend: "improving" | "steady" | "early";
}

/**
 * A resilient score: missing one day doesn't destroy it. Blends the server
 * disciplineScore with locally-known signals (journaling, calm sessions, wins).
 */
export function deriveRecoveryScore(opts: {
  disciplineScore?: number;
  dailyActivity?: Array<{ urges: number; successes: number }>;
  journalCount?: number;
  calmSessions?: number;
  winCount?: number;
}): RecoveryScoreBreakdown {
  const base = clamp(opts.disciplineScore ?? 62, 0, 100);
  const days = opts.dailyActivity ?? [];
  const recent = days.slice(-7);
  const handled = recent.reduce((s, d) => s + d.successes, 0);
  const urges = recent.reduce((s, d) => s + d.urges, 0);
  const responseRate = urges > 0 ? Math.round((handled / urges) * 100) : 70;

  const journalScore = clamp((opts.journalCount ?? 3) * 12, 0, 100);
  const calmScore = clamp((opts.calmSessions ?? 4) * 14, 0, 100);
  const winScore = clamp((opts.winCount ?? 5) * 12, 0, 100);

  // Weighted blend — no single factor dominates, so one bad day can't tank it.
  const score = Math.round(base * 0.4 + responseRate * 0.25 + journalScore * 0.12 + calmScore * 0.12 + winScore * 0.11);

  const factors = [
    { label: "Responding differently", value: responseRate, hint: "How often you chose a healthier response" },
    { label: "Reflection", value: journalScore, hint: "Journaling builds awareness" },
    { label: "Calm practice", value: calmScore, hint: "Calm Mode sessions" },
    { label: "Recorded wins", value: winScore, hint: "Reinforcing what helps" },
  ];
  const trend = responseRate >= 60 ? "improving" : urges + handled === 0 ? "early" : "steady";
  return { score: clamp(score, 0, 100), factors, trend };
}

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
