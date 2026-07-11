"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * RecoveryOrb — the hero. A living liquid-crystal sphere: it breathes, with
 * internal light that drifts and a moving specular highlight, grounded by a
 * soft contact shadow on the surface beneath it. Pure CSS/SVG + Framer Motion.
 *
 * Deliberately has NO number inside and NO orbiting particles — status is read
 * from the material, lighting, and motion. Present the score as text outside.
 * Reduced-motion falls back to a calm static orb.
 */
export function RecoveryOrb({ size = 200 }: { score?: number; size?: number; label?: string; delta?: string }) {
  const reduced = useReducedMotion();

  return (
    <div style={{ width: size, height: size * 1.14, position: "relative", margin: "0 auto" }}>
      {/* Grounding contact shadow beneath the orb */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          width: size * 0.62,
          height: size * 0.1,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(74,80,130,0.28) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />

      {/* Outer ambient bloom */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: size,
          height: size,
          inset: undefined,
          margin: -size * 0.16,
          marginLeft: -size * 0.16,
          background: "radial-gradient(circle, rgba(124,107,240,0.32) 0%, transparent 62%)",
          filter: "blur(12px)",
        }}
      />

      {/* The sphere — breathes and lifts gently off its shadow */}
      <motion.div
        animate={reduced ? undefined : { y: [0, -7, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          marginLeft: -size / 2,
          width: size,
          height: size,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.97) 0%, rgba(200,212,255,0.62) 24%, rgba(124,107,240,0.55) 62%, rgba(91,124,250,0.5) 100%)",
          boxShadow:
            "0 30px 60px rgba(91,124,250,0.4), 0 10px 22px rgba(74,80,130,0.18), inset 0 8px 26px rgba(255,255,255,0.7), inset 0 -14px 34px rgba(91,124,250,0.3), inset 0 0 0 1px rgba(255,255,255,0.35)",
          overflow: "hidden",
        }}
      >
        {/* Liquid light — two counter-drifting blooms + a slow caustic sheen,
            reading as living energy flowing inside the crystal. */}
        {!reduced && (
          <>
            <motion.div
              aria-hidden
              style={{ position: "absolute", top: "19%", left: "19%", width: "62%", height: "62%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)", filter: "blur(7px)" }}
              animate={{ x: ["-14%", "16%", "-8%"], y: ["10%", "-14%", "8%"], opacity: [0.55, 0.9, 0.55] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              style={{ position: "absolute", top: "29%", left: "29%", width: "42%", height: "42%", borderRadius: "50%", background: "radial-gradient(circle, rgba(180,205,255,0.5), transparent 72%)", filter: "blur(8px)" }}
              animate={{ x: ["18%", "-16%", "12%"], y: ["-8%", "14%", "-10%"], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              style={{ position: "absolute", inset: "8%", borderRadius: "50%", background: "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.18) 60deg, transparent 140deg, rgba(150,180,255,0.14) 240deg, transparent 320deg)", filter: "blur(4px)", mixBlendMode: "screen" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}

        {/* Moving specular highlight — the glass catching light */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            top: "12%",
            left: "20%",
            width: "40%",
            height: "28%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.92), transparent 70%)",
            filter: "blur(3px)",
          }}
          animate={reduced ? undefined : { x: ["0%", "8%", "0%"], y: ["0%", "4%", "0%"], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Faint lower rim light for depth */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "8%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "56%",
            height: "16%",
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.4), transparent 70%)",
            filter: "blur(4px)",
          }}
        />
      </motion.div>
    </div>
  );
}
