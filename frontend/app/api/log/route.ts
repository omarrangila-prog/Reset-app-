import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const CreateLogSchema = z.object({
  userId: z.string(),
  type: z.enum(["URGE", "RELAPSE", "SUCCESS", "CHECK_IN"]),
  emotion: z.string().optional(),
  trigger: z.string().optional(),
  note: z.string().optional(),
  intensity: z.number().min(1).max(10).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = CreateLogSchema.parse(await req.json());

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

    if (body.type === "URGE") {
      await prisma.user.update({
        where: { id: body.userId },
        data: { totalUrges: { increment: 1 } },
      });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("Log create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
