import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = segments[segments.length - 2];

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        logs: { orderBy: { timestamp: "asc" } },
        triggerPatterns: { orderBy: { frequency: "desc" } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentLogs = user.logs.filter((l) => l.timestamp >= thirtyDaysAgo);
    const dailyActivity: Record<string, { urges: number; successes: number; relapses: number }> = {};

    recentLogs.forEach((log) => {
      const day = log.timestamp.toISOString().split("T")[0];
      if (!dailyActivity[day]) {
        dailyActivity[day] = { urges: 0, successes: 0, relapses: 0 };
      }
      if (log.type === "URGE") dailyActivity[day].urges++;
      if (log.type === "SUCCESS") dailyActivity[day].successes++;
      if (log.type === "RELAPSE") dailyActivity[day].relapses++;
    });

    return NextResponse.json({
      streak: user.streak,
      longestStreak: user.longestStreak,
      disciplineScore: user.disciplineScore,
      totalUrges: user.totalUrges,
      totalRelapses: user.totalRelapses,
      triggerPatterns: user.triggerPatterns,
      dailyActivity: Object.entries(dailyActivity).map(([date, stats]) => ({
        date,
        ...stats,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
