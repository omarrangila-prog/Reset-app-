"use client";
import { motion, AnimatePresence } from "framer-motion";
import { BehavioralMode } from "../styles/designSystem";

interface CoachMessageProps {
  message: string;
  mode: BehavioralMode;
  actionSteps?: string[];
}

const modeColors: Record<BehavioralMode, string> = {
  URGE: "#FF3333",
  VULNERABILITY: "#F5A623",
  RECOVERY: "#1DB954",
};

const modeLabels: Record<BehavioralMode, string> = {
  URGE: "🔴 CRISIS RESPONSE",
  VULNERABILITY: "🟡 REDIRECT",
  RECOVERY: "🟢 REINFORCEMENT",
};

export function CoachMessage({ message, mode, actionSteps }: CoachMessageProps) {
  const accentColor = modeColors[mode];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message.slice(0, 20)}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Mode label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(10px, 3vw, 11px)",
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: accentColor,
            marginBottom: "16px",
            padding: "6px 12px",
            background: `${accentColor}18`,
            borderRadius: "var(--r-full)",
            border: `1px solid ${accentColor}33`,
          }}
        >
          {modeLabels[mode]}
        </motion.div>

        {/* Message */}
        <AnimatedText
          text={message}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: mode === "URGE" ? "clamp(18px, 6vw, 22px)" : "clamp(16px, 5vw, 18px)",
            lineHeight: 1.55,
            color: "#F2F2F0",
            fontWeight: mode === "URGE" ? 500 : 400,
            marginBottom: "24px",
          }}
        />

        {/* Action steps */}
        {actionSteps && actionSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(10px, 3vw, 11px)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#4A4A4E",
                marginBottom: "12px",
              }}
            >
              Action Steps
            </div>
            {actionSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: `${accentColor}22`,
                    border: `1px solid ${accentColor}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(8px, 2.5vw, 10px)",
                      fontWeight: 700,
                      color: accentColor,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {i + 1}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "clamp(14px, 4vw, 15px)",
                    color: "#8A8A8E",
                    lineHeight: 1.5,
                  }}
                >
                  {step}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function AnimatedText({ text, style }: { text: string; style: React.CSSProperties }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={style}
    >
      {text}
    </motion.p>
  );
}
