/**
 * Calendar-aware, timezone-correct streak logic.
 *
 * A "streak" is the number of consecutive calendar days (in the user's local
 * timezone) the user has stayed on track, anchored to real dates rather than a
 * client-incremented counter. This makes the streak:
 *   - honest (tied to real elapsed days, not button taps),
 *   - idempotent (checking in twice on the same day is a no-op),
 *   - resistant to forgery (derived server-side from dates).
 *
 * Recovery framing: a relapse resets to day 0, but we never punish with score
 * deductions (that is clinically counterproductive). See recovery.ts.
 */

/** Return the user's local calendar day as a YYYY-MM-DD string. */
export function localDayString(date: Date, timezone: string): string {
  try {
    // en-CA yields YYYY-MM-DD.
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }
}

/** Whole-day difference between two YYYY-MM-DD day strings (b - a). */
export function dayDiff(aDay: string, bDay: string): number {
  const a = Date.parse(`${aDay}T00:00:00Z`);
  const b = Date.parse(`${bDay}T00:00:00Z`);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export interface StreakState {
  streak: number;
  longestStreak: number;
  lastStreakDate: Date | null;
  streakStartDate: Date | null;
}

export interface StreakUpdateResult extends StreakState {
  /** True when this call actually advanced the streak (first check-in of a new day). */
  advanced: boolean;
  /** True when nothing changed because the user already checked in today. */
  alreadyCheckedInToday: boolean;
}

/**
 * Record an on-track check-in for "now". Advances the streak only when the
 * local calendar day is newer than the last recorded streak day. A gap of more
 * than one day means the user missed a day: we restart the streak at 1 for
 * today (an honest reset, not zero, because they showed up today).
 */
export function checkIn(state: StreakState, now: Date, timezone: string): StreakUpdateResult {
  const today = localDayString(now, timezone);
  const lastDay = state.lastStreakDate ? localDayString(state.lastStreakDate, timezone) : null;

  if (lastDay === today) {
    return {
      ...state,
      advanced: false,
      alreadyCheckedInToday: true,
    };
  }

  let newStreak: number;
  let streakStart: Date | null = state.streakStartDate;

  if (lastDay && dayDiff(lastDay, today) === 1) {
    // Consecutive day — advance.
    newStreak = state.streak + 1;
  } else {
    // First ever check-in, or a gap: start a fresh streak at day 1.
    newStreak = 1;
    streakStart = now;
  }

  const longest = Math.max(newStreak, state.longestStreak);

  return {
    streak: newStreak,
    longestStreak: longest,
    lastStreakDate: now,
    streakStartDate: streakStart,
    advanced: true,
    alreadyCheckedInToday: false,
  };
}

/**
 * Compute the *displayed* current streak, accounting for missed days since the
 * last check-in. If the user checked in yesterday, today's streak still stands
 * (they haven't missed yet). If the last check-in was 2+ days ago, the streak
 * is stale and should read 0 until they check in again.
 */
export function currentStreak(state: StreakState, now: Date, timezone: string): number {
  if (!state.lastStreakDate) return 0;
  const today = localDayString(now, timezone);
  const lastDay = localDayString(state.lastStreakDate, timezone);
  const gap = dayDiff(lastDay, today);
  if (gap <= 1) return state.streak; // today or yesterday -> still valid
  return 0; // missed a day -> streak lapsed
}

/** Apply a relapse: streak resets to 0. Score is handled compassionately elsewhere. */
export function relapse(state: StreakState): StreakState {
  return {
    streak: 0,
    longestStreak: state.longestStreak,
    lastStreakDate: null,
    streakStartDate: null,
  };
}
