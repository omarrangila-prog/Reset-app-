"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface InterventionActionProps {
  mode: "URGE" | "VULNERABILITY" | "RECOVERY";
  onComplete?: () => void;
}

type InterventionAction = {
  label: string;
  instruction: string;
  duration?: number;
};

const urgeActions: InterventionAction[] = [
  { label: "STAND UP NOW", instruction: "Get off your device. Stand up immediately.", duration: 60 },
  { label: "COLD WATER", instruction: "Walk to your kitchen. Drink a full glass of cold water.", duration: 90 },
  { label: "20 PUSH-UPS", instruction: "Drop and do 20 push-ups. Floor. Now.", duration: 120 },
  { label: "GO OUTSIDE", instruction: "Walk outside. Even just to the hallway. Move.", duration: 180 },
];

const vulnerabilityActions: InterventionAction[] = [
  { label: "Name the feeling", instruction: "What emotion is underneath this? Boredom, loneliness, stress?" },
  { label: "Text someone real", instruction: "Message a friend. Not about this. Just connect." },
  { label: "Journal 3 lines", instruction: "Write: what triggered this, what you need, what you'll do instead." },
  { label: "5-4-3-2-1 grounding", instruction: "Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste." },
];

const recoveryActions: InterventionAction[] = [
  { label: "Log today's win", instruction: "You chose discipline today. That's identity-building. Log it." },
  { label: "Future self check", instruction: "Who are you becoming? Write one sentence about that person." },
  { label: "Set tomorrow's anchor", instruction: "Name one thing you'll do tomorrow morning that your future self would be proud of." },
];

export function InterventionAction({ mode, onComplete }: InterventionActionProps) {
  const [selectedAction, setSelectedAction] = useState<InterventionAction | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);

  const actions: InterventionAction[] =
    mode === "URGE"
      ? urgeActions
      : mode === "VULNERABILITY"
      ? vulnerabilityActions
      : recoveryActions;

  const accentColor =
    mode === "URGE" ? "#5B7CFA" : mode === "VULNERABILITY" ? "#5B7CFA" : "#2FBE6E";

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setTimerActive(false);
          setCompleted(true);
          onComplete?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, onComplete]);

  const handleAction = (action: (typeof urgeActions)[0]) => {
    setSelectedAction(action);
    if ("duration" in action && action.duration) {
      setTimeLeft(action.duration);
    }
  };

  const startTimer = () => {
    setTimerActive(true);
  };

  const progressPercent =
    selectedAction && "duration" in selectedAction && selectedAction.duration
      ? ((selectedAction.duration - timeLeft) / selectedAction.duration) * 100
      : 0;

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          textAlign: "center",
          padding: "clamp(24px, 8vw, 32px)",
          background: "rgba(47,190,110,0.08)",
          borderRadius: "var(--r-lg)",
          border: "1px solid rgba(47,190,110,0.2)",
        }}
      >
        <div style={{ fontSize: "clamp(32px, 10vw, 40px)", marginBottom: "12px" }}>✓</div>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(24px, 8vw, 32px)",
            color: "#2FBE6E",
            marginBottom: "8px",
          }}
        >
          URGE INTERRUPTED
        </div>
        <div style={{ color: "#8A93A6", fontSize: "clamp(14px, 4vw, 15px)" }}>
          The loop is broken. You chose differently.
        </div>
      </motion.div>
    );
  }

  if (selectedAction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: `${accentColor}0D`,
          border: `1px solid ${accentColor}33`,
          borderRadius: "var(--r-lg)",
          padding: "clamp(18px, 6vw, 24px)",
        }}
      >
        {/* Action label */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(20px, 6vw, 24px)",
            color: accentColor,
            marginBottom: "12px",
          }}
        >
          {selectedAction.label}
        </div>

        {/* Instruction */}
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(14px, 4.5vw, 16px)",
            color: "#1C2333",
            lineHeight: 1.6,
            marginBottom: "clamp(18px, 6vw, 24px)",
          }}
        >
          {selectedAction.instruction}
        </div>

        {/* Timer */}
        {"duration" in selectedAction && selectedAction.duration && (
          <div style={{ marginBottom: "16px" }}>
            {/* Progress bar */}
            <div
              style={{
                height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "var(--r-full)",
                marginBottom: "12px",
                overflow: "hidden",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  background: accentColor,
                  borderRadius: "var(--r-full)",
                }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Timer display */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#8A93A6", fontSize: "clamp(12px, 3.5vw, 13px)" }}>
                {timerActive ? `${timeLeft}s remaining` : "Ready to start"}
              </span>
              {!timerActive && (
                <button
                  onClick={startTimer}
                  style={{
                    background: accentColor,
                    color: mode === "URGE" ? "#1C2333" : "#FFFFFF",
                    border: "none",
                    borderRadius: "var(--r-md)",
                    padding: "clamp(6px, 2vw, 8px) clamp(12px, 4vw, 16px)",
                    fontSize: "clamp(12px, 3.5vw, 14px)",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  START TIMER
                </button>
              )}
            </div>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => { setSelectedAction(null); setTimerActive(false); setTimeLeft(0); }}
          style={{
            background: "transparent",
            border: "none",
            color: "#8A93A6",
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          ← Choose different action
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#8A93A6",
          marginBottom: "12px",
        }}
      >
        {mode === "URGE" ? "Do one of these. Right now." : "Choose your redirect"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {actions.map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 4 }}
            onClick={() => handleAction(action)}
            style={{
              background: "transparent",
              border: `1px solid ${accentColor}33`,
              borderRadius: "var(--r-md)",
              padding: "14px 16px",
              textAlign: "left",
              cursor: "pointer",
              color: "#1C2333",
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.15s ease",
            }}
          >
            <span>{action.label}</span>
            <span style={{ color: "#8A93A6" }}>→</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
