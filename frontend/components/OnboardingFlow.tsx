"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { AICoachOrb } from "@/components/ui/AICoachOrb";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { haptic } from "@/lib/haptics";
import {
  RecoveryProfile, DEFAULT_PROFILE, saveProfile, deriveRecovery,
  GOAL_OPTIONS, TIME_OPTIONS, TRIGGER_OPTIONS, LOCATION_OPTIONS, FREQUENCY_OPTIONS, SUCCESS_OPTIONS, REMINDER_OPTIONS,
} from "@/lib/recoveryProfile";

interface OnboardingFlowProps {
  onComplete: (data: { reason: string; name: string; timeOfDay: string }) => void;
  onSkip: () => void;
}

// Theme-aware tokens (CSS vars) — onboarding renders after the pre-paint theme
// script sets data-theme, so light/dark both resolve correctly, no flash.
const T = {
  bg: "var(--splash-bg)",
  surface: "var(--bg-surface)",
  text: "var(--text)",
  sub: "var(--text-sub)",
  muted: "var(--text-muted)",
  border: "var(--border)",
  accent: "var(--accent)",
  accent2: "var(--accent-2)",
};

const EASE = [0.22, 1, 0.36, 1] as const;

// Steps: 0-3 educational intro, 4-11 personalization, 12 generated profile.
const INTRO = 4;
const PROFILE_STEP = 12;
const TOTAL = 13;

