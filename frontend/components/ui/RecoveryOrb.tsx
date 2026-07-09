"use client";

import { motion, useReducedMotion } from "framer-motion";
import { t } from "./theme";

/**
 * RecoveryOrb — the hero. A living crystal-glass sphere: breathes, glows, with
 * internal light that drifts and soft particles orbiting it. Pure CSS/SVG +
 * Framer Motion (no 3D deps). Reduced-motion falls back to a calm static orb.
 */
export function RecoveryOrb({
  score,
  size = 200,
  label = "How you're doing",
  delta,
}: {
  score: number;
  size?: number;
  label?: string;
  delta?: string;
}) {
  const reduced = useReducedMotion();
  const particleCount = 6;

  return (
    <div style={{ width: size, height: size, position: "relative", margin: "0 auto" }}>
      {/* Outer ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -size * 0.18,
          background: "radial-gradient(circle, rgba(124,107,240,0.4) 0%, transparent 62%)",
          filter: "blur(10px)",
        }}
      />

      {/* Orbiting particles */}
      {!reduced &&
        Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * 360;
          const radius = size * (0.52 + (i % 2) * 0.06);
          return (
            <motion.div
              key={i}
              aria-hidden
              style={{ position: "absolute", top: "50%", left: "50%", width: 5, height: 5 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14 + i * 2, repeat: Infinity, ease: "linear" }}
            >
              <span
                style={{
                  position: "absolute",
                  transform: `rotate(${angle}deg) translateX(${radius}px)`,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)",
                  boxShadow: "0 0 8px rgba(255,255,255,0.9)",
                }}
              />
            </motion.div>
          );
        })}

      {/* The sphere — breathes */}
      <motion.div
        animate={reduced ? undefined : { y: [0, -8, 0], scale: [1, 1.02, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(190,205,255,0.6) 22%, rgba(124,107,240,0.55) 60%, rgba(91,124,250,0.5) 100%)",
          boxShadow:
            "0 24px 64px rgba(91,124,250,0.4), inset 0 6px 24px rgba(255,255,255,0.65), inset 0 -12px 32px rgba(91,124,250,0.28)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Internal light that slowly drifts (living energy inside) */}
        {!reduced && (
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              width: "60%",
              height: "60%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)",
              filter: "blur(6px)",
            }}
            animate={{ x: ["-14%", "16%", "-8%"], y: ["10%", "-14%", "8%"], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Specular highlight */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "12%",
            left: "20%",
            width: "40%",
            height: "28%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent 70%)",
            filter: "blur(3px)",
          }}
        />

        {/* Score */}
        <motion.div
          initial={reduced ? false : { scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 20, delay: 0.2 }}
          style={{ fontFamily: t.fontHeading, fontSize: size * 0.26, fontWeight: 700, color: "#2A2350", letterSpacing: "-0.03em", lineHeight: 1, position: "relative", zIndex: 1 }}
        >
          {score}
        </motion.div>
        <div style={{ fontSize: 12, color: "#5A4F9A", marginTop: 2, fontWeight: 500, position: "relative", zIndex: 1 }}>/100</div>
        <div style={{ fontSize: 11, color: "#6B62A8", marginTop: 6, position: "relative", zIndex: 1 }}>{label}</div>
        {delta && (
          <div style={{ fontSize: 11, color: "#3A2F8F", marginTop: 3, fontWeight: 600, position: "relative", zIndex: 1 }}>{delta}</div>
        )}
      </motion.div>
    </div>
  );
}
