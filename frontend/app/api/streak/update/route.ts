import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const UpdateStreakSchema = z.object({
  userId: z.string(),
  action: z.enum(["increment", "reset"]),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = UpdateStreakSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (body.action === "increment") {
      const newStreak = user.streak + 1;
      const newLongest = Math.max(newStreak, user.longestStreak);
      const newScore = Math.min(100, user.disciplineScore + Math.ceil(newStreak / 7));

      const updated = await prisma.user.update({
        where: { id: body.userId },
        data: {
          streak: newStreak,
          longestStreak: newLongest,
          disciplineScore: newScore,
        },
      });

      await prisma.log.create({
        data: {
          userId: body.userId,
          type: "SUCCESS",
          note: `Day ${newStreak} completed`,
        },
      });

      return NextResponse.json({
        streak: updated.streak,
        longestStreak: updated.longestStreak,
        disciplineScore: updated.disciplineScore,
        message: `Day ${newStreak} locked in.`,
      });
    }

    if (body.action === "reset") {
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

      return NextResponse.json({
        streak: updated.streak,
        longestStreak: updated.longestStreak,
        disciplineScore: updated.disciplineScore,
        totalRelapses: updated.totalRelapses,
        message: "Streak reset. Start again. Every restart counts.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("Streak update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
