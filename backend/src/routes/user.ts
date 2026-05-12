import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const router = Router();

const CreateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
});

// POST /api/user - create or get user
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = CreateUserSchema.parse(req.body);

    let user;
    if (body.email) {
      user = await prisma.user.upsert({
        where: { email: body.email },
        update: { lastActiveAt: new Date() },
        create: {
          email: body.email,
          name: body.name,
        },
      });
    } else {
      user = await prisma.user.create({
        data: { name: body.name },
      });
    }

    return res.status(201).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input" });
    }
    console.error("User create error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/user/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
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

    if (!user) return res.status(404).json({ error: "User not found" });

    // Compute weekly analytics
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = user.logs.filter(
      (l: { timestamp: Date }) => l.timestamp >= sevenDaysAgo
    );

    const weeklyStats = {
      urges: recentLogs.filter((l: { type: string }) => l.type === "URGE").length,
      relapses: recentLogs.filter((l: { type: string }) => l.type === "RELAPSE").length,
      successes: recentLogs.filter((l: { type: string }) => l.type === "SUCCESS").length,
    };

    return res.json({ ...user, weeklyStats });
  } catch (error) {
    console.error("User fetch error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/user/:id/analytics
router.get("/:id/analytics", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      include: {
        logs: { orderBy: { timestamp: "asc" } },
        triggerPatterns: { orderBy: { frequency: "desc" } },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // Build daily activity for last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentLogs = user.logs.filter((l) => l.timestamp >= thirtyDaysAgo);

    const dailyActivity: Record<string, { urges: number; successes: number; relapses: number }> = {};
    recentLogs.forEach((log: { timestamp: Date; type: string }) => {
      const day = log.timestamp.toISOString().split("T")[0];
      if (!dailyActivity[day]) {
        dailyActivity[day] = { urges: 0, successes: 0, relapses: 0 };
      }
      if (log.type === "URGE") dailyActivity[day].urges++;
      if (log.type === "SUCCESS") dailyActivity[day].successes++;
      if (log.type === "RELAPSE") dailyActivity[day].relapses++;
    });

    return res.json({
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
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
