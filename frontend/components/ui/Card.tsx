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
  const sculpted = "linear-gradient(145deg, #FFFFFF 0%, #FaFbFF 55%, #F1F4FC 100%)";
  // Modern soft-neumorphic dual light (source: upper-left) — a bright highlight
  // and a soft cool shadow so cards read as raised physical surfaces.
  const neuRaised =
    "-7px -7px 16px rgba(255,255,255,0.85), 8px 8px 20px rgba(90,100,150,0.10)";
  const innerRim = "inset 1px 1px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(46,62,120,0.03)";
  const variants: Record<string, CSSProperties> = {
    soft: { background: sculpted, border: `1px solid ${t.border}`, boxShadow: `${neuRaised}, ${innerRim}` },
    float: { background: sculpted, border: `1px solid ${t.border}`, boxShadow: `${neuRaised}, ${innerRim}` },
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
      whileHover={reduced ? undefined : { y: -3, boxShadow: "-9px -9px 20px rgba(255,255,255,0.9), 10px 10px 26px rgba(90,100,150,0.13)" }}
      whileTap={reduced ? undefined : { scale: 0.985, boxShadow: "inset 5px 5px 12px rgba(90,100,150,0.14), inset -5px -5px 12px rgba(255,255,255,0.85)" }}
      whileFocus={reduced ? undefined : { boxShadow: `0 0 0 2px ${t.accent}` }}
      transition={spring}
      style={{ ...merged, cursor: "pointer", textAlign: "left", width: "100%", display: "block" }}
    >
      {children}
    </motion.button>
  );
}
