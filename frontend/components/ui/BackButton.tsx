"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { t } from "./theme";

/**
 * Shared back button for secondary pages. Neumorphic/glass material, chevron
 * icon (not a text arrow), 44×44 target, theme-aware in light + dark, tactile
 * press. Uses browser history when available, else a safe fallback route.
 */
export function BackButton({ fallbackHref = "/", label = "Go back" }: { fallbackHref?: string; label?: string }) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const onClick = () => {
    haptic("tap");
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      whileTap={reduced ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: t.sub,
        background: t.glass,
        border: `1px solid ${t.border}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "-3px -3px 8px var(--neu-light), 3px 3px 8px var(--neu-dark)",
      }}
    >
      <ChevronLeft size={22} strokeWidth={2.4} />
    </motion.button>
  );
}
