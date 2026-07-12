"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Check, Focus, Moon, Shield, Heart, Brain, Sprout,
  Sunrise, Sun, Sunset, MoonStar, BookOpen, Briefcase, Shuffle,
  CloudRain, Coffee, User, Smartphone, Frown, HeartCrack, Wind, Repeat,
  Bed, Bath, Sofa, Monitor, MapPin, EyeOff, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AICoachOrb } from "@/components/ui/AICoachOrb";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { haptic } from "@/lib/haptics";
import {
  RecoveryProfile, DEFAULT_PROFILE, saveProfile, deriveRecovery,
} from "@/lib/recoveryProfile";

interface OnboardingFlowProps {
  onComplete: (data: { reason: string; name: string; timeOfDay: string }) => void;
  onSkip: () => void;
}

// Theme-aware tokens (CSS vars) — flow renders after the pre-paint theme script.
const T = {
  bg: "var(--splash-bg)",
  surface: "var(--bg-surface)",
  text: "var(--text)",
  sub: "var(--text-sub)",
  muted: "var(--text-muted)",
  border: "var(--border)",
  accent: "var(--accent)",
};

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Choice option = stored value + icon + label + supporting line ──────────────
interface Choice { value: string; label: string; desc?: string; Icon: LucideIcon }

// Presentation layer maps the model's stored string values to premium cards.
// (Values MUST match lib/recoveryProfile catalogs so derive/editor stay in sync.)
const GOALS: Choice[] = [
  { value: "I want better focus", label: "Better focus", desc: "Stay present, reduce distractions", Icon: Focus },
  { value: "I want healthier habits", label: "Healthier habits", desc: "Build routines that last", Icon: Sprout },
  { value: "I want better self-control", label: "More self-control", desc: "Feel steady in the moment", Icon: Shield },
  { value: "I want to reduce how often I watch", label: "Reduce the pattern", desc: "Loosen its hold gradually", Icon: Repeat },
  { value: "I want to quit porn", label: "A fresh start", desc: "Step away for good", Icon: Sprout },
  { value: "I'm just exploring", label: "Peace of mind", desc: "Understand yourself better", Icon: Brain },
];
const TIMES: Choice[] = [
  { value: "Morning", label: "Morning", Icon: Sunrise },
  { value: "Afternoon", label: "Afternoon", Icon: Sun },
  { value: "Evening", label: "Evening", Icon: Sunset },
  { value: "Late night", label: "Late night", Icon: MoonStar },
  { value: "After studying", label: "After studying", Icon: BookOpen },
  { value: "After work", label: "After work", Icon: Briefcase },
  { value: "Randomly", label: "Randomly", Icon: Shuffle },
];
const TRIGGERS: Choice[] = [
  { value: "Stress", label: "Stress", Icon: CloudRain },
  { value: "Boredom", label: "Boredom", Icon: Coffee },
  { value: "Loneliness", label: "Loneliness", Icon: User },
  { value: "Social media", label: "Endless scrolling", Icon: Smartphone },
  { value: "Sadness", label: "Feeling down", Icon: Frown },
  { value: "Feeling rejected", label: "Rejection", Icon: HeartCrack },
  { value: "Anxiety", label: "Anxiety", Icon: Wind },
  { value: "Habit", label: "Habit", Icon: Repeat },
];
const LOCATIONS: Choice[] = [
  { value: "Bedroom", label: "Bedroom", Icon: Bed },
  { value: "Bathroom", label: "Bathroom", Icon: Bath },
  { value: "Living room", label: "Living room", Icon: Sofa },
  { value: "Office", label: "Desk", Icon: Monitor },
  { value: "Anywhere", label: "Anywhere", Icon: MapPin },
  { value: "Prefer not to answer", label: "I'd rather not say", Icon: EyeOff },
];
const FREQUENCY: Choice[] = [
  { value: "Less than once a week", label: "Rarely", Icon: Clock },
  { value: "1–2 times per week", label: "Sometimes", Icon: Clock },
  { value: "3–5 times per week", label: "A few times each week", Icon: Clock },
  { value: "Almost every day", label: "Almost daily", Icon: Clock },
  { value: "Prefer not to answer", label: "I'd rather not answer", Icon: EyeOff },
];
const SUCCESS: Choice[] = [
  { value: "Feel more in control", label: "Feeling free", desc: "Lighter, more in charge", Icon: Sprout },
  { value: "Build healthier habits", label: "Better discipline", desc: "Small steps, repeated", Icon: Shield },
  { value: "Reduce guilt", label: "More peace", desc: "Quieter, kinder to yourself", Icon: Brain },
  { value: "Sleep better", label: "Better sleep", desc: "Restful nights", Icon: Moon },
  { value: "Improve relationships", label: "Better relationships", desc: "More present with others", Icon: Heart },
  { value: "Improve my focus", label: "Better focus", desc: "Clear and steady", Icon: Focus },
];

