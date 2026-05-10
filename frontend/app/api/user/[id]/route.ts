import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const segments = req.nextUrl.pathname.split("/");
    const id = segments[segments.length - 1];

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { timestamp: "desc" },
          take: 30,
        },
        triggerPatterns: {
          orderBy: { frequency: "desc" },
        },
        sessions: {
          orderBy: { startedAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = user.logs.filter((l) => l.timestamp >= sevenDaysAgo);

    const weeklyStats = {
      urges: recentLogs.filter((l) => l.type === "URGE").length,
      relapses: recentLogs.filter((l) => l.type === "RELAPSE").length,
      successes: recentLogs.filter((l) => l.type === "SUCCESS").length,
    };

    return NextResponse.json({ ...user, weeklyStats });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
