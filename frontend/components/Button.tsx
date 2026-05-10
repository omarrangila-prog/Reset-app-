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
    background: "#F2F2F0",
    color: "#0A0A0B",
    border: "none",
  },
  secondary: {
    background: "transparent",
    color: "#F2F2F0",
    border: "1px solid #3A3A3E",
  },
  danger: {
    background: "#FF3333",
    color: "#F2F2F0",
    border: "none",
  },
  ghost: {
    background: "transparent",
    color: "#8A8A8E",
    border: "none",
  },
  urge: {
    background: "#FF3333",
    color: "#F2F2F0",
    border: "none",
    boxShadow: "0 0 40px rgba(255, 51, 51, 0.4)",
  },
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: "13px", borderRadius: "8px" },
  md: { padding: "12px 24px", fontSize: "15px", borderRadius: "8px" },
  lg: { padding: "16px 32px", fontSize: "16px", borderRadius: "12px" },
  xl: { padding: "20px 40px", fontSize: "18px", borderRadius: "12px", letterSpacing: "0.05em" },
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
          <LoadingSpinner size={size} color={variant === "primary" ? "#0A0A0B" : "#F2F2F0"} />
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
