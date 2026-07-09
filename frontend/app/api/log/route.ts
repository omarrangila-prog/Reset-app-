import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/memoryStore";
import { withAuth } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rateLimit";
import { encryptField, decryptField } from "@/lib/crypto";
import { log as logger } from "@/lib/logger";

const CreateLogSchema = z.object({
  type: z.enum(["URGE", "RELAPSE", "SUCCESS", "CHECK_IN"]),
  emotion: z.string().max(200).optional(),
  trigger: z.string().max(200).optional(),
  note: z.string().max(2000).optional(),
  intensity: z.number().int().min(1).max(10).optional(),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "write", LIMITS.write, userId);
    if (limited) return limited;
    try {
      const body = CreateLogSchema.parse(await req.json());

      const created = store.createLog({
        userId,
        type: body.type,
        emotion: encryptField(body.emotion),
        trigger: encryptField(body.trigger),
        note: encryptField(body.note),
        intensity: body.intensity ?? null,
      });
      if (body.type === "URGE") {
        const u = store.getUser(userId);
        if (u) store.updateUser(userId, { totalUrges: u.totalUrges + 1 });
      }

      return NextResponse.json(
        {
          id: created.id,
          type: created.type,
          emotion: decryptField(created.emotion),
          trigger: decryptField(created.trigger),
          note: decryptField(created.note),
          intensity: created.intensity,
          timestamp: created.timestamp,
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
      }
      logger.error("log.create.error", { type: (error as Error).name });
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
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "20")));
      const typeParam = url.searchParams.get("type");
      const validTypes = ["URGE", "RELAPSE", "SUCCESS", "CHECK_IN"];
      const type = typeParam && validTypes.includes(typeParam) ? (typeParam as any) : undefined;

      const logs = store.listLogs(userId, { type, limit });
      return NextResponse.json(
        logs.map((l) => ({
          id: l.id,
          type: l.type,
          emotion: decryptField(l.emotion),
          trigger: decryptField(l.trigger),
          note: decryptField(l.note),
          intensity: l.intensity,
          timestamp: l.timestamp,
        }))
      );
    } catch (error) {
      logger.error("log.fetch.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