// Reminder uses time strings (matches REMINDER_OPTIONS in the lib).
const REMINDERS: { time: string; label: string; Icon: LucideIcon }[] = [
  { time: "08:00", label: "Morning", Icon: Sunrise },
  { time: "14:00", label: "Afternoon", Icon: Sun },
  { time: "21:00", label: "Evening", Icon: Sunset },
  { time: "22:30", label: "I'll choose a time", Icon: Clock },
];

interface QuestionDef {
  key: keyof RecoveryProfile;
  headline: string;
  sub: string;
  choices: Choice[];
  multi: boolean;
  reaction: string; // caption when a choice is made
}
const QUESTIONS: QuestionDef[] = [
  { key: "primaryGoals", headline: "What would you love to change first?", sub: "Everyone's journey is different. Tell us what matters most.", choices: GOALS, multi: true, reaction: "A good place to begin. We'll shape your journey around this." },
  { key: "highRiskTimes", headline: "When does it feel hardest?", sub: "We want to understand your rhythm, not judge it.", choices: TIMES, multi: true, reaction: "Noted. We'll be gentler around these hours." },
  { key: "triggers", headline: "What usually comes before an urge?", sub: "Most urges begin with a feeling.", choices: TRIGGERS, multi: true, reaction: "Seeing this early gives you a head start." },
  { key: "locations", headline: "Where do you usually notice these moments?", sub: "Small changes to your space make recovery easier.", choices: LOCATIONS, multi: true, reaction: "We'll suggest small changes here." },
  { key: "frequency", headline: "Tell us where you are today.", sub: "No judgment. Just honesty.", choices: FREQUENCY, multi: false, reaction: "Thank you for your honesty." },
  { key: "successGoals", headline: "Imagine yourself six months from now.", sub: "What would make you proud?", choices: SUCCESS, multi: true, reaction: "We'll keep this in sight." },
];

