import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const CreateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = CreateUserSchema.parse(await req.json());

    const user = body.email
      ? await prisma.user.upsert({
          where: { email: body.email },
          update: { lastActiveAt: new Date() },
          create: {
            email: body.email,
            name: body.name,
          },
        })
      : await prisma.user.create({
          data: { name: body.name },
        });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("User create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
