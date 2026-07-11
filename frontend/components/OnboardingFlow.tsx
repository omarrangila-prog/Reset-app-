"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AICoachOrb } from "@/components/ui/AICoachOrb";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { haptic } from "@/lib/haptics";

interface OnboardingFlowProps {
  onComplete: (data: { reason: string; name: string; timeOfDay: string }) => void;
  onSkip: () => void;
}

// Brand-consistent light palette (mirrors theme.ts; kept local so onboarding
// renders before the app store / theme is hydrated).
const T = {
  bg: "radial-gradient(120% 90% at 50% 12%, #EEF1FF 0%, #F1EEFF 46%, #E9F1FF 100%)",
  surface: "#FFFFFF",
  text: "#1C2333",
  sub: "#5A6478",
  muted: "#646E80",
  border: "#E6EAF2",
  accent: "#5B7CFA",
  accent2: "#7C6BF0",
  mint: "#34C9A3",
  ctaDeep: "#4257C9", // AA (>4.5:1) with white
};

const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL = 4;

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState(0); // 0..3
  const [dir, setDir] = useState(1);

  const go = (next: number) => {
    haptic("select");
    setDir(next > screen ? 1 : -1);
    setScreen(next);
  };

  const finish = () => {
    haptic("success");
    // Content is educational; we still hand back a light identity so downstream
    // greeting copy has something to use. Defaults keep the flow frictionless.
    onComplete({ reason: "", name: "You", timeOfDay: "" });
  };

  const variants = {
    enter: (d: number) => ({ x: reduced ? 0 : d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: reduced ? 0 : d * -40, opacity: 0 }),
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 10000, display: "flex", flexDirection: "column" }}>
      {/* Top bar: progress dots + skip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 0", maxWidth: 480, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 7 }} aria-hidden>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <motion.span
              key={i}
              animate={{ width: i === screen ? 22 : 7, background: i <= screen ? T.accent : T.border }}
              transition={{ duration: 0.35, ease: EASE }}
              style={{ height: 7, borderRadius: 999, display: "block" }}
            />
          ))}
        </div>
        <button
          onClick={() => { haptic("tap"); onSkip(); }}
          style={{ background: "none", border: "none", color: T.muted, fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "8px 4px", minHeight: 40 }}
        >
          Skip
        </button>
      </div>

      {/* Illustration + copy */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 28px", maxWidth: 480, width: "100%", margin: "0 auto", textAlign: "center", overflow: "hidden" }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={screen}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduced ? 0.15 : 0.45, ease: EASE }}
            style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 34 }}>
              {screen === 0 && <OrbEmergence reduced={!!reduced} />}
              {screen === 1 && <RippleArt reduced={!!reduced} />}
              {screen === 2 && <ConnectedModules reduced={!!reduced} />}
              {screen === 3 && <PrivacyArt reduced={!!reduced} />}
            </div>

            <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: 27, fontWeight: 700, color: T.text, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 14, maxWidth: 340 }}>
              {COPY[screen].title}
            </h1>
            <p style={{ fontSize: 15.5, color: T.sub, lineHeight: 1.65, maxWidth: 330, marginBottom: screen === 2 ? 20 : 0 }}>
              {COPY[screen].body}
            </p>

            {/* Screen 3: the four connected modules, named */}
            {screen === 2 && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, maxWidth: 300 }}>
                {["Journal", "Recovery", "Habits", "Insights"].map((m, i) => (
                  <motion.span
                    key={m}
                    initial={reduced ? undefined : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.08, ease: EASE }}
                    style={{ padding: "8px 14px", borderRadius: 999, background: T.surface, border: `1px solid ${T.border}`, fontSize: 13.5, fontWeight: 600, color: T.text, boxShadow: "0 2px 8px rgba(91,124,250,0.06)" }}
                  >
                    {m}
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 28px 34px", maxWidth: 480, width: "100%", margin: "0 auto" }}>
        {screen === 3 && (
          <div style={{ marginBottom: 18 }}>
            <PrivacyNotice />
          </div>
        )}
        <motion.button
          whileTap={reduced ? undefined : { scale: 0.97 }}
          onClick={() => (screen < TOTAL - 1 ? go(screen + 1) : finish())}
          style={{
            width: "100%", padding: "17px 24px", borderRadius: 16, border: "none",
            background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
            color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.01em", minHeight: 56,
            boxShadow: "0 10px 30px rgba(91,124,250,0.35)",
          }}
        >
          {screen < TOTAL - 1 ? "Continue" : "Start my reset"}
        </motion.button>
      </div>
    </div>
  );
}

