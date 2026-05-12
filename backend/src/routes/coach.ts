import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import prisma from "../lib/prisma";
import {
  buildSystemPrompt,
  detectMode,
  parseActionSteps,
  UserContext,
  BehavioralMode,
} from "../../../ai/systemPrompt";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const InterventionSchema = z.object({
  userId: z.string(),
  message: z.string().min(1).max(1000),
  urgencyScore: z.number().min(1).max(10).default(5),
});

function getTimeOfDay(): UserContext["timeOfDay"] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "late_night";
}

// POST /api/coach/intervene
router.post("/intervene", async (req: Request, res: Response) => {
  try {
    const body = InterventionSchema.parse(req.body);

    // Load user context
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      include: {
        logs: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
        triggerPatterns: {
          orderBy: { frequency: "desc" },
          take: 3,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const recentTriggers = user.triggerPatterns.map((tp: { type: string }) =>
      tp.type.toLowerCase()
    );
    const lastRelapse = user.logs.find((l: { type: string; timestamp: Date }) =>
      l.type === "RELAPSE"
    );
    const lastRelapseDaysAgo = lastRelapse
      ? Math.floor(
          (Date.now() - lastRelapse.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        )
      : undefined;

    const context: UserContext = {
      streak: user.streak,
      totalRelapses: user.totalRelapses,
      disciplineScore: user.disciplineScore,
      recentTriggers,
      timeOfDay: getTimeOfDay(),
      lastRelapseDaysAgo,
    };

    // Detect behavioral mode
    const mode: BehavioralMode = detectMode(
      body.message,
      body.urgencyScore,
      context
    );

    // Build system prompt
    const systemPrompt = buildSystemPrompt(mode, context);

    // Call Claude API
    const claudeResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: body.message }],
    });

    const messageContent = claudeResponse.content[0];
    if (messageContent.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const responseText = messageContent.text;
    const actionSteps = parseActionSteps(responseText);

    // Log this session
    await prisma.session.create({
      data: {
        userId: body.userId,
        status: "ACTIVE",
        mode: mode as any,
      },
    });

    // Update last active
    await prisma.user.update({
      where: { id: body.userId },
      data: { lastActiveAt: new Date() },
    });

    return res.json({
      message: responseText,
      mode,
      actionSteps,
      urgencyScore: body.urgencyScore,
      context: {
        streak: user.streak,
        disciplineScore: user.disciplineScore,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input", details: error.errors });
    }
    console.error("Coach intervene error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
