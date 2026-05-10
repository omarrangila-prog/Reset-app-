import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  BehavioralMode,
  UserContext,
  buildSystemPrompt,
  detectMode,
  parseActionSteps,
} from "@/ai/systemPrompt";

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

export async function POST(req: NextRequest) {
  try {
    const body = InterventionSchema.parse(await req.json());

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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recentTriggers = user.triggerPatterns.map((tp) => tp.type.toLowerCase());
    const lastRelapse = user.logs.find((l) => l.type === "RELAPSE");
    const lastRelapseDaysAgo = lastRelapse
      ? Math.floor((Date.now() - lastRelapse.timestamp.getTime()) / (1000 * 60 * 60 * 24))
      : undefined;

    const context: UserContext = {
      streak: user.streak,
      totalRelapses: user.totalRelapses,
      disciplineScore: user.disciplineScore,
      recentTriggers,
      timeOfDay: getTimeOfDay(),
      lastRelapseDaysAgo,
    };

    const mode: BehavioralMode = detectMode(body.message, body.urgencyScore, context);
    const systemPrompt = buildSystemPrompt(mode, context);

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

    await prisma.session.create({
      data: {
        userId: body.userId,
        status: "ACTIVE",
        mode: mode as any,
      },
    });

    await prisma.user.update({
      where: { id: body.userId },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({
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
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Coach intervene error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
