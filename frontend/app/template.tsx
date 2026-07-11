"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion";

/**
 * Route transition. A short fade-through on navigation for continuity.
 *
 * Deliberately animates OPACITY ONLY — no transform. A transformed ancestor
 * would become the containing block for the fixed bottom-nav (breaking its
 * position: fixed), so we keep transitions transform-free to guarantee the dock
 * stays pinned. Respects prefers-reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: motionTokens.normal / 1000, ease: motionTokens.ease }}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
}
