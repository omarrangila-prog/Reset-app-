import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const router = Router();

const CreateLogSchema = z.object({
  userId: z.string(),
  type: z.enum(["URGE", "RELAPSE", "SUCCESS", "CHECK_IN"]),
  emotion: z.string().optional(),
  trigger: z.string().optional(),
  note: z.string().optional(),
  intensity: z.number().min(1).max(10).optional(),
});

const TriggerLogSchema = z.object({
  userId: z.string(),
  triggerType: z.enum([
    "BOREDOM",
    "STRESS",
    "LONELINESS",
    "ANXIETY",
    "ANGER",
    "SADNESS",
    "LATE_NIGHT",
    "IDLE_TIME",
    "SOCIAL_REJECTION",
  ]),
});

// POST /api/log
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = CreateLogSchema.parse(req.body);

    const log = await prisma.log.create({
      data: {
        userId: body.userId,
        type: body.type as any,
        emotion: body.emotion,
        trigger: body.trigger,
        note: body.note,
        intensity: body.intensity,
      },
    });

    // Update user urge count if applicable
    if (body.type === "URGE") {
      await prisma.user.update({
        where: { id: body.userId },
        data: { totalUrges: { increment: 1 } },
      });
    }

    return res.status(201).json(log);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Log create error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/log/trigger
router.post("/trigger", async (req: Request, res: Response) => {
  try {
    const body = TriggerLogSchema.parse(req.body);

    const existing = await prisma.triggerPattern.findUnique({
      where: {
        userId_type: {
          userId: body.userId,
          type: body.triggerType as any,
        },
      },
    });

    if (existing) {
      const updated = await prisma.triggerPattern.update({
        where: { id: existing.id },
        data: { frequency: { increment: 1 }, lastSeen: new Date() },
      });
      return res.json(updated);
    }

    const created = await prisma.triggerPattern.create({
      data: {
        userId: body.userId,
        type: body.triggerType as any,
        frequency: 1,
      },
    });

    return res.status(201).json(created);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Trigger log error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/log/:userId
router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = "20", type } = req.query;

    const logs = await prisma.log.findMany({
      where: {
        userId,
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { timestamp: "desc" },
      take: parseInt(limit as string, 10),
    });

    return res.json(logs);
  } catch (error) {
    console.error("Log fetch error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
