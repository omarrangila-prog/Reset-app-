"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * AICoachOrb — the character orb that IS the coach. Soft glass sphere with two
 * gentle "eyes" of light and state-driven motion:
 *  - idle:      slow breathing float
 *  - listening: outward wave ripple
 *  - thinking:  inner particles rotate
 *  - speaking:  light pulses
 * Pure CSS/SVG + Framer Motion.
 */
export type OrbState = "idle" | "listening" | "thinking" | "speaking";

export function AICoachOrb({ state = "idle", size = 120 }: { state?: OrbState; size?: number }) {
  const reduced = useReducedMotion();

  const floatAnim =
    reduced || state === "thinking"
      ? undefined
      : { y: [0, -6, 0], scale: state === "speaking" ? [1, 1.05, 1] : [1, 1.02, 1] };
  const floatDur = state === "speaking" ? 0.9 : 4.5;

  return (
    <div style={{ width: size, height: size, position: "relative", margin: "0 auto" }}>
      {/* Listening ripple rings */}
      {state === "listening" && !reduced && (
        <>
          {[0, 0.6, 1.2].map((d) => (
            <motion.div
              key={d}
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "1.5px solid rgba(124,107,240,0.4)",
              }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: d, ease: "easeOut" }}
            />
          ))}
        </>
      )}

      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -size * 0.2,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,107,240,0.4) 0%, transparent 65%)",
          filter: "blur(6px)",
        }}
      />

      <motion.div
        animate={floatAnim}
        transition={{ duration: floatDur, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 34% 30%, rgba(255,255,255,0.95), rgba(200,210,255,0.7) 30%, rgba(124,107,240,0.7) 70%, rgba(91,124,250,0.65) 100%)",
          boxShadow:
            "0 16px 44px rgba(91,124,250,0.4), inset 0 4px 16px rgba(255,255,255,0.7), inset 0 -8px 22px rgba(91,124,250,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Thinking particles */}
        {state === "thinking" && !reduced && (
          <motion.div
            aria-hidden
            style={{ position: "absolute", inset: "18%" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            {[0, 120, 240].map((deg) => (
              <div
                key={deg}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)",
                  transform: `rotate(${deg}deg) translateX(${size * 0.26}px)`,
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Eyes of light */}
        {state !== "thinking" && (
          <div style={{ display: "flex", gap: size * 0.14, zIndex: 1 }}>
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                style={{
                  width: size * 0.1,
                  height: size * 0.16,
                  borderRadius: size * 0.06,
                  background: "rgba(255,255,255,0.95)",
                  boxShadow: "0 0 12px rgba(255,255,255,0.9)",
                }}
                animate={
                  reduced
                    ? undefined
                    : state === "speaking"
                    ? { scaleY: [1, 0.6, 1] }
                    : { opacity: [0.9, 0.6, 0.9] }
                }
                transition={{ duration: state === "speaking" ? 0.5 : 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
