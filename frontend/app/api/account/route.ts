import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/memoryStore";
import { withAuth, SESSION_COOKIE_NAME } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rateLimit";
import { decryptField, decrypt } from "@/lib/crypto";
import { audit, log as logger } from "@/lib/logger";

/** GET /api/account/export — full data export (GDPR Art. 20). */
export async function GET(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "read", LIMITS.read, userId);
    if (limited) return limited;
    try {
      const user = store.getUser(userId);
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      audit("account.export", userId);
      const body = {
        exportedAt: new Date().toISOString(),
        profile: {
          id: user.id,
          streak: user.streak,
          longestStreak: user.longestStreak,
          totalUrges: user.totalUrges,
          totalRelapses: user.totalRelapses,
          disciplineScore: user.disciplineScore,
          timezone: user.timezone,
          createdAt: user.createdAt,
        },
        logs: store.listLogs(userId, { limit: 10000 }).map((l) => ({
          type: l.type,
          emotion: decryptField(l.emotion),
          trigger: decryptField(l.trigger),
          note: decryptField(l.note),
          intensity: l.intensity,
          timestamp: l.timestamp,
        })),
        journal: store.listJournal(userId, 10000).map((e) => ({
          content: decrypt(e.content) ?? "",
          mood: e.mood,
          createdAt: e.createdAt,
        })),
        triggerPatterns: store.listTriggers(userId).map((t) => ({
          type: t.type,
          frequency: t.frequency,
          lastSeen: t.lastSeen,
        })),
      };
      return new NextResponse(JSON.stringify(body, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="reset-data-export.json"',
        },
      });
    } catch (error) {
      logger.error("account.export.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}

/** DELETE /api/account — permanent deletion of all user data (GDPR Art. 17). */
export async function DELETE(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "write", LIMITS.write, userId);
    if (limited) return limited;
    try {
      store.deleteUser(userId);
      audit("account.delete", userId);
      const res = NextResponse.json({ ok: true, deleted: true });
      res.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
      return res;
    } catch (error) {
      logger.error("account.delete.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
