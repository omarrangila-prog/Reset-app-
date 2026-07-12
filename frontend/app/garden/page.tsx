"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { computeGarden, gardenMessage, GardenState } from "@/lib/garden";

/**
 * Recovery Garden — grows with healthy actions; never dies after a difficult
 * moment (growth just slows). Pure CSS/SVG, theme-aware, reduced-motion aware.
 */
export default function GardenPage() {
  const { userId } = useAppStore();
  const reduced = useReducedMotion();
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => { if (userId) api.getMe().then(setMe).catch(() => {}); }, [userId]);

  const g = computeGarden({ streak: me?.streak, longestStreak: me?.longestStreak });
  const pct = Math.min(1, g.points / g.nextAt);

  const skyLight: Record<GardenState["season"], string> = {
    spring: "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 60%)",
    summer: "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--vuln) 22%, transparent), transparent 60%)",
    autumn: "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--urge) 20%, transparent), transparent 60%)",
    winter: "radial-gradient(120% 80% at 50% 0%, color-mix(in srgb, var(--sky) 22%, transparent), transparent 60%)",
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/profile" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Your recovery garden</div>
            <div suppressHydrationWarning style={{ fontSize: 12, color: t.muted, textTransform: "capitalize" }}>{g.season}</div>
          </div>
        </header>

        {/* The garden scene */}
        <div style={{ position: "relative", height: 300, borderRadius: 28, overflow: "hidden", margin: "16px 0 20px", border: `1px solid ${t.border}`, boxShadow: "var(--shadow-md)",
          background: "linear-gradient(180deg, var(--bg-tint) 0%, var(--bg-surface) 100%)" }}>
          {/* seasonal sky light */}
          <div aria-hidden style={{ position: "absolute", inset: 0, background: skyLight[g.season] }} />
          {/* soft sun/moon */}
          <div aria-hidden style={{ position: "absolute", top: 26, right: 34, width: 44, height: 44, borderRadius: "50%", background: "radial-gradient(circle, #fff, color-mix(in srgb, var(--accent) 40%, transparent))", filter: "blur(1px)", opacity: 0.8 }} />

          {/* ground */}
          <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "linear-gradient(180deg, color-mix(in srgb, var(--recovery) 18%, var(--bg-surface)), var(--bg-surface))" }} />

          {/* trees */}
          {Array.from({ length: g.trees }).map((_, i) => (
            <Tree key={`t-${i}`} x={18 + i * 24} scale={0.8 + i * 0.05} reduced={!!reduced} delay={i * 0.1} />
          ))}
          {/* flowers */}
          {Array.from({ length: g.flowers }).map((_, i) => (
            <Flower key={`f-${i}`} x={12 + (i * 9) % 82} reduced={!!reduced} delay={0.2 + i * 0.06} hue={i} />
          ))}
          {/* butterflies */}
          {!reduced && Array.from({ length: g.butterflies }).map((_, i) => (
            <motion.div key={`b-${i}`} aria-hidden style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", background: "var(--accent-2)", top: 60 + i * 30, left: "50%" }}
              animate={{ x: [-40 - i * 20, 60 + i * 20, -40 - i * 20], y: [0, -20, 0] }} transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }} />
          ))}

          {g.points === 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", color: t.sub, fontSize: 14 }}>
              Your garden is ready to grow.
            </div>
          )}
        </div>

        {/* message + progress */}
        <p style={{ fontSize: 15.5, color: t.text, lineHeight: 1.6, fontWeight: 500, marginBottom: 16 }}>{gardenMessage(g)}</p>

        <div style={{ background: "var(--bg-surface)", border: `1px solid ${t.border}`, borderRadius: 20, padding: "16px 18px", boxShadow: "var(--shadow-sm)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: t.muted, fontWeight: 600 }}>Growth</span>
            <span style={{ fontSize: 13, color: "var(--accent-text)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{g.points} / {g.nextAt}</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "var(--bg-tint)", overflow: "hidden" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", borderRadius: 999, background: "var(--grad-hero)" }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
            <GStat n={g.flowers} label="flowers" />
            <GStat n={g.trees} label="trees" />
            <GStat n={g.butterflies} label="butterflies" />
          </div>
        </div>

        <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.6, textAlign: "center", padding: "0 8px" }}>
          Every reflection, calm session, and win helps it grow. A difficult moment never undoes your garden — growth simply slows.
        </p>
      </div>
      <BottomNav />
    </div>
  );
}

function GStat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{n}</span>
      <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 5 }}>{label}</span>
    </div>
  );
}

function Tree({ x, scale, reduced, delay }: { x: number; scale: number; reduced: boolean; delay: number }) {
  return (
    <motion.svg aria-hidden width={54} height={90} viewBox="0 0 54 90" style={{ position: "absolute", bottom: 52, left: `${x}%`, transformOrigin: "bottom center" }}
      initial={reduced ? undefined : { scaleY: 0, opacity: 0 }} animate={{ scaleY: scale, scaleX: scale, opacity: 1 }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
      <rect x="24" y="52" width="6" height="34" rx="3" fill="color-mix(in srgb, var(--urge) 50%, var(--text-muted))" />
      <circle cx="27" cy="36" r="20" fill="color-mix(in srgb, var(--recovery) 60%, var(--bg-surface))" />
      <circle cx="15" cy="46" r="13" fill="color-mix(in srgb, var(--recovery) 55%, var(--bg-surface))" />
      <circle cx="39" cy="46" r="13" fill="color-mix(in srgb, var(--recovery) 50%, var(--bg-surface))" />
    </motion.svg>
  );
}

function Flower({ x, reduced, delay, hue }: { x: number; reduced: boolean; delay: number; hue: number }) {
  const colors = ["var(--accent-2)", "var(--accent)", "var(--vuln)", "var(--sky)", "var(--urge)"];
  const c = colors[hue % colors.length];
  return (
    <motion.svg aria-hidden width={22} height={40} viewBox="0 0 22 40" style={{ position: "absolute", bottom: 50, left: `${x}%`, transformOrigin: "bottom center" }}
      initial={reduced ? undefined : { scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      <rect x="10" y="16" width="2.5" height="22" rx="1" fill="color-mix(in srgb, var(--recovery) 60%, var(--text-muted))" />
      <circle cx="11" cy="10" r="5" fill={c} />
      <circle cx="5" cy="14" r="4" fill={c} opacity="0.85" />
      <circle cx="17" cy="14" r="4" fill={c} opacity="0.85" />
      <circle cx="11" cy="12" r="2.5" fill="#fff" opacity="0.9" />
    </motion.svg>
  );
}
