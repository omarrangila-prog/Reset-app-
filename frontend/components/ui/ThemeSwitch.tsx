"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme, ThemePref } from "@/lib/theme";
import { haptic } from "@/lib/haptics";

/**
 * A distinctive VERTICAL physical switch for light/dark — like a real
 * switchboard toggle. UP = light, DOWN = dark. Tap or drag the knob; a small
 * segmented selector beneath adds a third "System" option.
 *
 * Accessible: role="switch" + aria-checked (checked = dark), keyboard
 * operable (Enter/Space toggle, ArrowUp=light, ArrowDown=dark), labelled,
 * large touch target, reduced-motion aware.
 */
export function ThemeSwitch() {
  const { pref, resolved, setPref, toggle } = useTheme();
  const reduced = useReducedMotion();
  const isDark = resolved === "dark";

  const TRACK_H = 116;
  const KNOB = 52;
  const PAD = 6;
  const downY = TRACK_H - KNOB - PAD * 2; // knob travel

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); haptic("select"); toggle(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); haptic("select"); setPref("light"); }
    else if (e.key === "ArrowDown") { e.preventDefault(); haptic("select"); setPref("dark"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {/* Housing */}
      <div
        role="switch"
        aria-checked={isDark}
        aria-label={`Dark mode — currently ${isDark ? "on" : "off"}. Up for light, down for dark.`}
        tabIndex={0}
        onKeyDown={onKey}
        onClick={() => { haptic("select"); toggle(); }}
        style={{
          position: "relative",
          width: KNOB + PAD * 2,
          height: TRACK_H,
          borderRadius: 999,
          padding: PAD,
          cursor: "pointer",
          // recessed track
          background: "var(--bg-tint)",
          boxShadow: "inset 5px 5px 12px var(--neu-dark), inset -5px -5px 12px var(--neu-light)",
          outlineOffset: 3,
        }}
      >
        {/* Sun (top) / Moon (bottom) glyphs in the track */}
        <div aria-hidden style={{ position: "absolute", top: 12, left: 0, right: 0, display: "flex", justifyContent: "center", color: isDark ? "var(--text-muted)" : "var(--vuln)" }}>
          <Sun size={18} strokeWidth={2.4} />
        </div>
        <div aria-hidden style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", color: isDark ? "var(--accent)" : "var(--text-muted)" }}>
          <Moon size={17} strokeWidth={2.4} />
        </div>

        {/* Knob — slides up/down with spring */}
        <motion.div
          animate={{ y: isDark ? downY : 0 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34 }}
          whileTap={reduced ? undefined : { scale: 0.94 }}
          style={{
            position: "relative",
            width: KNOB,
            height: KNOB,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // raised knob with upper highlight + lower shadow
            background: isDark
              ? "linear-gradient(145deg, #2A3252, #1A2038)"
              : "linear-gradient(145deg, #FFFFFF, #EEF1FA)",
            boxShadow:
              "-4px -4px 10px var(--neu-light), 5px 6px 14px var(--neu-dark), inset 1px 1px 0 rgba(255,255,255,0.5)",
            color: isDark ? "var(--accent)" : "var(--vuln)",
          }}
        >
          {isDark ? <Moon size={20} strokeWidth={2.4} /> : <Sun size={20} strokeWidth={2.4} />}
        </motion.div>
      </div>

      {/* Segmented System / auto selector */}
      <div role="radiogroup" aria-label="Theme preference" style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 999, background: "var(--bg-tint)", boxShadow: "inset 3px 3px 8px var(--neu-dark), inset -3px -3px 8px var(--neu-light)" }}>
        {(["light", "system", "dark"] as ThemePref[]).map((opt) => {
          const active = pref === opt;
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={active}
              onClick={() => { haptic("select"); setPref(opt); }}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                fontSize: 12.5,
                fontWeight: 600,
                textTransform: "capitalize",
                minHeight: 36,
                color: active ? "#fff" : "var(--text-muted)",
                background: active ? "var(--grad-hero)" : "transparent",
                boxShadow: active ? "var(--shadow-accent)" : "none",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
