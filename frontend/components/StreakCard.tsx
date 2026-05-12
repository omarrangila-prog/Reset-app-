"use client";
import { motion } from "framer-motion";
import { shareCard } from "../lib/shareCard";
import { Button } from "./Button";
import { useState } from "react";

interface StreakCardProps {
  streak: number;
  longestStreak: number;
  disciplineScore: number;
  onShare?: () => void;
}

export function StreakCard({
  streak,
  longestStreak,
  disciplineScore,
}: StreakCardProps) {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareCard({
        streakDays: streak,
        disciplineScore,
        event: "resisted an urge",
      });
    } catch (e) {
      console.error("Share failed:", e);
    } finally {
      setSharing(false);
    }
  };

  // Score color
  const scoreColor =
    disciplineScore >= 70
      ? "#1DB954"
      : disciplineScore >= 40
      ? "#F5A623"
      : "#FF3333";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        background: "linear-gradient(135deg, #051A0D 0%, #0D1F0D 50%, #051A0D 100%)",
        border: "1px solid rgba(29,185,84,0.3)",
        borderRadius: "var(--r-xl)",
        padding: "clamp(24px, 8vw, 32px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(29,185,84,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#1DB954",
          marginBottom: "8px",
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
          color: "#F2F2F0",
          marginBottom: "4px",
        }}
      >
        {streak}
      </motion.div>

      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(14px, 4.5vw, 18px)",
          color: "#8A8A8E",
          marginBottom: "24px",
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
          borderTop: "1px solid rgba(29,185,84,0.15)",
          marginBottom: "clamp(16px, 5vw, 24px)",
        }}
      >
        <StatItem label="Best Streak" value={`${longestStreak}d`} />
        <StatItem
          label="Discipline"
          value={`${disciplineScore}`}
          color={scoreColor}
          suffix="/100"
        />
      </div>

      {/* Share button */}
      <Button
        variant="secondary"
        size="sm"
        loading={sharing}
        onClick={handleShare}
        style={{ borderColor: "rgba(29,185,84,0.3)", color: "#1DB954" }}
      >
        Share this
      </Button>
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
          color: "#4A4A4E",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(20px, 7vw, 28px)",
          color: color || "#F2F2F0",
          lineHeight: 1,
        }}
      >
        {value}
        {suffix && (
          <span
            style={{ fontSize: "14px", color: "#8A8A8E", fontFamily: "var(--font-body)" }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
