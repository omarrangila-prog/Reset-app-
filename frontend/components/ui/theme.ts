/**
 * Design-system tokens (TS mirror of the CSS variables in globals.css).
 *
 * Color/gradient/shadow tokens reference CSS variables so that every inline
 * style using them (`style={{ color: t.text }}`) is automatically theme-aware:
 * flipping `data-theme="dark"` on <html> re-resolves the variables, with no
 * component edits. Non-theming tokens (radii, fonts) stay as literals.
 */
export const t = {
  bg: "var(--bg)",
  bgTint: "var(--bg-tint)",
  surface: "var(--bg-surface)",
  glass: "var(--bg-glass)",

  text: "var(--text)",
  sub: "var(--text-sub)",
  muted: "var(--text-muted)",

  accent: "var(--accent)",
  // Darker accent for text on tinted/soft backgrounds (meets WCAG AA 4.5:1 in light).
  accentText: "var(--accent-text)",
  accent2: "var(--accent-2)",
  accentSoft: "var(--accent-soft)",
  sky: "var(--sky)",
  mint: "var(--mint)",
  emerald: "var(--emerald)",

  urge: "var(--urge)",
  vuln: "var(--vuln)",
  recovery: "var(--recovery)",
  danger: "var(--danger)",

  border: "var(--border)",
  borderMid: "var(--border-mid)",

  gradHero: "var(--grad-hero)",
  gradRing: "var(--grad-ring)",
  gradCalm: "var(--grad-calm)",

  shadowSm: "var(--shadow-sm)",
  shadowMd: "var(--shadow-md)",
  shadowLg: "var(--shadow-lg)",
  shadowAccent: "var(--shadow-accent)",

  meshHero: "var(--mesh-hero)",

  rSm: 8, rMd: 14, rLg: 20, rXl: 28, r2xl: 36,

  fontHeading: "'Sora', 'DM Sans', system-ui, sans-serif",
  fontBody: "'DM Sans', system-ui, sans-serif",
} as const;
