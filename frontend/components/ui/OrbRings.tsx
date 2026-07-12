"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AICoachOrb } from "@/components/ui/AICoachOrb";

/**
 * The Recovery Orb gains a glowing ring for each unlocked milestone. Rings
 * cycle accent hues and pulse gently; the orb sits at the center. Pure
 * CSS/SVG + Framer Motion, theme-aware, reduced-motion aware.
 */
const RING_COLORS = ["var(--accent-2)", "var(--accent)", "var(--sky)", "var(--mint)", "var(--vuln)", "var(--urge)"];

export function OrbRings({ rings, size = 150 }: { rings: number; size?: number }) {
  const reduced = useReducedMotion();
  const count = Math.max(0, Math.min(RING_COLORS.length, rings));

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {Array.from({ length: count }).map((_, i) => {
        const scale = 1 + (i + 1) * 0.24;
        const color = RING_COLORS[i % RING_COLORS.length];
        return (
          <motion.div
            key={i}
            aria-hidden
            initial={reduced ? { opacity: 0.5 } : { scale: 0.6, opacity: 0 }}
            animate={reduced
              ? { opacity: 0.5 }
              : { scale, opacity: [0.55, 0.28, 0.55] }}
            transition={reduced
              ? undefined
              : { scale: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 } }}
            style={{
              position: "absolute",
              width: size * 0.62,
              height: size * 0.62,
              borderRadius: "50%",
              border: `1.5px solid ${color}`,
              boxShadow: `0 0 16px ${color}`,
            }}
          />
        );
      })}
      <div style={{ position: "relative", zIndex: 1 }}>
        <AICoachOrb size={size * 0.5} state="idle" />
      </div>
    </div>
  );
}
