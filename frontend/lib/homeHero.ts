/**
 * Dynamic Home hero + contextual quote. Rotates the hero line by time of day
 * and recent state (after a difficult day / after a milestone) so every visit
 * feels fresh, and pairs it with a contextual quote (not random). Calm, human,
 * short — the AI-personality tone.
 */
export interface HomeHero { line: string; quote: string }

export function deriveHomeHero(opts: {
  streak?: number;
  hadRecentLapse?: boolean;   // a difficult moment in the last day or two
  hitMilestone?: boolean;     // just crossed a streak milestone
}): HomeHero {
  const h = new Date().getHours();
  const streak = opts.streak ?? 0;

  let line: string;
  if (opts.hadRecentLapse) line = "One difficult moment doesn't define your journey.";
  else if (opts.hitMilestone) line = "You handled today differently. That's how change is built.";
  else if (h < 12) line = "Good morning. A fresh page, one small step.";
  else if (h < 17) line = "Steady through the afternoon — you're doing fine.";
  else if (h < 22) line = "Tonight, we'll take it one step at a time.";
  else line = "Rest well. Tomorrow is another chance to grow.";

  // Contextual quotes chosen by state, one per visit.
  let quote: string;
  if (opts.hadRecentLapse) quote = "Recovery isn't about never struggling. It's about choosing your next step.";
  else if (opts.hitMilestone || streak >= 7) quote = "Today's small decision becomes tomorrow's habit.";
  else if (h >= 21 || h < 4) quote = "The night passes. So does the urge. You only have to get through the next few minutes.";
  else quote = "You don't have to be perfect. You just have to keep tending the garden.";

  return { line, quote };
}
