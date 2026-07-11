"use client";

import { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { spring } from "./motion";
import { haptic } from "@/lib/haptics";
import { t } from "./theme";

/**
 * Floating light card. `variant`:
 *  - soft:  subtle shadow (default sections)
 *  - float: larger radius + shadow (hero/feature cards)
 *  - glass: translucent glassmorphism (overlays over gradients)
 *  - tint:  accent-tinted surface (highlights)
 *
 * When `onClick` is set the card becomes interactive with hover-lift,
 * press-scale (spring), and a keyboard focus ring — VisionOS-style physicality.
 */
export function Card({
  children,
  variant = "soft",
  padding = 20,
  style,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  variant?: "soft" | "float" | "glass" | "tint";
  padding?: number;
  style?: CSSProperties;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const reduced = useReducedMotion();

  const base: CSSProperties = {
    borderRadius: variant === "float" ? t.rXl : t.rLg,
    padding,
    ...style,
  };
  // Sculpted-glass surface: a faint top-lit gradient (not flat white) + an inner
  // rim highlight in the shadow so every card reads as a polished material.
  const sculpted = "linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 55%, #F7F8FD 100%)";
  const innerRim = "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(46,62,120,0.03)";
  const variants: Record<string, CSSProperties> = {
    soft: { background: sculpted, border: `1px solid ${t.border}`, boxShadow: `${t.shadowSm}, ${innerRim}` },
    float: { background: sculpted, border: `1px solid ${t.border}`, boxShadow: `${t.shadowMd}, ${innerRim}` },
    glass: {
      background: t.glass,
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      border: "1px solid rgba(255,255,255,0.65)",
      boxShadow: `${t.shadowMd}, ${innerRim}`,
    },
    tint: { background: `linear-gradient(180deg, ${t.accentSoft} 0%, #EEF0FE 100%)`, border: `1px solid ${t.accent}22`, boxShadow: innerRim },
  };

  const merged = { ...base, ...variants[variant], position: "relative" as const, overflow: "hidden" as const };

  if (!onClick) {
    return <div className="pearl" style={merged}>{children}</div>;
  }

  return (
    <motion.button
      className="pearl"
      onClick={() => { haptic("tap"); onClick(); }}
      aria-label={ariaLabel}
      whileHover={reduced ? undefined : { y: -3, boxShadow: t.shadowLg }}
      whileTap={reduced ? undefined : { scale: 0.985 }}
      whileFocus={reduced ? undefined : { boxShadow: `0 0 0 2px ${t.accent}` }}
      transition={spring}
      style={{ ...merged, cursor: "pointer", textAlign: "left", width: "100%", display: "block" }}
    >
      {children}
    </motion.button>
  );
}
