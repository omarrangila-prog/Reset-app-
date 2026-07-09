"use client";

import { motion, useReducedMotion, Variants } from "framer-motion";
import { ReactNode } from "react";

/**
 * Motion system — Apple-like spring physics. Centralized so every animation in
 * the app shares the same feel. Respects prefers-reduced-motion everywhere.
 */

export const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;
export const springSoft = { type: "spring", stiffness: 260, damping: 30 } as const;
export const easeOut = [0.22, 1, 0.36, 1] as const;

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.06, duration: 0.5, ease: easeOut },
  }),
};

/** Fade-up-with-blur reveal. Pass `index` for stagger within a list. */
export function Reveal({
  children,
  index = 0,
  className,
  style,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={style}
      variants={revealVariants}
      initial="hidden"
      animate="show"
      custom={index}
    >
      {children}
    </motion.div>
  );
}

/** Tactile press wrapper — subtle spring scale on tap, like iOS controls. */
export function Pressable({
  children,
  onClick,
  className,
  style,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.button
      aria-label={ariaLabel}
      onClick={onClick}
      className={className}
      style={{ border: "none", background: "none", padding: 0, cursor: "pointer", ...style }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={spring}
    >
      {children}
    </motion.button>
  );
}
