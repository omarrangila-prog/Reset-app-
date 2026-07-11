/**
 * Haptic feedback via the Web Vibration API.
 *
 * Works on Android Chrome (and installed PWAs). iOS Safari does not expose
 * navigator.vibrate, so these are safe no-ops there — never throws, never
 * blocks. Patterns are intentionally gentle: no harsh long buzzes.
 *
 * Respects prefers-reduced-motion (users who reduce motion usually want
 * calmer feedback too).
 */

type Pattern = "tap" | "select" | "success" | "orb" | "achievement" | "warning";

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 8, // barely-there tick on any press
  select: 14, // choosing something (mood, habit)
  success: [10, 40, 16], // a small satisfying confirm
  orb: [6, 30, 6], // soft pulse for orb interactions
  achievement: [12, 40, 12, 40, 24], // a gentle "resonance" for milestones
  warning: [0, 24, 30, 24], // for destructive confirms
};

function reduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function haptic(pattern: Pattern = "tap"): void {
  try {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    if (reduced() && pattern !== "warning") return;
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* no-op — some browsers throw if not user-activated */
  }
}
