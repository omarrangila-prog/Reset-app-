"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Atmosphere (depth Level 0) — soft, slowly drifting colored light blooms far
 * behind all content. Now a LIVING background: it subtly shifts palette and
 * intensity with the user's recovery mood (calm / difficult / progress), read
 * from the `data-mood` attribute on <html> (set by setMood). The user should
 * barely notice it — but feel it. Fixed, non-interactive, low-contrast.
 */
export type Mood = "calm" | "difficult" | "progress";

export function setMood(mood: Mood) {
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-mood", mood);
}

const PALETTES: Record<Mood, { color: string; dur: number }[]> = {
  calm: [
    { color: "rgba(124,107,240,0.20)", dur: 22 },
    { color: "rgba(79,182,245,0.18)", dur: 26 },
    { color: "rgba(52,201,163,0.14)", dur: 30 },
    { color: "rgba(91,124,250,0.16)", dur: 24 },
  ],
  difficult: [
    { color: "rgba(240,107,168,0.16)", dur: 30 },
    { color: "rgba(124,107,240,0.16)", dur: 34 },
    { color: "rgba(236,106,94,0.12)", dur: 32 },
    { color: "rgba(91,124,250,0.12)", dur: 28 },
  ],
  progress: [
    { color: "rgba(124,107,240,0.24)", dur: 20 },
    { color: "rgba(240,178,75,0.16)", dur: 22 },
    { color: "rgba(52,201,163,0.18)", dur: 26 },
    { color: "rgba(79,182,245,0.20)", dur: 22 },
  ],
};

const POS = [
  { size: 420, x: "-12%", y: "-8%" },
  { size: 360, x: "72%", y: "6%" },
  { size: 460, x: "40%", y: "78%" },
  { size: 300, x: "82%", y: "62%" },
];

export function Atmosphere() {
  const reduced = useReducedMotion();
  const [mood, setLocalMood] = useState<Mood>("calm");

  useEffect(() => {
    const read = () => setLocalMood((document.documentElement.getAttribute("data-mood") as Mood) || "calm");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mood"] });
    return () => obs.disconnect();
  }, []);

  const palette = PALETTES[mood];

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {POS.map((p, i) => (
        <motion.div
          key={i}
          style={{ position: "absolute", left: p.x, top: p.y, width: p.size, height: p.size, borderRadius: "50%", filter: "blur(20px)" }}
          animate={reduced
            ? { background: `radial-gradient(circle, ${palette[i].color} 0%, transparent 68%)` }
            : { x: [0, 30, -20, 0], y: [0, -24, 18, 0], scale: [1, 1.08, 0.96, 1], background: `radial-gradient(circle, ${palette[i].color} 0%, transparent 68%)` }}
          transition={{
            x: { duration: palette[i].dur, repeat: Infinity, ease: "easeInOut" },
            y: { duration: palette[i].dur, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: palette[i].dur, repeat: Infinity, ease: "easeInOut" },
            background: { duration: 2.5, ease: "easeInOut" }, // slow, barely-noticed palette morph
          }}
        />
      ))}
    </div>
  );
}
