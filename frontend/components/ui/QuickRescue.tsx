"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { LifeBuoy } from "lucide-react";
import { t } from "./theme";

/**
 * Quick Rescue — a floating glass orb, always reachable (bottom-right), that
 * jumps straight into Calm Mode. The signature "one tap when you need it now"
 * affordance. Hidden on the urge/calm screen itself (would be redundant).
 */
export function QuickRescue() {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();

  if (pathname === "/urge" || pathname?.startsWith("/coach")) return null;

  return (
    <motion.button
      onClick={() => router.push("/urge")}
      aria-label="Quick rescue — open calm mode"
      whileTap={reduced ? undefined : { scale: 0.9 }}
      whileHover={reduced ? undefined : { scale: 1.06 }}
      animate={reduced ? undefined : { y: [0, -5, 0] }}
      transition={{ y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }, default: { type: "spring", stiffness: 400, damping: 22 } }}
      style={{
        position: "fixed",
        right: 18,
        bottom: "calc(96px + env(safe-area-inset-bottom))",
        zIndex: 95,
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.5)",
        background: "radial-gradient(circle at 34% 30%, rgba(255,255,255,0.95), rgba(200,210,255,0.8) 40%, rgba(124,107,240,0.85) 100%)",
        boxShadow: "0 12px 32px rgba(124,107,240,0.45), inset 0 2px 8px rgba(255,255,255,0.6)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <LifeBuoy size={24} strokeWidth={2.2} color="#3A2F8F" />
    </motion.button>
  );
}
