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

  shadowSm: "0 1px 1px rgba(28,35,51,0.03), 0 3px 6px rgba(46,62,120,0.05), 0 1px 3px rgba(46,62,120,0.04)",
  shadowMd: "0 1px 2px rgba(28,35,51,0.04), 0 6px 14px rgba(46,62,120,0.07), 0 12px 28px rgba(46,62,120,0.06)",
  shadowLg: "0 2px 4px rgba(28,35,51,0.04), 0 10px 24px rgba(46,62,120,0.09), 0 24px 56px rgba(46,62,120,0.10)",
  shadowAccent: "0 2px 6px rgba(91,124,250,0.18), 0 10px 24px rgba(91,124,250,0.24), 0 20px 48px rgba(124,107,240,0.16)",

  meshHero:
    "radial-gradient(38% 44% at 18% 22%, rgba(124,107,240,0.55) 0%, transparent 60%), radial-gradient(42% 46% at 82% 18%, rgba(79,182,245,0.50) 0%, transparent 62%), radial-gradient(46% 50% at 72% 88%, rgba(52,201,163,0.40) 0%, transparent 60%), radial-gradient(50% 54% at 25% 84%, rgba(91,124,250,0.45) 0%, transparent 60%), linear-gradient(135deg, #6E8CFB 0%, #9B7BF2 100%)",

  rSm: 8, rMd: 14, rLg: 20, rXl: 28, r2xl: 36,

  fontHeading: "'Sora', 'DM Sans', system-ui, sans-serif",
  fontBody: "'DM Sans', system-ui, sans-serif",
} as const;
