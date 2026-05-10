import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const segments = req.nextUrl.pathname.split("/");
    const userId = segments[segments.length - 1];
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const type = url.searchParams.get("type") ?? undefined;

    const logs = await prisma.log.findMany({
      where: {
        userId,
        ...(type ? { type: type as any } : {}),
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Log fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
