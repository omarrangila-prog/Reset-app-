import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { store } from "@/lib/memoryStore";
import { withAuth } from "@/lib/auth";
import { enforceRateLimit, LIMITS } from "@/lib/rateLimit";
import {
  BehavioralMode,
  UserContext,
  buildSystemPrompt,
  detectMode,
  parseActionSteps,
} from "@/ai/systemPrompt";
import { detectCrisis, wrapUserMessage } from "@/lib/aiSafety";
import { callGroq } from "@/lib/groq";
import { audit, log as logger } from "@/lib/logger";

const InterventionSchema = z.object({
  message: z.string().min(1).max(1000),
  urgencyScore: z.number().int().min(1).max(10).default(5),
  // Recent turns for a natural back-and-forth (voice conversation mode).
  history: z
    .array(z.object({ role: z.enum(["you", "coach"]), text: z.string().max(1000) }))
    .max(12)
    .optional(),
  // When true, the coach is speaking aloud — keep replies short and
  // conversational, and end with a gentle follow-up question when it helps.
  voice: z.boolean().optional(),
});

function getTimeOfDay(): UserContext["timeOfDay"] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "late_night";
}

// Deterministic, safe fallback when no AI is available (no key / error).
function fallbackResponse(mode: BehavioralMode, streak: number) {
  const byMode: Record<BehavioralMode, string> = {
    URGE:
      "Stand up right now and change rooms. Drink a full glass of cold water. This urge peaks and passes — set a 90-second timer and just breathe until it rings.",
    VULNERABILITY:
      "This feeling is a signal, not a command. Name what you actually need — rest, connection, or a break — and take one small step toward it. You don't have to fix everything right now.",
    RECOVERY:
      "You're building something real, one day at a time. Notice one thing that went right today and let that be enough. Steady is how this works.",
  };
  return {
    message: byMode[mode],
    mode,
    actionSteps: parseActionSteps(byMode[mode]),
    context: { streak },
    fallback: true as const,
  };
}

export async function POST(req: NextRequest) {
  return withAuth(req, async (userId) => {
    const limited = enforceRateLimit(req, "coach", LIMITS.coach, userId);
    if (limited) return limited;

    try {
      const body = InterventionSchema.parse(await req.json());

      // 1) SAFETY FIRST — screen for crisis before any coaching.
      const crisis = detectCrisis(body.message);
      if (crisis.isCrisis) {
        audit("coach.crisis_detected", userId, { category: crisis.category });
        return NextResponse.json({
          message: crisis.response,
          mode: "CRISIS",
          actionSteps: [],
          crisis: true,
          resources: [
            { label: "988 Suicide & Crisis Lifeline", value: "Call or text 988", href: "tel:988" },
            { label: "Crisis Text Line", value: "Text HOME to 741741", href: "sms:741741" },
            { label: "Emergency", value: "Call 911", href: "tel:911" },
          ],
          context: { streak: 0 },
        });
      }

      const user = store.getUser(userId);
      if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const recentLogs = store.listLogs(userId, { limit: 10 });
      const lastRelapse = recentLogs.find((l) => l.type === "RELAPSE");
      const context: UserContext = {
        streak: user.streak,
        totalRelapses: user.totalRelapses,
        disciplineScore: user.disciplineScore,
        recentTriggers: store.listTriggers(userId).slice(0, 3).map((t) => t.type.toLowerCase()),
        timeOfDay: getTimeOfDay(),
        lastRelapseDaysAgo: lastRelapse
          ? Math.floor((Date.now() - lastRelapse.timestamp.getTime()) / (1000 * 60 * 60 * 24))
          : undefined,
      };

      const mode = detectMode(body.message, body.urgencyScore, context);
      let systemPrompt = buildSystemPrompt(mode, context);
      if (body.voice) {
        // Voice conversation: shorter, spoken, therapist-like with follow-ups.
        systemPrompt +=
          "\n\nVOICE CONVERSATION MODE: You are speaking aloud in a live back-and-forth. " +
          "Keep replies to 1–3 short sentences that sound natural spoken. When it helps the " +
          "person open up, end with ONE gentle follow-up question. Never read lists or headings aloud.";
      }

      // Prepend recent conversation turns so replies stay coherent across the exchange.
      const convo = (body.history ?? [])
        .map((h) => `${h.role === "you" ? "User" : "Coach"}: ${h.text}`)
        .join("\n");
      const userContent = convo
        ? `${convo}\nUser: ${wrapUserMessage(body.message)}`
        : wrapUserMessage(body.message);

      // 2) Try the free Groq API; fall back to safe scripted response on any issue.
      let responseText: string | null = null;
      try {
        responseText = await callGroq(systemPrompt, userContent);
      } catch (aiError) {
        logger.warn("coach.ai_fallback", { type: (aiError as Error).name });
      }

      store.createSession(userId, mode);
      store.updateUser(userId, { lastActiveAt: new Date() });

      if (!responseText || !responseText.trim()) {
        return NextResponse.json(fallbackResponse(mode, user.streak));
      }

      return NextResponse.json({
        message: responseText,
        mode,
        actionSteps: parseActionSteps(responseText),
        urgencyScore: body.urgencyScore,
        context: { streak: user.streak, disciplineScore: user.disciplineScore },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
      }
      logger.error("coach.intervene.error", { type: (error as Error).name });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
