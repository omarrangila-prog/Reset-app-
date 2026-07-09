/**
 * Light design-system tokens (TS mirror of the CSS variables).
 * Import these in inline-styled components so the whole app stays consistent.
 */
export const t = {
  bg: "#F5F7FC",
  bgTint: "#EEF1FA",
  surface: "#FFFFFF",
  glass: "rgba(255,255,255,0.72)",

  text: "#1C2333",
  sub: "#5A6478",
  muted: "#8A93A6",

  accent: "#5B7CFA",
  accent2: "#7C6BF0",
  accentSoft: "#EAF0FF",
  sky: "#4FB6F5",
  mint: "#34C9A3",
  emerald: "#2FBE6E",

  urge: "#EC6A5E",
  vuln: "#F0B24B",
  recovery: "#2FBE6E",
  danger: "#E5687C",

  border: "#E6EAF2",
  borderMid: "#D8DEEA",

  gradHero: "linear-gradient(135deg, #6E8CFB 0%, #9B7BF2 100%)",
  gradRing: "linear-gradient(135deg, #5B7CFA 0%, #7C6BF0 60%, #4FB6F5 100%)",
  gradCalm: "linear-gradient(160deg, #EAF0FF 0%, #F3EEFF 100%)",

  shadowSm: "0 2px 8px rgba(28,35,51,0.06)",
  shadowMd: "0 8px 24px rgba(46,62,120,0.08)",
  shadowLg: "0 16px 40px rgba(46,62,120,0.12)",
  shadowAccent: "0 12px 30px rgba(91,124,250,0.28)",

  rSm: 8, rMd: 14, rLg: 20, rXl: 28, r2xl: 36,

  fontHeading: "'Sora', 'DM Sans', system-ui, sans-serif",
  fontBody: "'DM Sans', system-ui, sans-serif",
} as const;
