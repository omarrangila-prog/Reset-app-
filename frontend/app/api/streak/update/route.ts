import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/memoryStore";
import { withAuth } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rateLimit";
import { checkIn, relapse } from "@/lib/streak";
import { computeDisciplineScore } from "@/lib/recovery";
import { audit, log } from "@/lib/logger";

const UpdateStreakSchema = z.object({
  action: z.enum(["checkin", "relapse"]),
  reason: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "write", LIMITS.write, userId);
    if (limited) return limited;

    try {
      const body = UpdateStreakSchema.parse(await req.json());
      const user = store.getUser(userId);
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const now = new Date();

      if (body.action === "checkin") {
        const result = checkIn(
          {
            streak: user.streak,
            longestStreak: user.longestStreak,
            lastStreakDate: user.lastStreakDate,
            streakStartDate: user.streakStartDate,
          },
          now,
          user.timezone
        );

        if (result.alreadyCheckedInToday) {
          return NextResponse.json({
            streak: user.streak,
            longestStreak: user.longestStreak,
            disciplineScore: user.disciplineScore,
            alreadyCheckedInToday: true,
            message: "You've already checked in today. Rest easy.",
          });
        }

        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weeklyEngagement = store.countLogsSince(userId, weekAgo);
        const disciplineScore = computeDisciplineScore({
          currentStreak: result.streak,
          totalCheckIns: result.streak,
          weeklyEngagement,
        });

        const updated = store.updateUser(userId, {
          streak: result.streak,
          longestStreak: result.longestStreak,
          lastStreakDate: result.lastStreakDate,
          streakStartDate: result.streakStartDate,
          disciplineScore,
          lastActiveAt: now,
        })!;
        store.createLog({ userId, type: "SUCCESS", emotion: null, trigger: null, note: null, intensity: null });

        audit("streak.checkin", userId, { day: result.streak });
        return NextResponse.json({
          streak: updated.streak,
          longestStreak: updated.longestStreak,
          disciplineScore: updated.disciplineScore,
          message: `Day ${updated.streak} logged. You showed up.`,
        });
      }

      // action === "relapse" — reset streak with compassion, no score penalty.
      const reset = relapse({
        streak: user.streak,
        longestStreak: user.longestStreak,
        lastStreakDate: user.lastStreakDate,
        streakStartDate: user.streakStartDate,
      });
      const updated = store.updateUser(userId, {
        streak: reset.streak,
        lastStreakDate: reset.lastStreakDate,
        streakStartDate: reset.streakStartDate,
        totalRelapses: user.totalRelapses + 1,
        lastActiveAt: now,
      })!;
      store.createLog({ userId, type: "RELAPSE", emotion: null, trigger: null, note: null, intensity: null });

      audit("streak.relapse", userId);
      return NextResponse.json({
        streak: updated.streak,
        longestStreak: updated.longestStreak,
        disciplineScore: updated.disciplineScore,
        totalRelapses: updated.totalRelapses,
        message: "You came back — that's what matters. Day 1 starts now.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
      log.error("streak.update.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
