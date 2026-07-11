/**
 * Centralized motion tokens — one source of truth for durations & easing so
 * transitions feel consistent across the app. Values in ms.
 */
export const motionTokens = {
  instant: 120,
  fast: 180,
  normal: 280,
  slow: 420,
  hero: 700,
  ease: [0.22, 1, 0.36, 1] as const,
};

// Convenience spring for tactile press/lift interactions.
export const springSoft = { type: "spring", stiffness: 420, damping: 30 } as const;
