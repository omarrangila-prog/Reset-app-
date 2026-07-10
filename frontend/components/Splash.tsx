"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AICoachOrb } from "@/components/ui/AICoachOrb";

/**
 * Splash — the first impression. A luminous orb on a soft dawn mesh with the
 * brand name and tagline, then fades away. Shown once per session on cold open.
 */
export function Splash({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onDone, reduced ? 400 : 2400);
    return () => clearTimeout(timer);
  }, [onDone, reduced]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background:
          "radial-gradient(120% 80% at 50% 20%, #EAF0FF 0%, #F3EEFF 45%, #EAFBF4 100%)",
        overflow: "hidden",
      }}
    >
      {/* soft ambient bloom behind the orb */}
      <div aria-hidden style={{ position: "absolute", top: "28%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,107,240,0.35), transparent 65%)", filter: "blur(30px)" }} />

      <motion.div
        initial={reduced ? false : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <AICoachOrb size={160} state="idle" />
      </motion.div>

      <motion.div
        initial={reduced ? false : { y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: "center", position: "relative", zIndex: 1 }}
      >
        <div style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: 30, fontWeight: 700, letterSpacing: "0.08em", color: "#1C2333" }}>
          RESET
        </div>
        <div style={{ fontSize: 14, color: "#5A6478", marginTop: 8, letterSpacing: "0.02em" }}>
          A calm space to rise, one day at a time.
        </div>
      </motion.div>
    </motion.div>
  );
}
