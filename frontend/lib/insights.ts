import { LogEntry, TriggerPattern } from "./api";

/**
 * Derive a real, honest insight from the user's own data. Never fabricates:
 * if there isn't enough data yet, it returns an encouraging default that makes
 * no false claims. Plain language, no clinical terms.
 */
export function deriveInsight(
  logs: LogEntry[] | undefined,
  triggers: TriggerPattern[] | undefined
): string {
  const urges = (logs ?? []).filter((l) => l.type === "URGE");

  // Not enough data yet — be honest, don't invent a pattern.
  if (urges.length < 3) {
    return "As you check in and use calm mode, patterns will show up here — so this gets more useful the more you use it.";
  }

  // 1) Late-night pattern: are most urges between 10pm–2am?
  const lateNight = urges.filter((l) => {
    const h = new Date(l.timestamp).getHours();
    return h >= 22 || h < 2;
  }).length;
  if (lateNight / urges.length >= 0.5) {
    const pct = Math.round((lateNight / urges.length) * 100);
    return `About ${pct}% of your tough moments happen late at night. Getting to bed a bit earlier could quietly make them easier.`;
  }

  // 2) Most common trigger, if one clearly leads.
  const sorted = (triggers ?? []).slice().sort((a, b) => b.frequency - a.frequency);
  if (sorted.length > 0 && sorted[0].frequency >= 2) {
    const label: Record<string, string> = {
      BOREDOM: "boredom", STRESS: "stress", LONELINESS: "loneliness", ANXIETY: "feeling anxious",
      ANGER: "anger", SADNESS: "sadness", LATE_NIGHT: "late nights", IDLE_TIME: "idle time",
      SOCIAL_REJECTION: "feeling rejected",
    };
    const name = label[sorted[0].type] || "certain moments";
    return `${name[0].toUpperCase() + name.slice(1)} seems to set off your urges most. Spotting it early gives you a head start.`;
  }

  // 3) Progress-based encouragement (real: based on their urge count faced).
  return `You've worked through ${urges.length} urges so far. Every one you face makes the next a little easier.`;
}