type Q = { key: keyof RecoveryProfile; title: string; sub?: string; options: string[]; multi: boolean };
const QUESTIONS: Q[] = [
  { key: "primaryGoals", title: "What brings you here today?", sub: "Choose anything that fits.", options: GOAL_OPTIONS, multi: true },
  { key: "highRiskTimes", title: "When are urges strongest?", options: TIME_OPTIONS, multi: true },
  { key: "triggers", title: "What usually triggers an urge?", options: TRIGGER_OPTIONS, multi: true },
  { key: "locations", title: "Where do urges usually happen?", options: LOCATION_OPTIONS, multi: true },
  { key: "frequency", title: "How often does it happen right now?", sub: "No judgment — this just helps us support you.", options: FREQUENCY_OPTIONS, multi: false },
  { key: "successGoals", title: "What would success look like?", options: SUCCESS_OPTIONS, multi: true },
];

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState(0);
  const [dir, setDir] = useState(1);
  const [profile, setProfile] = useState<RecoveryProfile>({ ...DEFAULT_PROFILE });

  const go = (next: number) => { haptic("select"); setDir(next > screen ? 1 : -1); setScreen(next); };

  const finishAll = () => {
    haptic("success");
    const done = { ...profile, onboardingCompleted: true };
    saveProfile(done);
    onComplete({ reason: done.primaryGoals[0] || "", name: "You", timeOfDay: "" });
  };

  // Multi/single select toggles for the current question.
  const toggleMulti = (key: keyof RecoveryProfile, val: string) => {
    haptic("tap");
    setProfile((p) => {
      const arr = (p[key] as string[]) || [];
      return { ...p, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };
  const setSingle = (key: keyof RecoveryProfile, val: string) => {
    haptic("tap");
    setProfile((p) => ({ ...p, [key]: val }));
  };

  const variants = {
    enter: (d: number) => ({ x: reduced ? 0 : d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: reduced ? 0 : d * -40, opacity: 0 }),
  };

  const isIntro = screen < INTRO;
  const isProfile = screen === PROFILE_STEP;
  const qIndex = screen - INTRO; // 0..5 for questions, 6 = reminder, 7 = privacy
  const isQuestion = qIndex >= 0 && qIndex < QUESTIONS.length;
  const isReminder = qIndex === QUESTIONS.length;      // step 10
  const isPrivacy = qIndex === QUESTIONS.length + 1;   // step 11

  const derived = deriveRecovery(profile);

  return (
    <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 10000, display: "flex", flexDirection: "column", color: T.text }}>
      {/* Progress dots + skip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 22px 0", maxWidth: 480, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 260 }} aria-hidden>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <motion.span key={i} animate={{ width: i === screen ? 20 : 6, background: i <= screen ? T.accent : T.border }}
              transition={{ duration: 0.35, ease: EASE }} style={{ height: 6, borderRadius: 999, display: "block" }} />
          ))}
        </div>
        {!isProfile && (
          <button onClick={() => { haptic("tap"); saveProfile({ ...DEFAULT_PROFILE, onboardingCompleted: true }); onSkip(); }}
            style={{ background: "none", border: "none", color: T.muted, fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "8px 4px", minHeight: 40 }}>
            Skip
          </button>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 24px", maxWidth: 480, width: "100%", margin: "0 auto", overflowY: "auto" }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={screen} custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: reduced ? 0.15 : 0.4, ease: EASE }}
            style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: isIntro || isProfile || isPrivacy ? "center" : "left" }}>

            {/* ── Intro screens (educational) ── */}
            {isIntro && (
              <>
                <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
                  {screen === 0 && <OrbEmergence reduced={!!reduced} />}
                  {screen === 1 && <RippleArt reduced={!!reduced} />}
                  {screen === 2 && <ConnectedModules reduced={!!reduced} />}
                  {screen === 3 && <PrivacyArt reduced={!!reduced} />}
                </div>
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: 27, fontWeight: 700, color: T.text, lineHeight: 1.2, letterSpacing: "-0.01em", marginBottom: 14, maxWidth: 340 }}>{INTRO_COPY[screen].title}</h1>
                <p style={{ fontSize: 15.5, color: T.sub, lineHeight: 1.65, maxWidth: 330 }}>{INTRO_COPY[screen].body}</p>
              </>
            )}

            {/* ── Question screens ── */}
            {isQuestion && (
              <div style={{ width: "100%" }}>
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: 25, fontWeight: 700, color: T.text, lineHeight: 1.25, marginBottom: QUESTIONS[qIndex].sub ? 6 : 18 }}>{QUESTIONS[qIndex].title}</h1>
                {QUESTIONS[qIndex].sub && <p style={{ fontSize: 14, color: T.sub, marginBottom: 18 }}>{QUESTIONS[qIndex].sub}</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }} role={QUESTIONS[qIndex].multi ? "group" : "radiogroup"} aria-label={QUESTIONS[qIndex].title}>
                  {QUESTIONS[qIndex].options.map((opt) => {
                    const key = QUESTIONS[qIndex].key;
                    const selected = QUESTIONS[qIndex].multi ? ((profile[key] as string[]) || []).includes(opt) : profile[key] === opt;
                    return (
                      <button key={opt} onClick={() => QUESTIONS[qIndex].multi ? toggleMulti(key, opt) : setSingle(key, opt)}
                        role={QUESTIONS[qIndex].multi ? "checkbox" : "radio"} aria-checked={selected}
                        style={{
                          display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, minHeight: 52, cursor: "pointer", textAlign: "left",
                          background: selected ? "var(--accent-soft)" : T.surface,
                          border: `1.5px solid ${selected ? T.accent : T.border}`,
                          color: T.text, fontSize: 15, fontWeight: selected ? 600 : 500,
                          boxShadow: selected ? "var(--shadow-card)" : "none",
                        }}>
                        <span aria-hidden style={{ width: 22, height: 22, borderRadius: QUESTIONS[qIndex].multi ? 7 : "50%", flexShrink: 0, border: `2px solid ${selected ? T.accent : T.border}`, background: selected ? T.accent : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                          {selected && <Check size={13} strokeWidth={3.5} />}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Reminder screen ── */}
            {isReminder && (
              <div style={{ width: "100%" }}>
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: 25, fontWeight: 700, color: T.text, lineHeight: 1.25, marginBottom: 6 }}>When should RESET check in with you?</h1>
                <p style={{ fontSize: 14, color: T.sub, marginBottom: 18 }}>A gentle, optional nudge — you can change this anytime.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }} role="radiogroup" aria-label="Reminder time">
                  {REMINDER_OPTIONS.map((r) => {
                    const selected = profile.reminderTime === r.time;
                    return (
                      <button key={r.label} onClick={() => setSingle("reminderTime", r.time)} role="radio" aria-checked={selected}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 16, minHeight: 52, cursor: "pointer",
                          background: selected ? "var(--accent-soft)" : T.surface, border: `1.5px solid ${selected ? T.accent : T.border}`, color: T.text, fontSize: 15, fontWeight: selected ? 600 : 500 }}>
                        {r.label}
                        <span style={{ fontSize: 13, color: T.muted }}>{r.time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Privacy screen ── */}
            {isPrivacy && (
              <>
                <div style={{ marginBottom: 22 }}><PrivacyArt reduced={!!reduced} /></div>
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 12 }}>Your recovery stays private.</h1>
                <p style={{ fontSize: 15.5, color: T.sub, lineHeight: 1.6, maxWidth: 330, marginBottom: 16 }}>
                  Your information stays on your device unless you choose to back it up or share it. We never send it anywhere automatically.
                </p>
                <div style={{ width: "100%", maxWidth: 380 }}><PrivacyNotice /></div>
              </>
            )}

            {/* ── Generated Recovery Profile ── */}
            {isProfile && (
              <div style={{ width: "100%", maxWidth: 400 }}>
                <div style={{ marginBottom: 18 }}><AICoachOrb size={96} state="idle" /></div>
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: 26, fontWeight: 700, color: T.text, marginBottom: 16, textAlign: "center" }}>Your Recovery Profile</h1>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 16 }}>
                  <ProfileRow label="Primary goal" value={derived.primaryGoal} />
                  <ProfileRow label="Most common trigger" value={derived.topTrigger} />
                  <ProfileRow label="Highest-risk time" value={derived.highRiskTime} />
                  <ProfileRow label="Highest-risk place" value={derived.highRiskPlace} />
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 16, background: "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))", border: `1px solid ${T.border}`, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 4 }}>Recommended first step</div>
                  <div style={{ fontSize: 14.5, color: T.text, lineHeight: 1.5 }}>{derived.firstStep}</div>
                </div>
                <p style={{ fontSize: 13.5, color: T.sub, lineHeight: 1.55, textAlign: "center", padding: "0 8px" }}>{derived.confidence}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 24px 34px", maxWidth: 480, width: "100%", margin: "0 auto" }}>
        <motion.button
          whileTap={reduced ? undefined : { scale: 0.97 }}
          onClick={() => (isProfile ? finishAll() : go(screen + 1))}
          style={{
            width: "100%", padding: "17px 24px", borderRadius: 16, border: "none",
            background: "var(--grad-hero)", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 600,
            cursor: "pointer", letterSpacing: "0.01em", minHeight: 56, boxShadow: "var(--shadow-accent)",
          }}
        >
          {isProfile ? "Start my journey" : isPrivacy ? "Continue" : "Continue"}
        </motion.button>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 14, background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