const COPY = [
  {
    title: "Quit porn. Rebuild control.",
    body: "RESET helps you understand urges, avoid triggers, and build healthier habits — one day at a time.",
  },
  {
    title: "Get help when an urge hits.",
    body: "Use Calm Mode, breathing, reflection, and your AI coach before the urge takes over.",
  },
  {
    title: "See what actually helps.",
    body: "Track moods, triggers, habits, and reflections to learn the patterns behind your porn use.",
  },
  {
    title: "Private and judgment-free.",
    body: "Your recovery is personal. RESET keeps the experience discreet, supportive, and under your control.",
  },
];

/* ─── Illustrations (inline SVG/CSS, reduced-motion aware) ─────────────────── */

// Screen 1 — the Recovery Orb emerging from darkness into soft light.
function OrbEmergence({ reduced }: { reduced: boolean }) {
  return (
    <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* darkness vignette that lifts */}
      <motion.div
        aria-hidden
        style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(28,35,51,0.55) 0%, transparent 68%)" }}
        initial={reduced ? { opacity: 0 } : { opacity: 0.9, scale: 1.1 }}
        animate={{ opacity: 0, scale: 1.4 }}
        transition={{ duration: 1.6, ease: EASE }}
      />
      <motion.div
        initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <AICoachOrb size={150} state="idle" />
      </motion.div>
    </div>
  );
}

// Screen 2 — a calm ripple expanding through water.
function RippleArt({ reduced }: { reduced: boolean }) {
  return (
    <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          aria-hidden
          style={{ position: "absolute", borderRadius: "50%", border: "1.5px solid rgba(91,124,250,0.5)" }}
          initial={{ width: 26, height: 26, opacity: 0.7 }}
          animate={reduced
            ? { width: 60 + i * 46, height: 60 + i * 46, opacity: 0.5 - i * 0.12 }
            : { width: [26, 200], height: [26, 200], opacity: [0.6, 0] }}
          transition={reduced
            ? { duration: 0.4 }
            : { duration: 3, repeat: Infinity, delay: i * 0.75, ease: "easeOut" }}
        />
      ))}
      <div aria-hidden style={{ width: 26, height: 26, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #fff, ${T.accent})`, boxShadow: "0 6px 20px rgba(91,124,250,0.5)" }} />
    </div>
  );
}

// Screen 3 — four modules orbiting a center, all connected.
function ConnectedModules({ reduced }: { reduced: boolean }) {
  const nodes = [
    { x: 0, y: -64, c: T.accent2 },
    { x: 64, y: 0, c: T.accent },
    { x: 0, y: 64, c: T.mint },
    { x: -64, y: 0, c: "#4FB6F5" },
  ];
  return (
    <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden style={{ position: "absolute", inset: 0 }}>
        {nodes.map((n, i) => (
          <motion.line
            key={i}
            x1="110" y1="110" x2={110 + n.x} y2={110 + n.y}
            stroke="rgba(91,124,250,0.3)" strokeWidth="1.5"
            initial={reduced ? { pathLength: 1 } : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: EASE }}
          />
        ))}
      </svg>
      {nodes.map((n, i) => (
        <motion.div
          key={i}
          aria-hidden
          style={{ position: "absolute", width: 34, height: 34, borderRadius: 12, background: `${n.c}22`, border: `1.5px solid ${n.c}`, transform: `translate(${n.x}px, ${n.y}px)` }}
          initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.25 + i * 0.12, ease: EASE }}
        />
      ))}
      <div aria-hidden style={{ zIndex: 1 }}>
        <AICoachOrb size={64} state="idle" />
      </div>
    </div>
  );
}

// Screen 4 — a shield of soft light (privacy).
function PrivacyArt({ reduced }: { reduced: boolean }) {
  return (
    <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div
        aria-hidden
        style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${T.accent2}22, transparent 65%)`, filter: "blur(8px)" }}
        animate={reduced ? undefined : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        width="120" height="140" viewBox="0 0 120 140" fill="none" aria-hidden
        initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <defs>
          <linearGradient id="shieldG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={T.accent} />
            <stop offset="1" stopColor={T.accent2} />
          </linearGradient>
        </defs>
        <path d="M60 6 L108 26 V70 C108 104 86 126 60 134 C34 126 12 104 12 70 V26 Z"
          fill="url(#shieldG)" opacity="0.14" stroke="url(#shieldG)" strokeWidth="2.5" />
        <path d="M44 70 L55 82 L78 56" stroke="url(#shieldG)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>
    </div>
  );
}
