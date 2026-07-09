"use client";
import { motion } from "framer-motion";
import { shareCard } from "../lib/shareCard";
import { Button } from "./Button";
import { useState } from "react";

interface StreakCardProps {
  streak: number;
  longestStreak: number;
  onShare?: () => void;
}

export function StreakCard({
  streak,
  longestStreak,
}: StreakCardProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareCard({
        streakDays: streak,
        event: "resisted an urge",
      });
    } catch (e) {
      console.error("Share failed:", e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mesh"
      style={{
        borderRadius: "var(--r-xl)",
        padding: "clamp(24px, 8vw, 32px)",
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-accent)",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.85)",
          marginBottom: "8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        Current Streak
      </div>

      {/* Main number */}
      <motion.div
        key={streak}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(60px, 20vw, 80px)",
          lineHeight: 0.9,
          color: "#FFFFFF",
          marginBottom: "4px",
          letterSpacing: "-0.03em",
          position: "relative",
          zIndex: 1,
          textShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {streak}
      </motion.div>

      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(14px, 4.5vw, 18px)",
          color: "rgba(255,255,255,0.85)",
          marginBottom: "24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {streak === 1 ? "day clean" : "days clean"}
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: "clamp(16px, 5vw, 24px)",
          paddingTop: "clamp(16px, 5vw, 24px)",
          borderTop: "1px solid rgba(255,255,255,0.18)",
          marginBottom: "clamp(16px, 5vw, 24px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <StatItem label="Best Streak" value={`${longestStreak}d`} />
      </div>

      {/* Share button */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Button
          variant="secondary"
          size="sm"
          loading={sharing}
          onClick={handleShare}
          style={{ borderColor: "rgba(255,255,255,0.4)", color: "#FFFFFF", background: "rgba(255,255,255,0.12)" }}
        >
          Share this
        </Button>
      </div>
    </motion.div>
  );
}

function StatItem({
  label,
  value,
  color,
  suffix,
}: {
  label: string;
  value: string;
  color?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(10px, 3vw, 11px)",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(20px, 7vw, 28px)",
          color: color || "#FFFFFF",
          lineHeight: 1,
        }}
      >
        {value}
        {suffix && (
          <span
            style={{ fontSize: "14px", color: "#8A93A6", fontFamily: "var(--font-body)" }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
