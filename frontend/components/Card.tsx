"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: "default" | "elevated" | "bordered" | "urge" | "vulnerability" | "recovery";
  padding?: "sm" | "md" | "lg";
  animate?: boolean;
}

const variantStyles: Record<string, CSSProperties> = {
  default: {
    background: "var(--bg-elevated)",
    border: "1px solid var(--border)",
  },
  elevated: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
  },
  bordered: {
    background: "transparent",
    border: "1px solid var(--border-strong)",
  },
  urge: {
    background: "#1A0505",
    border: "1px solid rgba(255,51,51,0.3)",
    boxShadow: "0 0 40px rgba(255, 51, 51, 0.1)",
  },
  vulnerability: {
    background: "#1A1205",
    border: "1px solid rgba(245,166,35,0.3)",
    boxShadow: "0 0 40px rgba(245, 166, 35, 0.08)",
  },
  recovery: {
    background: "#051A0D",
    border: "1px solid rgba(29,185,84,0.25)",
    boxShadow: "0 0 40px rgba(29, 185, 84, 0.08)",
  },
};

const paddingStyles: Record<string, CSSProperties> = {
  sm: { padding: "16px" },
  md: { padding: "24px" },
  lg: { padding: "32px" },
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  animate = true,
  style,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 8 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        borderRadius: "var(--r-lg)",
        ...variantStyles[variant],
        ...paddingStyles[padding],
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
