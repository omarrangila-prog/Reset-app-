"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Atmosphere (depth Level 0) — soft, slowly drifting colored light blooms far
 * behind all content. Gives every screen spatial depth without any image.
 * Fixed, non-interactive, very low contrast so text always stays readable.
 */
const BLOBS = [
  { size: 420, x: "-12%", y: "-8%", color: "rgba(124,107,240,0.20)", dur: 22 },
  { size: 360, x: "72%", y: "6%", color: "rgba(79,182,245,0.18)", dur: 26 },
  { size: 460, x: "40%", y: "78%", color: "rgba(52,201,163,0.14)", dur: 30 },
  { size: 300, x: "82%", y: "62%", color: "rgba(91,124,250,0.16)", dur: 24 },
];

export function Atmosphere() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color} 0%, transparent 68%)`,
            filter: "blur(20px)",
          }}
          animate={reduced ? undefined : { x: [0, 30, -20, 0], y: [0, -24, 18, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
