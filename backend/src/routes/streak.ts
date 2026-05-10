import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const router = Router();

const UpdateStreakSchema = z.object({
  userId: z.string(),
  action: z.enum(["increment", "reset"]),
  reason: z.string().optional(),
});

// POST /api/streak/update
router.post("/update", async (req: Request, res: Response) => {
  try {
    const body = UpdateStreakSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (body.action === "increment") {
      const newStreak = user.streak + 1;
      const newLongest = Math.max(newStreak, user.longestStreak);
      const newScore = Math.min(
        100,
        user.disciplineScore + Math.ceil(newStreak / 7)
      );

      const updated = await prisma.user.update({
        where: { id: body.userId },
        data: {
          streak: newStreak,
          longestStreak: newLongest,
          disciplineScore: newScore,
        },
      });

      // Log success
      await prisma.log.create({
        data: {
          userId: body.userId,
          type: "SUCCESS",
          note: `Day ${newStreak} completed`,
        },
      });

      return res.json({
        streak: updated.streak,
        longestStreak: updated.longestStreak,
        disciplineScore: updated.disciplineScore,
        message: `Day ${newStreak} locked in.`,
      });
    }

    if (body.action === "reset") {
      // Log the relapse before reset
      await prisma.log.create({
        data: {
          userId: body.userId,
          type: "RELAPSE",
          note: body.reason || "Manual reset",
        },
      });

      const updated = await prisma.user.update({
        where: { id: body.userId },
        data: {
          streak: 0,
          totalRelapses: { increment: 1 },
          disciplineScore: Math.max(0, user.disciplineScore - 10),
        },
      });

      return res.json({
        streak: updated.streak,
        longestStreak: updated.longestStreak,
        disciplineScore: updated.disciplineScore,
        totalRelapses: updated.totalRelapses,
        message: "Streak reset. Start again. Every restart counts.",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Streak update error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
