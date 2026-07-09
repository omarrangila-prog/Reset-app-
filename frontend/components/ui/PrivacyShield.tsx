"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * PrivacyShield — a soft frosted-glass shield with a lock, gently breathing.
 * Pure SVG + Framer Motion; VisionOS glass aesthetic.
 */
export function PrivacyShield({ size = 120 }: { size?: number }) {
  const reduced = useReducedMotion();
  return (
    <div style={{ width: size, height: size, position: "relative", margin: "0 auto" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-15%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,182,245,0.3) 0%, transparent 65%)",
          filter: "blur(6px)",
        }}
      />
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 110"
        animate={reduced ? undefined : { y: [0, -5, 0], scale: [1, 1.015, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "relative", filter: "drop-shadow(0 12px 26px rgba(91,124,250,0.32))" }}
      >
        <defs>
          <linearGradient id="shield-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="45%" stopColor="rgba(180,205,255,0.7)" />
            <stop offset="100%" stopColor="rgba(124,107,240,0.7)" />
          </linearGradient>
          <linearGradient id="shield-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(91,124,250,0.5)" />
          </linearGradient>
        </defs>
        {/* Shield body */}
        <path
          d="M50 8 L84 22 V52 C84 78 68 94 50 102 C32 94 16 78 16 52 V22 Z"
          fill="url(#shield-g)"
          stroke="url(#shield-rim)"
          strokeWidth="1.5"
        />
        {/* Inner sheen */}
        <path d="M50 14 L78 25 V40 C60 32 40 32 22 40 V25 Z" fill="rgba(255,255,255,0.35)" />
        {/* Lock */}
        <rect x="38" y="52" width="24" height="20" rx="5" fill="rgba(255,255,255,0.95)" />
        <path d="M42 52 V46 a8 8 0 0 1 16 0 V52" fill="none" stroke="rgba(124,107,240,0.9)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="60" r="3.2" fill="#7C6BF0" />
        <rect x="48.6" y="60" width="2.8" height="7" rx="1.4" fill="#7C6BF0" />
      </motion.svg>
    </div>
  );
}
