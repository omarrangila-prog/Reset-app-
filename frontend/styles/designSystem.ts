// RESET Design System
// Strict 8-point spacing. Max 5 colors. Two fonts. No noise.

export const colors = {
  // Background — near black, not pure black
  bg: "#0A0A0B",
  bgElevated: "#111113",
  bgSurface: "#18181B",

  // Text
  textPrimary: "#F2F2F0",
  textSecondary: "#8A8A8E",
  textMuted: "#4A4A4E",

  // Signal colors — one per mode
  urge: "#F5A623",      // amber support
  vulnerability: "#F5A623", // 🟡 at-risk
  recovery: "#1DB954",  // 🟢 stable

  // Neutral accent
  accent: "#E8E8E0",
  border: "#2A2A2E",
  borderStrong: "#3A3A3E",
} as const;

export const spacing = {
  // 8-point grid — ONLY these values
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
  32: "128px",
} as const;

export const radius = {
  sm: "4px",
  md: "8px",
  lg: "16px",
  xl: "24px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 3px rgba(0,0,0,0.4)",
  md: "0 4px 16px rgba(0,0,0,0.5)",
  lg: "0 8px 32px rgba(0,0,0,0.6)",
  urge: "0 0 40px rgba(255, 51, 51, 0.25)",
  recovery: "0 0 40px rgba(29, 185, 84, 0.15)",
  vulnerability: "0 0 40px rgba(245, 166, 35, 0.15)",
} as const;

export const fonts = {
  heading: "'Bebas Neue', 'Impact', sans-serif",
  body: "'DM Sans', 'system-ui', sans-serif",
  mono: "'JetBrains Mono', 'Courier New', monospace",
} as const;

export const typography = {
  display: { fontFamily: fonts.heading, fontSize: "80px", lineHeight: "0.95", letterSpacing: "-0.02em" },
  h1: { fontFamily: fonts.heading, fontSize: "48px", lineHeight: "1.05", letterSpacing: "0.02em" },
  h2: { fontFamily: fonts.heading, fontSize: "32px", lineHeight: "1.1", letterSpacing: "0.03em" },
  h3: { fontFamily: fonts.body, fontSize: "20px", lineHeight: "1.3", fontWeight: "600" },
  body: { fontFamily: fonts.body, fontSize: "16px", lineHeight: "1.6", fontWeight: "400" },
  small: { fontFamily: fonts.body, fontSize: "13px", lineHeight: "1.5", fontWeight: "400" },
  label: { fontFamily: fonts.body, fontSize: "11px", lineHeight: "1.4", fontWeight: "600", letterSpacing: "0.12em", textTransform: "uppercase" as const },
  mono: { fontFamily: fonts.mono, fontSize: "14px", lineHeight: "1.5" },
} as const;

export const transitions = {
  fast: "all 0.15s ease",
  base: "all 0.25s ease",
  slow: "all 0.4s ease",
} as const;

export type BehavioralMode = "URGE" | "VULNERABILITY" | "RECOVERY";

export const modeConfig = {
  URGE: {
    color: colors.urge,
    bg: "#1A1205",
    shadow: shadows.vulnerability,
    label: "SUPPORT MODE",
    description: "Notice the feeling. Choose one steady action.",
  },
  VULNERABILITY: {
    color: colors.vulnerability,
    bg: "#1A1205",
    shadow: shadows.vulnerability,
    label: "VULNERABILITY MODE",
    description: "Redirect this energy.",
  },
  RECOVERY: {
    color: colors.recovery,
    bg: "#051A0D",
    shadow: shadows.recovery,
    label: "RECOVERY MODE",
    description: "Building. Day by day.",
  },
} as const;
