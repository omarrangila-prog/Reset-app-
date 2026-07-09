import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/memoryStore";
import { withAuth } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rateLimit";
import { decryptField } from "@/lib/crypto";
import { currentStreak } from "@/lib/streak";
import { momentumLabel } from "@/lib/recovery";
import { log as logger } from "@/lib/logger";

/** GET /api/me — profile + decrypted logs + analytics for the authenticated user. */
export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "read", LIMITS.read, userId);
    if (limited) return limited;

    try {
      const user = store.getUser(userId);
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const now = new Date();
      const displayStreak = currentStreak(
        {
          streak: user.streak,
          longestStreak: user.longestStreak,
          lastStreakDate: user.lastStreakDate,
          streakStartDate: user.streakStartDate,
        },
        now,
        user.timezone
      );

      const allLogs = store.listLogs(userId, { limit: 500 });
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const recentLogs = allLogs.filter((l) => l.timestamp >= sevenDaysAgo);

      const weeklyStats = {
        urges: recentLogs.filter((l) => l.type === "URGE").length,
        relapses: recentLogs.filter((l) => l.type === "RELAPSE").length,
        successes: recentLogs.filter((l) => l.type === "SUCCESS").length,
      };

      const dailyActivity: Record<string, { urges: number; successes: number; relapses: number }> = {};
      for (const l of allLogs) {
        if (l.timestamp < thirtyDaysAgo) continue;
        const day = new Intl.DateTimeFormat("en-CA", {
          timeZone: user.timezone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(l.timestamp);
        dailyActivity[day] ??= { urges: 0, successes: 0, relapses: 0 };
        if (l.type === "URGE") dailyActivity[day].urges++;
        if (l.type === "SUCCESS") dailyActivity[day].successes++;
        if (l.type === "RELAPSE") dailyActivity[day].relapses++;
      }

      return NextResponse.json({
        id: user.id,
        streak: displayStreak,
        longestStreak: user.longestStreak,
        totalUrges: user.totalUrges,
        totalRelapses: user.totalRelapses,
        disciplineScore: user.disciplineScore,
        momentum: momentumLabel(user.disciplineScore),
        timezone: user.timezone,
        createdAt: user.createdAt,
        weeklyStats,
        triggerPatterns: store.listTriggers(userId).map((t) => ({
          id: t.id,
          type: t.type,
          frequency: t.frequency,
          lastSeen: t.lastSeen,
        })),
        logs: allLogs.slice(0, 30).map((l) => ({
          id: l.id,
          type: l.type,
          emotion: decryptField(l.emotion),
          trigger: decryptField(l.trigger),
          note: decryptField(l.note),
          intensity: l.intensity,
          timestamp: l.timestamp,
        })),
        dailyActivity: Object.entries(dailyActivity)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, stats]) => ({ date, ...stats })),
      });
    } catch (error) {
      logger.error("me.fetch.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
