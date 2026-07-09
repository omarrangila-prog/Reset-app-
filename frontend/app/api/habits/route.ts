import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/memoryStore";
import { withAuth } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rateLimit";
import { localDayString } from "@/lib/streak";
import { log as logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET /api/habits — the user's habits (seeds a starter set on first visit).
export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "read", LIMITS.read, userId);
    if (limited) return limited;
    try {
      const user = store.getUser(userId);
      const tz = user?.timezone ?? "UTC";
      const today = localDayString(new Date(), tz);
      const habits = store.seedHabitsIfEmpty(userId);
      return NextResponse.json(
        habits.map((h) => ({
          id: h.id,
          name: h.name,
          icon: h.icon,
          accent: h.accent,
          streak: h.streak,
          doneToday: h.lastDoneDate === today,
        }))
      );
    } catch (error) {
      logger.error("habits.list.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().max(24).optional(),
  accent: z.string().max(16).optional(),
});

// POST /api/habits — create a new habit.
export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "write", LIMITS.write, userId);
    if (limited) return limited;
    try {
      const body = CreateSchema.parse(await req.json());
      const h = store.createHabit(userId, body.name, body.icon ?? "spark", body.accent ?? "#5B7CFA");
      return NextResponse.json({ id: h.id, name: h.name, icon: h.icon, accent: h.accent, streak: 0, doneToday: false }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      logger.error("habits.create.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

const ToggleSchema = z.object({ id: z.string().min(1).max(80) });

// PATCH /api/habits — toggle a habit's completion for today.
export async function PATCH(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "write", LIMITS.write, userId);
    if (limited) return limited;
    try {
      const body = ToggleSchema.parse(await req.json());
      const user = store.getUser(userId);
      const today = localDayString(new Date(), user?.timezone ?? "UTC");
      const h = store.toggleHabit(userId, body.id, today);
      if (!h) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ id: h.id, name: h.name, icon: h.icon, accent: h.accent, streak: h.streak, doneToday: h.lastDoneDate === today });
    } catch (error) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      logger.error("habits.toggle.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
