"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * CalmSphere — a guided breathing sphere. Phase-synced 4-4-6 (inhale-hold-
 * exhale): the sphere expands on inhale, holds, contracts on exhale, while
 * ambient particles drift outward on inhale and inward on exhale.
 *
 * Self-managing timing via a single interval → no timer leaks. Reduced-motion
 * users get the phase text without the animation.
 */
type Phase = "inhale" | "hold" | "exhale";
const PHASES: { key: Phase; label: string; secs: number }[] = [
  { key: "inhale", label: "Breathe in", secs: 4 },
  { key: "hold", label: "Hold", secs: 4 },
  { key: "exhale", label: "Breathe out", secs: 6 },
];

export function CalmSphere({ size = 260 }: { size?: number }) {
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [count, setCount] = useState(PHASES[0].secs);
  const phase = PHASES[idx];

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        // advance phase
        setIdx((i) => {
          const next = (i + 1) % PHASES.length;
          setCount(PHASES[next].secs);
          return next;
        });
        return PHASES[(idx + 1) % PHASES.length].secs;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [idx]);

  const scale = phase.key === "inhale" ? 1.18 : phase.key === "hold" ? 1.18 : 0.82;
  const dur = phase.secs;

  return (
    <div style={{ width: size, height: size, position: "relative", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Drifting particles */}
      {!reduced &&
        [...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const out = phase.key === "inhale" ? size * 0.46 : size * 0.3;
          return (
            <motion.span
              key={i}
              aria-hidden
              style={{ position: "absolute", width: 5, height: 5, borderRadius: "50%", background: "rgba(124,107,240,0.6)" }}
              animate={{ x: Math.cos(angle) * out, y: Math.sin(angle) * out, opacity: phase.key === "hold" ? 0.3 : 0.7 }}
              transition={{ duration: dur, ease: "easeInOut" }}
            />
          );
        })}

      {/* Concentric glow rings */}
      {[1, 0.74, 0.5].map((s, i) => (
        <motion.div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            width: size * s,
            height: size * s,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(91,124,250,${0.12 - i * 0.03}) 0%, transparent 70%)`,
            border: `1px solid rgba(124,107,240,${0.26 - i * 0.07})`,
          }}
          animate={reduced ? undefined : { scale }}
          transition={{ duration: dur, ease: "easeInOut" }}
        />
      ))}

      {/* Core orb */}
      <motion.div
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #8AA6FF 0%, #6E8CFB 45%, #7C6BF0 100%)",
          boxShadow: "0 12px 44px rgba(91,124,250,0.45), inset 0 2px 10px rgba(255,255,255,0.55)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
        animate={reduced ? undefined : { scale }}
        transition={{ duration: dur, ease: "easeInOut" }}
      >
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.2)" }}>{phase.label}</div>
        <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 2 }}>{count}s</div>
      </motion.div>
    </div>
  );
}
