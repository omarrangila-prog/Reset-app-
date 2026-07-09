import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/memoryStore";
import { withAuth } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rateLimit";
import { encrypt, decrypt } from "@/lib/crypto";
import { log as logger } from "@/lib/logger";

/** Persistent (in-memory), encrypted journal. Content is AES-256-GCM at rest. */
const CreateSchema = z.object({
  content: z.string().min(1).max(5000),
  mood: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "write", LIMITS.write, userId);
    if (limited) return limited;
    try {
      const body = CreateSchema.parse(await req.json());
      const entry = store.createJournal(userId, encrypt(body.content), body.mood ?? null);
      return NextResponse.json(
        { id: entry.id, content: body.content, mood: entry.mood, createdAt: entry.createdAt },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
      logger.error("journal.create.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "read", LIMITS.read, userId);
    if (limited) return limited;
    try {
      const url = new URL(req.url);
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "30")));
      const entries = store.listJournal(userId, limit);
      return NextResponse.json(
        entries.map((e) => ({
          id: e.id,
          content: decrypt(e.content) ?? "",
          mood: e.mood,
          createdAt: e.createdAt,
        }))
      );
    } catch (error) {
      logger.error("journal.fetch.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
