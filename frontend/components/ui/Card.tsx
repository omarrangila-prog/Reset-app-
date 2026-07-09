"use client";

import { CSSProperties, ReactNode } from "react";
import { t } from "./theme";

/**
 * Floating light card. `variant`:
 *  - soft:  subtle shadow (default sections)
 *  - float: larger radius + shadow (hero/feature cards)
 *  - glass: translucent glassmorphism (overlays over gradients)
 *  - tint:  accent-tinted surface (highlights)
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
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        ...base,
        ...variants[variant],
        ...(onClick ? { cursor: "pointer", textAlign: "left", width: "100%", display: "block" } : {}),
      }}
    >
      {children}
    </Comp>
  );
}