const INTRO_COPY = [
  { title: "Quit porn. Rebuild control.", body: "RESET helps you understand urges, avoid triggers, and build healthier habits — one day at a time." },
  { title: "Get help when an urge hits.", body: "Use Calm Mode, breathing, reflection, and your AI coach before the urge takes over." },
  { title: "See what actually helps.", body: "Track moods, triggers, habits, and reflections to learn the patterns behind your porn use." },
  { title: "Private and judgment-free.", body: "Your recovery is personal. RESET keeps the experience discreet, supportive, and under your control." },
];

/* ─── Illustrations (inline SVG/CSS, reduced-motion aware) ─────────────────── */
function OrbEmergence({ reduced }: { reduced: boolean }) {
  return (
    <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(28,35,51,0.4) 0%, transparent 68%)" }}
        initial={reduced ? { opacity: 0 } : { opacity: 0.8, scale: 1.1 }} animate={{ opacity: 0, scale: 1.4 }} transition={{ duration: 1.6, ease: EASE }} />
      <motion.div initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: EASE }}>
        <AICoachOrb size={140} state="idle" />
      </motion.div>
    </div>
  );
}
function RippleArt({ reduced }: { reduced: boolean }) {
  return (
    <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div key={i} aria-hidden style={{ position: "absolute", borderRadius: "50%", border: "1.5px solid rgba(91,124,250,0.5)" }}
          initial={{ width: 24, height: 24, opacity: 0.7 }}
          animate={reduced ? { width: 56 + i * 40, height: 56 + i * 40, opacity: 0.4 } : { width: [24, 180], height: [24, 180], opacity: [0.6, 0] }}
          transition={reduced ? { duration: 0.4 } : { duration: 3, repeat: Infinity, delay: i * 0.75, ease: "easeOut" }} />
      ))}
      <div aria-hidden style={{ width: 24, height: 24, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fff, var(--accent))", boxShadow: "0 6px 20px rgba(91,124,250,0.5)" }} />
    </div>
  );
}
function ConnectedModules({ reduced }: { reduced: boolean }) {
  const nodes = [{ x: 0, y: -58 }, { x: 58, y: 0 }, { x: 0, y: 58 }, { x: -58, y: 0 }];
  const colors = ["var(--accent-2)", "var(--accent)", "var(--mint)", "var(--sky)"];
  return (
    <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {nodes.map((n, i) => (
        <motion.div key={i} aria-hidden style={{ position: "absolute", width: 32, height: 32, borderRadius: 11, background: `color-mix(in srgb, ${colors[i]} 15%, transparent)`, border: `1.5px solid ${colors[i]}`, transform: `translate(${n.x}px, ${n.y}px)` }}
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: EASE }} />
      ))}
      <div aria-hidden style={{ zIndex: 1 }}><AICoachOrb size={60} state="idle" /></div>
    </div>
  );
}
function PrivacyArt({ reduced }: { reduced: boolean }) {
  return (
    <div style={{ position: "relative", width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div aria-hidden style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, color-mix(in srgb, var(--accent-2) 18%, transparent), transparent 65%)", filter: "blur(8px)" }}
        animate={reduced ? undefined : { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      <motion.svg width="110" height="128" viewBox="0 0 120 140" fill="none" aria-hidden
        initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
        <defs><linearGradient id="shieldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" /><stop offset="1" stopColor="var(--accent-2)" /></linearGradient></defs>
        <path d="M60 6 L108 26 V70 C108 104 86 126 60 134 C34 126 12 104 12 70 V26 Z" fill="url(#shieldG)" opacity="0.14" stroke="url(#shieldG)" strokeWidth="2.5" />
        <path d="M44 70 L55 82 L78 56" stroke="url(#shieldG)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </motion.svg>
    </div>
  );
}
