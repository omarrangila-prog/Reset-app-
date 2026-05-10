import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

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

export async function POST(req: NextRequest) {
  try {
    const body = TriggerLogSchema.parse(await req.json());

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
      return NextResponse.json(updated);
    }

    const created = await prisma.triggerPattern.create({
      data: {
        userId: body.userId,
        type: body.triggerType as any,
        frequency: 1,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("Trigger log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
