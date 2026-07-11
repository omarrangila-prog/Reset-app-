"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AICoachOrb } from "@/components/ui/AICoachOrb";

/**
 * Splash — a short cinematic sequence on cold open:
 *   1. a point of light expands
 *   2. into the Recovery Orb, which breathes once
 *   3. the RESET wordmark fades in
 *   4. the whole thing fades out into the app
 *
 * ~1.8s total. Reduced-motion users get a brief static hold instead.
 */
export function Splash({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  // stage: 0 light → 1 orb → 2 wordmark
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduced) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setStage(1), 450);
    const t2 = setTimeout(() => setStage(2), 1050);
    const done = setTimeout(onDone, 1850);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(done); };
  }, [onDone, reduced]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed", inset: 0, zIndex: 10001,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28,
        background: "radial-gradient(120% 80% at 50% 20%, #EEF1FF 0%, #F1EEFF 48%, #E9EEFF 100%)",
        overflow: "hidden",
      }}
    >
      {/* ambient bloom that grows behind the orb */}
      <motion.div
        aria-hidden
        style={{ position: "absolute", top: "34%", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,107,240,0.4), transparent 65%)", filter: "blur(30px)" }}
        initial={{ width: 20, height: 20, opacity: 0 }}
        animate={{ width: stage >= 1 ? 340 : 40, height: stage >= 1 ? 340 : 40, opacity: stage >= 1 ? 1 : 0.6 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Orb + the neumorphic surface it rises from, in one shared frame so the
          pad stays concentric with the orb throughout the animation. */}
      <div style={{ position: "relative", zIndex: 1, width: 230, height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Sculpted pad with soft dual light — the orb is seated, not floating. */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute", width: 210, height: 210, borderRadius: "50%",
            background: "linear-gradient(145deg, #F7F9FF, #E7ECFA)",
            boxShadow: "-14px -14px 30px rgba(255,255,255,0.9), 16px 16px 34px rgba(90,100,150,0.16), inset 1px 1px 0 rgba(255,255,255,0.7)",
          }}
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: stage >= 1 ? 1 : 0.2, opacity: stage >= 1 ? 1 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* Point of light → orb */}
        <motion.div
          style={{ position: "relative", zIndex: 1 }}
          initial={{ scale: 0.05, opacity: 0 }}
          animate={{ scale: reduced ? 1 : stage >= 1 ? 1 : 0.12, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
        >
          {reduced || stage >= 1 ? (
            <AICoachOrb size={140} state="idle" />
          ) : (
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 0 24px 6px rgba(255,255,255,0.9)" }} />
          )}
        </motion.div>
      </div>

      {/* Wordmark */}
      <motion.div
        style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: reduced || stage >= 2 ? 0 : 16, opacity: reduced || stage >= 2 ? 1 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: "0.1em", color: "#1C2333" }}>
          RESET
        </div>
        <div style={{ fontSize: 14, color: "#5A6478", marginTop: 8, lineHeight: 1.5 }}>
          Break the pattern.<br />Take back control.
        </div>
      </motion.div>
    </motion.div>
  );
}
