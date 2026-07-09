"use client";

import { motion, useReducedMotion } from "framer-motion";
import { t } from "./theme";

/**
 * RecoveryOrb — a floating translucent glass sphere with a score inside.
 * VisionOS-style: soft breathing float, inner light, rim highlight. Pure
 * SVG/CSS + Framer Motion (no 3D deps).
 */
export function RecoveryOrb({
  score,
  size = 200,
  label = "Recovery Score",
  delta,
}: {
  score: number;
  size?: number;
  label?: string;
  delta?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div style={{ width: size, height: size, position: "relative", margin: "0 auto" }}>
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -size * 0.15,
          background: "radial-gradient(circle, rgba(124,107,240,0.35) 0%, transparent 65%)",
          filter: "blur(8px)",
        }}
      />
      <motion.div
        animate={reduced ? undefined : { y: [0, -8, 0], scale: [1, 1.015, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(190,205,255,0.6) 22%, rgba(124,107,240,0.55) 60%, rgba(91,124,250,0.5) 100%)",
          boxShadow:
            "0 20px 60px rgba(91,124,250,0.35), inset 0 4px 20px rgba(255,255,255,0.6), inset 0 -10px 30px rgba(91,124,250,0.25)",
          backdropFilter: "blur(4px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Specular highlight */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "12%",
            left: "20%",
            width: "42%",
            height: "30%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.85), transparent 70%)",
            filter: "blur(4px)",
          }}
        />
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
          <div style={{ fontSize: 11, color: t.emerald, marginTop: 3, fontWeight: 600, position: "relative", zIndex: 1 }}>{delta}</div>
        )}
      </motion.div>
    </div>
  );
}
