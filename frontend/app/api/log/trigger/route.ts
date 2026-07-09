import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/memoryStore";
import { withAuth } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rateLimit";
import { log as logger } from "@/lib/logger";

const TriggerLogSchema = z.object({
  triggerType: z.enum([
    "BOREDOM", "STRESS", "LONELINESS", "ANXIETY", "ANGER",
    "SADNESS", "LATE_NIGHT", "IDLE_TIME", "SOCIAL_REJECTION",
  ]),
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "write", LIMITS.write, userId);
    if (limited) return limited;
    try {
      const body = TriggerLogSchema.parse(await req.json());
      const pattern = store.upsertTrigger(userId, body.triggerType);
      return NextResponse.json(pattern, { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
      }
      logger.error("trigger.log.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
