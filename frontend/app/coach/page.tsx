"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { useAppStore } from "../../lib/store";
import { api, InterventionResponse } from "../../lib/api";
import { CoachMessage } from "../../components/CoachMessage";
import { InterventionAction } from "../../components/InterventionAction";
import { LoadingState } from "../../components/LoadingState";
import { Button } from "../../components/Button";
import Link from "next/link";

type Mode = "URGE" | "VULNERABILITY" | "RECOVERY";

const modeConfig = {
  URGE: {
    bg: "#0D0303",
    accent: "#FF3333",
    label: "CRISIS MODE",
    placeholder: "What's happening right now?",
    defaultMessage: "I feel an urge and I need help right now",
  },
  VULNERABILITY: {
    bg: "#0D0D03",
    accent: "#F5A623",
    label: "VULNERABILITY",
    placeholder: "What are you feeling right now?",
    defaultMessage: "I'm feeling vulnerable and need support",
  },
  RECOVERY: {
    bg: "#030D06",
    accent: "#1DB954",
    label: "RECOVERY",
    placeholder: "How are you doing today?",
    defaultMessage: "I want to check in on my progress",
  },
};

function CoachPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, user, setUser } = useAppStore();

  const initialMode = (searchParams.get("mode") as Mode) || "RECOVERY";
  const initialUrgency = parseInt(searchParams.get("urgency") || "5", 10);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [message, setMessage] = useState("");
  const [urgencyScore, setUrgencyScore] = useState(initialUrgency);
  const [response, setResponse] = useState<InterventionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoSent, setAutoSent] = useState(false);

  const config = modeConfig[mode];
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-send for urge mode
  useEffect(() => {
    if (initialMode === "URGE" && !autoSent) {
      setAutoSent(true);
      setTimeout(() => {
        sendMessage(modeConfig.URGE.defaultMessage, "URGE", initialUrgency);
      }, 300);
    }
  }, [initialMode]);

  useEffect(() => {
    if (inputRef.current && initialMode !== "URGE") {
      inputRef.current.focus();
    }
  }, []);

  const sendMessage = async (
    msg: string,
    overrideMode?: Mode,
    overrideUrgency?: number
  ) => {
    const finalMessage = msg || message || config.defaultMessage;
    const finalMode = overrideMode || mode;
    const finalUrgency = overrideUrgency ?? urgencyScore;

    if (!finalMessage.trim()) return;
    setLoading(true);
    setError("");

    try {
      const effectiveUserId = userId || "demo-user";
      const result = await api.intervene(
        effectiveUserId,
        finalMessage,
        finalUrgency
      );

      setResponse(result);
      setMode(result.mode as Mode);

      // Log the interaction
      if (userId) {
        await api.createLog({
          userId,
          type: "URGE",
          note: finalMessage,
          intensity: finalUrgency,
        });
      }
    } catch (e) {
      // Demo fallback when API is unavailable
      const demoResponse = getDemoResponse(finalMode, finalUrgency);
      setResponse(demoResponse);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: config.bg,
        transition: "background 0.6s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Mode-colored top bar */}
      <div
        style={{
          height: "3px",
          background: config.accent,
          transition: "background 0.4s ease",
        }}
      />

      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            color: "#4A4A4E",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ← Back
        </Link>

        {/* Mode switcher */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "rgba(255,255,255,0.05)",
            borderRadius: "var(--r-full)",
            padding: "4px",
          }}
        >
          {(["URGE", "VULNERABILITY", "RECOVERY"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setResponse(null);
              }}
              style={{
                background: mode === m ? modeConfig[m].accent : "transparent",
                border: "none",
                borderRadius: "var(--r-full)",
                padding: "6px 12px",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                cursor: "pointer",
                color: mode === m ? "#0A0A0B" : "#4A4A4E",
                fontFamily: "var(--font-body)",
                transition: "all 0.2s ease",
              }}
            >
              {m.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Streak indicator */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "#4A4A4E",
          }}
        >
          <span style={{ color: config.accent }}>{user?.streak || 0}</span>d
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          padding: "32px 24px",
          maxWidth: "680px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Mode label */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "13px",
            letterSpacing: "0.15em",
            color: config.accent,
            marginBottom: "32px",
          }}
        >
          {config.label}
        </motion.div>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingState
                message={
                  mode === "URGE"
                    ? "Interrupting the loop..."
                    : mode === "VULNERABILITY"
                    ? "Redirecting..."
                    : "Loading your coach..."
                }
                mode={mode}
                size="lg"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response */}
        <AnimatePresence>
          {!loading && response && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginBottom: "32px" }}
            >
              <CoachMessage
                message={response.message}
                mode={response.mode as Mode}
                actionSteps={response.actionSteps}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intervention actions */}
        <AnimatePresence>
          {!loading && response && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ marginBottom: "32px" }}
            >
              <InterventionAction
                mode={response.mode as Mode}
                onComplete={() => {
                  if (userId) {
                    api.createLog({
                      userId,
                      type: "SUCCESS",
                      note: "Completed intervention action",
                    });
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        {(!response || !loading) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: response ? 0.6 : 0.2 }}
          >
            {response && (
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  color: "#4A4A4E",
                  marginBottom: "12px",
                }}
              >
                Continue the conversation
              </div>
            )}

            {/* Urgency slider for URGE mode */}
            {mode === "URGE" && !response && (
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "12px",
                      color: "#8A8A8E",
                    }}
                  >
                    Urge intensity
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                      color: "#FF3333",
                    }}
                  >
                    {urgencyScore}/10
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={urgencyScore}
                  onChange={(e) => setUrgencyScore(parseInt(e.target.value, 10))}
                  style={{ width: "100%", accentColor: "#FF3333" }}
                />
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(message);
                  }
                }}
                placeholder={config.placeholder}
                rows={3}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${config.accent}33`,
                  borderRadius: "var(--r-lg)",
                  padding: "16px",
                  color: "#F2F2F0",
                  fontFamily: "var(--font-body)",
                  fontSize: "15px",
                  resize: "none",
                  outline: "none",
                  lineHeight: 1.6,
                  transition: "border-color 0.2s",
                }}
              />

              {error && (
                <p style={{ color: "#FF3333", fontSize: "13px" }}>{error}</p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                {response && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setResponse(null);
                      setMessage("");
                    }}
                  >
                    New session
                  </Button>
                )}
                <Button
                  variant={mode === "URGE" ? "urge" : "primary"}
                  size="md"
                  loading={loading}
                  onClick={() => sendMessage(message)}
                >
                  {mode === "URGE" ? "INTERVENE NOW" : "Send"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// Demo fallback when API is unavailable
function getDemoResponse(mode: Mode, urgency: number): InterventionResponse {
  const responses = {
    URGE: {
      message:
        "Stand up right now. Don't think — move. Walk to your kitchen and drink a full glass of cold water. You've already recognized the urge, which means you're already halfway out of it. Set a timer for 90 seconds and do 20 push-ups. The urge peaks and passes. Move.",
      actionSteps: [
        "Stand up immediately",
        "Drink cold water",
        "20 push-ups — start now",
      ],
    },
    VULNERABILITY: {
      message:
        "There's something underneath this feeling that isn't about the urge itself. Loneliness needs connection, not a screen. Boredom needs stimulation, not numbing. Stress needs release, not escape. Name what you actually need right now and choose one real action toward it.",
      actionSteps: [
        "Name the actual emotion",
        "Text one real person",
        "Do one physical thing",
      ],
    },
    RECOVERY: {
      message:
        "You're building something. Every day you choose differently, you're rewriting what's automatic. Your streak isn't just a number — it's evidence that you're someone who does this. Someone who keeps choosing. That's not discipline you're practicing. That's identity you're building.",
      actionSteps: [
        "Log today as a win",
        "Name one thing you're gaining",
        "Set tomorrow's first action",
      ],
    },
  };

  const r = responses[mode];
  return {
    message: r.message,
    mode,
    actionSteps: r.actionSteps,
    urgencyScore: urgency,
    context: { streak: 0, disciplineScore: 0 },
  };
}

export default function CoachPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0B" }} />}>
      <CoachPageInner />
    </Suspense>
  );
}
