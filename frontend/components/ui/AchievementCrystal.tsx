"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * AchievementCrystal — a faceted glass gem that slowly rotates with an inner
 * light burst on unlock. Pure SVG + Framer Motion (no 3D deps).
 */
export function AchievementCrystal({
  size = 120,
  unlocked = true,
}: {
  size?: number;
  unlocked?: boolean;
}) {
  const reduced = useReducedMotion();
  const dim = unlocked ? 1 : 0.4;

  return (
    <div style={{ width: size, height: size, position: "relative", margin: "0 auto" }}>
      {/* Glow / light burst */}
      {unlocked && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-20%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,107,240,0.4) 0%, transparent 65%)",
            filter: "blur(6px)",
          }}
        />
      )}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        animate={reduced || !unlocked ? undefined : { rotate: [0, 4, 0, -4, 0], y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "relative", opacity: dim, filter: unlocked ? "drop-shadow(0 10px 24px rgba(91,124,250,0.4))" : "grayscale(0.6)" }}
      >
        <defs>
          <linearGradient id="crys-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EAF0FF" />
            <stop offset="50%" stopColor="#8AA6FF" />
            <stop offset="100%" stopColor="#7C6BF0" />
          </linearGradient>
          <linearGradient id="crys-b" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B9C7FF" />
            <stop offset="100%" stopColor="#5B7CFA" />
          </linearGradient>
          <linearGradient id="crys-c" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B7BF2" />
            <stop offset="100%" stopColor="#6E8CFB" />
          </linearGradient>
        </defs>
        {/* Gem facets */}
        <polygon points="50,6 74,32 50,44 26,32" fill="url(#crys-a)" />
        <polygon points="26,32 50,44 40,66 22,44" fill="url(#crys-b)" />
        <polygon points="74,32 78,44 60,66 50,44" fill="url(#crys-c)" />
        <polygon points="22,44 40,66 50,92 34,60" fill="url(#crys-b)" opacity="0.92" />
        <polygon points="78,44 66,60 50,92 60,66" fill="url(#crys-c)" opacity="0.92" />
        <polygon points="40,66 60,66 50,92" fill="#EAF0FF" opacity="0.85" />
        {/* Specular */}
        <polygon points="50,10 66,30 50,40 38,30" fill="rgba(255,255,255,0.55)" />
      </motion.svg>
    </div>
  );
}
