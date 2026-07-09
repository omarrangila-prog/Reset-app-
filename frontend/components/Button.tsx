"use client";
import { motion, HTMLMotionProps } from "framer-motion";
import { CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "urge";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "#1C2333",
    color: "#FFFFFF",
    border: "none",
  },
  secondary: {
    background: "transparent",
    color: "#1C2333",
    border: "1px solid #C6CEDE",
  },
  danger: {
    background: "#EC6A5E",
    color: "#FFFFFF",
    border: "none",
  },
  ghost: {
    background: "transparent",
    color: "#8A93A6",
    border: "none",
  },
  urge: {
    background: "#5B7CFA",
    color: "#FFFFFF",
    border: "none",
    boxShadow: "0 0 40px rgba(91, 124, 250, 0.25)",
  },
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: { padding: "clamp(8px, 2vw, 10px) clamp(14px, 4vw, 18px)", fontSize: "clamp(12px, 3.5vw, 13px)", borderRadius: "12px" },
  md: { padding: "clamp(11px, 3vw, 13px) clamp(18px, 6vw, 24px)", fontSize: "clamp(14px, 4vw, 15px)", borderRadius: "14px" },
  lg: { padding: "clamp(13px, 4vw, 16px) clamp(24px, 8vw, 32px)", fontSize: "clamp(15px, 4.5vw, 16px)", borderRadius: "16px" },
  xl: { padding: "clamp(16px, 5vw, 20px) clamp(32px, 10vw, 40px)", fontSize: "clamp(16px, 5vw, 18px)", borderRadius: "18px", letterSpacing: "0.02em" },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: loading || disabled ? 1 : 0.97 }}
      whileHover={{ opacity: loading || disabled ? 1 : 0.9 }}
      disabled={loading || disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        cursor: loading || disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        width: fullWidth ? "100%" : undefined,
        opacity: disabled && !loading ? 0.5 : 1,
        userSelect: "none",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size={size} color={variant === "primary" ? "#FFFFFF" : "#1C2333"} />
          <span style={{ opacity: 0.7 }}>
            {typeof children === "string" ? children : "Loading..."}
          </span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

function LoadingSpinner({ size, color }: { size: ButtonSize; color: string }) {
  const spinnerSize = { sm: 12, md: 14, lg: 16, xl: 18 }[size];

  return (
    <motion.svg
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="3"
        strokeOpacity="0.3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
