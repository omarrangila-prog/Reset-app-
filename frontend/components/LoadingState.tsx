"use client";
import { motion } from "framer-motion";

interface LoadingStateProps {
  message?: string;
  mode?: "URGE" | "VULNERABILITY" | "RECOVERY";
  size?: "sm" | "md" | "lg";
}

const modeColors = {
  URGE: "#FF3333",
  VULNERABILITY: "#F5A623",
  RECOVERY: "#1DB954",
};

export function LoadingState({
  message = "Processing...",
  mode = "RECOVERY",
  size = "md",
}: LoadingStateProps) {
  const color = modeColors[mode];
  const dotSize = size === "sm" ? 6 : size === "md" ? 8 : 10;
  const gap = size === "sm" ? 6 : size === "md" ? 8 : 10;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: size === "lg" ? "48px 24px" : "24px",
      }}
    >
      {/* Dots animation */}
      <div style={{ display: "flex", gap: `${gap}px`, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: color,
            }}
          />
        ))}
      </div>

      {/* Message */}
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: size === "sm" ? "13px" : "15px",
            color: "#8A8A8E",
            textAlign: "center",
          }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}

export function FullPageLoading({ message }: { message?: string }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0A0A0B",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <LoadingState message={message || "Loading RESET..."} size="lg" />
    </div>
  );
}
