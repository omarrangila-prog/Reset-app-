"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { t } from "@/components/ui/theme";
import { api } from "@/lib/api";
import { haptic } from "@/lib/haptics";
import { useAppStore } from "@/lib/store";

/**
 * Mood Bubbles — the signature floating mood selector. Each mood is a soft glass
 * bubble that idly floats; tapping one promotes it to the center and logs it.
 */
const MOODS = [
  { key: "Happy", color: "#F0B24B", x: 12, y: 6 },
  { key: "Calm", color: "#5B7CFA", x: 60, y: 0 },
  { key: "Neutral", color: "#7C6BF0", x: 78, y: 22 },
  { key: "Anxious", color: "#EC6A5E", x: 6, y: 34 },
  { key: "Lonely", color: "#4FB6F5", x: 68, y: 44 },
  { key: "Angry", color: "#E5687C", x: 22, y: 54 },
  { key: "Tired", color: "#34C9A3", x: 50, y: 30 },
  { key: "Low", color: "#8A93A6", x: 40, y: 58 },
];

export default function MoodPage() {
  const reduced = useReducedMotion();
  const { userId } = useAppStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const pick = (mood: string) => {
    haptic("select");
    setSelected(mood);
    if (userId) api.createLog({ type: "CHECK_IN", emotion: mood }).catch(() => {});
  };

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Link href="/journey" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: t.shadowSm }}>‹</Link>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>How are you feeling?</div>
          <div style={{ fontSize: 12, color: t.muted }}>Tap the bubble that fits right now</div>
        </div>
      </header>

      {/* Bubble field */}
      <div style={{ position: "relative", height: 420, marginTop: 8 }}>
        {MOODS.map((m, i) => {
          const isSel = selected === m.key;
          const dim = selected && !isSel;
          const bubbleSize = isSel ? 132 : 82;
          return (
            <motion.button
              key={m.key}
              onClick={() => pick(m.key)}
              aria-label={m.key}
              aria-pressed={isSel}
              initial={false}
              animate={
                isSel
                  ? { left: "50%", top: "40%", x: "-50%", y: "-50%", scale: 1, opacity: 1 }
                  : { left: `${m.x}%`, top: `${m.y}%`, x: 0, y: reduced ? 0 : [0, -8, 0], scale: 1, opacity: dim ? 0.25 : 1 }
              }
              transition={
                isSel
                  ? { type: "spring", stiffness: 220, damping: 22 }
                  : { y: { duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.3 }, default: { type: "spring", stiffness: 200, damping: 24 } }
              }
              style={{
                position: "absolute",
                width: bubbleSize,
                height: bubbleSize,
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: `radial-gradient(circle at 34% 30%, rgba(255,255,255,0.95), ${m.color}cc 55%, ${m.color} 100%)`,
                boxShadow: `0 12px 30px ${m.color}55, inset 0 3px 12px rgba(255,255,255,0.6)`,
                color: "#fff",
                fontSize: isSel ? 17 : 13,
                fontWeight: 600,
                textShadow: "0 1px 4px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: isSel ? 5 : 1,
              }}
            >
              {m.key}
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 12 }}>
          <div style={{ textAlign: "center", fontSize: 14, color: t.sub, marginBottom: 14 }}>
            You&apos;re feeling <strong style={{ color: t.text }}>{selected.toLowerCase()}</strong>. Thank you for checking in.
          </div>
          <button
            onClick={save}
            style={{ width: "100%", padding: "16px", background: t.gradHero, border: "none", borderRadius: 16, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 52, boxShadow: t.shadowAccent }}
          >
            {saved ? "Saved ✓" : "Save how I feel"}
          </button>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}
