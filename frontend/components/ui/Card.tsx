"use client";

import { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { spring } from "./motion";
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
  const variants: Record<string, CSSProperties> = {
    soft: { background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadowSm },
    float: { background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadowMd },
    glass: {
      background: t.glass,
      backdropFilter: "blur(20px) saturate(140%)",
      WebkitBackdropFilter: "blur(20px) saturate(140%)",
      border: "1px solid rgba(255,255,255,0.6)",
      boxShadow: t.shadowMd,
    },
    tint: { background: t.accentSoft, border: `1px solid ${t.accent}22`, boxShadow: "none" },
  };

  const merged = { ...base, ...variants[variant] };

  if (!onClick) {
    return <div style={merged}>{children}</div>;
  }

  return (
    <motion.button
      onClick={onClick}
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