const INTRO = 3; // three swipeable storytelling slides, then personalization begins
const PROFILE_STEP = INTRO + QUESTIONS.length + 2; // after questions + reminder + privacy
const TOTAL = PROFILE_STEP + 1;
const SWIPE_THRESHOLD = 56; // px of horizontal drag before a slide changes

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState(0);
  const [dir, setDir] = useState(1);
  const [profile, setProfile] = useState<RecoveryProfile>({ ...DEFAULT_PROFILE });
  const [caption, setCaption] = useState("");
  const [orbPulse, setOrbPulse] = useState(0);

  const go = (next: number) => { haptic("select"); setDir(next > screen ? 1 : -1); setCaption(""); setScreen(next); };

  // Intro carousel navigation (swipe + dots + keyboard). Bounded to intro range.
  const goIntro = (next: number) => { if (next < 0 || next > INTRO - 1) return; go(next); };
  const onIntroDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipe = Math.abs(info.offset.x) * 0.6 + Math.abs(info.velocity.x) * 0.08;
    if (swipe < SWIPE_THRESHOLD) return; // ignore small/accidental drags
    if (info.offset.x < 0) goIntro(screen + 1); // swipe left → next
    else goIntro(screen - 1); // swipe right → previous
  };
  const onIntroKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goIntro(screen + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goIntro(screen - 1); }
  };

  const finishAll = () => {
    haptic("success");
    const done = { ...profile, onboardingCompleted: true };
    saveProfile(done);
    onComplete({ reason: done.primaryGoals[0] || "", name: "You", timeOfDay: "" });
  };

  const react = (reaction: string) => { setCaption(reaction); setOrbPulse((n) => n + 1); haptic("tap"); };
  const toggleMulti = (key: keyof RecoveryProfile, val: string, reaction: string) => {
    setProfile((p) => {
      const arr = (p[key] as string[]) || [];
      const has = arr.includes(val);
      if (!has) react(reaction);
      return { ...p, [key]: has ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };
  const setSingle = (key: keyof RecoveryProfile, val: string, reaction: string) => { react(reaction); setProfile((p) => ({ ...p, [key]: val })); };

  const variants = {
    enter: (d: number) => ({ x: reduced ? 0 : d * 36, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: reduced ? 0 : d * -36, opacity: 0 }),
  };

  const isIntro = screen < INTRO;
  const qIndex = screen - INTRO;
  const isQuestion = qIndex >= 0 && qIndex < QUESTIONS.length;
  const isReminder = qIndex === QUESTIONS.length;
  const isPrivacy = qIndex === QUESTIONS.length + 1;
  const isProfile = screen === PROFILE_STEP;

  const derived = deriveRecovery(profile);

  return (
    <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 10000, display: "flex", flexDirection: "column", color: T.text }}>
      {/* Progress + skip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "calc(env(safe-area-inset-top) + 22px) 24px 0", maxWidth: 520, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 240 }} aria-hidden>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <motion.span key={i} animate={{ width: i === screen ? 22 : 6, background: i <= screen ? T.accent : T.border }}
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

      <div tabIndex={0} role={isIntro ? "region" : "group"} aria-roledescription={isIntro ? "carousel" : undefined}
        aria-label={isIntro ? "Introduction" : "Building your recovery blueprint"}
        onKeyDown={isIntro ? onIntroKey : undefined}
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: isIntro || isPrivacy || isProfile ? "center" : "flex-start", alignItems: "center", padding: "clamp(16px, 5vh, 40px) 24px 0", maxWidth: 520, width: "100%", margin: "0 auto", overflowY: "auto", overflowX: "hidden", touchAction: isIntro ? "pan-y" : undefined }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={screen} custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
            transition={{ duration: reduced ? 0.15 : 0.42, ease: EASE }}
            drag={isIntro && !reduced ? "x" : false}
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={isIntro ? onIntroDragEnd : undefined}
            aria-roledescription={isIntro ? "slide" : undefined}
            aria-label={isIntro ? `Slide ${screen + 1} of ${INTRO}` : undefined}
            style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: isIntro || isPrivacy || isProfile ? "center" : "left", cursor: isIntro && !reduced ? "grab" : undefined }}>

            {/* ── Intro ── */}
            {isIntro && (
              <>
                <div style={{ minHeight: "clamp(140px, 26vh, 190px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "clamp(24px, 4vh, 34px)", pointerEvents: "none" }}>
                  <AICoachOrb size={148} state="idle" />
                </div>
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: "clamp(23px, 6.6vw, 30px)", fontWeight: 700, color: T.text, lineHeight: 1.22, letterSpacing: "-0.01em", marginBottom: 16, maxWidth: 380 }}>{INTRO_COPY[screen].title}</h1>
                <p style={{ fontSize: "clamp(15px, 4vw, 16.5px)", color: T.sub, lineHeight: 1.65, maxWidth: 360 }}>{INTRO_COPY[screen].body}</p>
              </>
            )}

            {/* ── Question ── */}
            {isQuestion && (
              <div style={{ width: "100%" }}>
                <OrbHeader pulse={orbPulse} caption={caption} reduced={!!reduced} />
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: "clamp(21px, 6vw, 25px)", fontWeight: 700, color: T.text, lineHeight: 1.3, marginBottom: 8, maxWidth: 420 }}>{QUESTIONS[qIndex].headline}</h1>
                <p style={{ fontSize: "clamp(14px, 3.6vw, 15px)", color: T.sub, lineHeight: 1.6, marginBottom: 24, maxWidth: 380 }}>{QUESTIONS[qIndex].sub}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }} role={QUESTIONS[qIndex].multi ? "group" : "radiogroup"} aria-label={QUESTIONS[qIndex].headline}>
                  {QUESTIONS[qIndex].choices.map((c) => {
                    const key = QUESTIONS[qIndex].key;
                    const selected = QUESTIONS[qIndex].multi ? ((profile[key] as string[]) || []).includes(c.value) : profile[key] === c.value;
                    return (
                      <ChoiceCard key={c.value} choice={c} selected={selected} multi={QUESTIONS[qIndex].multi} reduced={!!reduced}
                        onClick={() => QUESTIONS[qIndex].multi ? toggleMulti(key, c.value, QUESTIONS[qIndex].reaction) : setSingle(key, c.value, QUESTIONS[qIndex].reaction)} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Reminder ── */}
            {isReminder && (
              <div style={{ width: "100%" }}>
                <OrbHeader pulse={orbPulse} caption={caption} reduced={!!reduced} />
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: "clamp(21px, 6vw, 25px)", fontWeight: 700, color: T.text, lineHeight: 1.3, marginBottom: 8, maxWidth: 420 }}>When would a gentle reminder help most?</h1>
                <p style={{ fontSize: "clamp(14px, 3.6vw, 15px)", color: T.sub, lineHeight: 1.6, marginBottom: 24, maxWidth: 380 }}>Optional, and easy to change later.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }} role="radiogroup" aria-label="Reminder time">
                  {REMINDERS.map((r) => (
                    <ChoiceCard key={r.time} choice={{ value: r.time, label: r.label, Icon: r.Icon }} selected={profile.reminderTime === r.time} multi={false} reduced={!!reduced}
                      onClick={() => setSingle("reminderTime", r.time, "We'll be here at the right time.")} trailing={r.time} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Privacy ── */}
            {isPrivacy && (
              <>
                <div style={{ marginBottom: 28 }}><AICoachOrb size={110} state="idle" /></div>
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: "clamp(23px, 6.5vw, 27px)", fontWeight: 700, color: T.text, marginBottom: 16, maxWidth: 360 }}>Your recovery stays private.</h1>
                <p style={{ fontSize: "clamp(15px, 4vw, 16px)", color: T.sub, lineHeight: 1.7, maxWidth: 340, marginBottom: 20 }}>
                  Everything stays on your device unless you choose to back it up or share it. Nothing is ever sent automatically.
                </p>
                <div style={{ width: "100%", maxWidth: 400 }}><PrivacyNotice /></div>
              </>
            )}

            {/* ── Blueprint ── */}
            {isProfile && (
              <div style={{ width: "100%", maxWidth: 420 }}>
                <motion.div key={orbPulse} initial={reduced ? undefined : { scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ease: EASE }} style={{ marginBottom: 22 }}>
                  <AICoachOrb size={104} state="idle" />
                </motion.div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 6 }}>Your recovery blueprint</div>
                <h1 style={{ fontFamily: "'Sora','DM Sans',sans-serif", fontSize: "clamp(23px, 6.5vw, 27px)", fontWeight: 700, color: T.text, marginBottom: 22 }}>We know where to begin.</h1>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left", marginBottom: 18 }}>
                  <BlueprintRow label="Biggest goal" value={goalLabel(derived.primaryGoal)} />
                  <BlueprintRow label="Most difficult time" value={derived.highRiskTime} />
                  <BlueprintRow label="Strongest trigger" value={derived.topTrigger} />
                </div>
                <div style={{ padding: "16px 18px", borderRadius: 18, background: "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))", border: `1px solid ${T.border}`, textAlign: "left", marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 6 }}>First small win</div>
                  <div style={{ fontSize: "clamp(14px, 3.8vw, 15px)", color: T.text, lineHeight: 1.55 }}>{derived.firstStep}</div>
                </div>
                <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.6, textAlign: "center" }}>Small changes become lasting habits. Let&apos;s take the first step together.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div style={{ height: 20 }} />
      </div>

      {/* CTA */}
      <div style={{ padding: "0 24px calc(env(safe-area-inset-bottom) + 30px)", maxWidth: 520, width: "100%", margin: "0 auto" }}>
        {/* Carousel dots — intro only, centered above the CTA */}
        {isIntro && (
          <div role="tablist" aria-label="Intro slides" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 20 }}>
            {Array.from({ length: INTRO }).map((_, i) => {
              const activeDot = i === screen;
              return (
                <button key={i} role="tab" aria-selected={activeDot} aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goIntro(i)}
                  style={{ padding: 8, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
                  <motion.span aria-hidden animate={{ width: activeDot ? 24 : 8, background: i <= screen ? T.accent : T.border }}
                    transition={{ duration: 0.35, ease: EASE }} style={{ height: 8, borderRadius: 999, display: "block" }} />
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Back — available whenever there's somewhere to go back to */}
          {screen > 0 && !isProfile && (
            <motion.button
              whileTap={reduced ? undefined : { scale: 0.97 }}
              onClick={() => go(screen - 1)}
              aria-label="Go back"
              style={{
                padding: "18px 22px", borderRadius: 18, border: `1px solid ${T.border}`,
                background: "var(--bg-surface)", color: T.sub, fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 600,
                cursor: "pointer", minHeight: 58, flexShrink: 0,
              }}
            >
              Back
            </motion.button>
          )}
          <motion.button
            whileTap={reduced ? undefined : { scale: 0.97 }}
            onClick={() => (isProfile ? finishAll() : go(screen + 1))}
            style={{
              flex: 1, padding: "18px 24px", borderRadius: 18, border: "none",
              background: "var(--grad-hero)", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 600,
              cursor: "pointer", letterSpacing: "0.01em", minHeight: 58, boxShadow: "var(--shadow-accent)",
            }}
          >
            {isProfile ? "Begin my journey" : screen === INTRO - 1 ? "Build My Recovery Plan" : "Continue"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ── Orb that reacts to each selection with a caption ── */
function OrbHeader({ pulse, caption, reduced }: { pulse: number; caption: string; reduced: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22, minHeight: 96 }}>
      <motion.div key={pulse} initial={reduced ? undefined : { scale: 0.94 }} animate={reduced ? undefined : { scale: [0.94, 1.06, 1] }} transition={{ duration: 0.6, ease: EASE }}>
        <AICoachOrb size={72} state="idle" />
      </motion.div>
      <AnimatePresence mode="wait">
        {caption && (
          <motion.p key={caption} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ ease: EASE }}
            style={{ fontSize: 13.5, color: "var(--text-sub)", fontWeight: 600, marginTop: 10, textAlign: "center", maxWidth: 300, lineHeight: 1.45 }}>
            {caption}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Premium selection card ── */
function ChoiceCard({ choice, selected, multi, reduced, onClick, trailing }: { choice: Choice; selected: boolean; multi: boolean; reduced: boolean; onClick: () => void; trailing?: string }) {
  const { Icon } = choice;
  return (
    <motion.button onClick={onClick} role={multi ? "checkbox" : "radio"} aria-checked={selected}
      whileTap={reduced ? undefined : { scale: 0.985 }} whileHover={reduced ? undefined : { y: -2 }} transition={{ type: "spring", stiffness: 420, damping: 28 }}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 18, cursor: "pointer", textAlign: "left", width: "100%",
        background: selected ? "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))" : "var(--bg-surface)",
        border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
        color: "var(--text)",
        boxShadow: selected ? "var(--shadow-card)" : "-5px -5px 12px var(--neu-light), 6px 6px 14px var(--neu-dark)",
      }}>
      {/* glass/neu icon container */}
      <span aria-hidden style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: selected ? "var(--grad-hero)" : "var(--bg-tint)",
        color: selected ? "#fff" : "var(--accent)",
        boxShadow: selected ? "var(--shadow-accent)" : "inset 1px 1px 0 var(--neu-light), inset -2px -2px 5px var(--neu-dark)",
      }}>
        <Icon size={22} strokeWidth={2} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "clamp(15px, 4vw, 16px)", fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{choice.label}</span>
        {choice.desc && <span style={{ display: "block", fontSize: 13, color: "var(--text-sub)", marginTop: 2, lineHeight: 1.4 }}>{choice.desc}</span>}
      </span>
      {trailing && <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>{trailing}</span>}
      {/* animated check */}
      <span aria-hidden style={{ width: 24, height: 24, borderRadius: multi ? 8 : "50%", flexShrink: 0, border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`, background: selected ? "var(--accent)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        <AnimatePresence>{selected && (
          <motion.span initial={reduced ? undefined : { scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ display: "inline-flex" }}>
            <Check size={14} strokeWidth={3.5} />
          </motion.span>
        )}</AnimatePresence>
      </span>
    </motion.button>
  );
}

function BlueprintRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 16, background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", textAlign: "right", lineHeight: 1.35 }}>{value}</span>
    </div>
  );
}

// Map a stored goal value to its premium label for the blueprint.
function goalLabel(value: string): string {
  const found = GOALS.find((g) => g.value === value);
  return found ? found.label : value;
}

// Three storytelling slides: what RESET is → help in the moment → lasting change.
const INTRO_COPY = [
  {
    title: "Replace habits that hold you back.",
    body: "RESET helps you understand compulsive habits, reduce porn use, and build healthier routines — one step at a time.",
  },
  {
    title: "Support when an urge appears.",
    body: "Use Calm Mode, your personal urge plan, short delays, reflection, and the AI coach to respond differently in difficult moments.",
  },
  {
    title: "Turn small choices into lasting change.",
    body: "Learn your triggers, track what helps, and build routines that give you more control over your time, focus, and wellbeing.",
  },
];
