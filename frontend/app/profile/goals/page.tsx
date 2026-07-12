"use client";

import { Illustration } from "@/components/ui/Illustration";
import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, PenLine, Footprints, Smartphone, CalendarCheck } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { Reveal, spring } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";
import { BackButton } from "@/components/ui/BackButton";
import { haptic } from "@/lib/haptics";

interface Goal {
  id: string;
  title: string;
  why: string;
  Icon: typeof Moon;
  color: string;
  done: number;
  target: number;
  unit: string;
}

// Seeded goals with realistic progress so the screen is alive on first open.
const SEED: Goal[] = [
  { id: "sleep", title: "Sleep before 11 PM", why: "Earlier nights make tomorrow's urges quieter.", Icon: Moon, color: "#7C6BF0", done: 5, target: 7, unit: "nights" },
  { id: "journal", title: "Journal four times this week", why: "Writing helps you spot what's really going on.", Icon: PenLine, color: "#5B7CFA", done: 3, target: 4, unit: "entries" },
  { id: "walk", title: "Take a walk after work", why: "Moving your body settles the mind.", Icon: Footprints, color: "#34C9A3", done: 2, target: 5, unit: "walks" },
  { id: "phone", title: "No phone after 10 PM", why: "Idle late-night scrolling is a common trigger.", Icon: Smartphone, color: "#EC6A5E", done: 4, target: 7, unit: "nights" },
  { id: "weekend", title: "Stay steady on weekends", why: "Weekends have more free time and more urges.", Icon: CalendarCheck, color: "#F0B24B", done: 1, target: 2, unit: "days" },
];

function Ring({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const stroke = 6, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}22`} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: t.text }}>
        {Math.round(pct * 100)}%
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(SEED);
  const featured = goals[0];
  const rest = goals.slice(1);
  const fPct = featured.done / featured.target;

  const logProgress = (id: string) => {
    haptic("success");
    setGoals((gs) => gs.map((g) => (g.id === id && g.done < g.target ? { ...g, done: g.done + 1 } : g)));
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "22px 20px 120px", position: "relative", zIndex: 1 }}>
      <Reveal index={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <BackButton fallbackHref="/profile" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: t.muted }}>Your goals</div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Small aims, real change.</h1>
          </div>
        </div>
      </Reveal>

      {/* FEATURED goal hero */}
      <Reveal index={1}>
        <div className="mesh pearl" style={{ borderRadius: 28, padding: 24, marginBottom: 22, boxShadow: t.shadowAccent, position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{ position: "absolute", top: -24, right: -20, opacity: 0.5, pointerEvents: "none" }}>
            <Illustration name="goals" size={140} />
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", marginBottom: 10 }}>This week&apos;s focus</div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ background: "rgba(255,255,255,0.16)", borderRadius: "50%", padding: 4 }}>
                <Ring pct={fPct} color="#fff" size={76} />
              </div>
              <div style={{ flex: 1, color: "#fff" }}>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>{featured.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>{featured.done} of {featured.target} {featured.unit} · {featured.why}</div>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.96 }} transition={spring} onClick={() => logProgress(featured.id)}
              style={{ marginTop: 18, width: "100%", padding: "13px", borderRadius: 14, border: "none", background: "rgba(255,255,255,0.92)", color: t.accent, fontSize: 14, fontWeight: 700, cursor: "pointer", minHeight: 46 }}>
              {featured.done >= featured.target ? "Done for this week 🎉" : "Log progress"}
            </motion.button>
          </div>
        </div>
      </Reveal>

      {/* Other goals */}
      <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 12 }}>Also working on</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rest.map((g, i) => {
          const { Icon } = g;
          const pct = g.done / g.target;
          const complete = g.done >= g.target;
          return (
            <Reveal key={g.id} index={i + 2}>
              <div style={{ background: "var(--card-sculpted)", border: `1px solid ${t.border}`, borderRadius: 20, padding: 16, boxShadow: t.shadowSm, display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ width: 44, height: 44, borderRadius: 14, background: `${g.color}18`, color: g.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden>
                  <Icon size={20} strokeWidth={2} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{g.title}</div>
                  <div style={{ fontSize: 12, color: t.sub, marginTop: 3 }}>{g.done}/{g.target} {g.unit}</div>
                  <div style={{ height: 6, background: t.bgTint, borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} style={{ height: "100%", background: g.color, borderRadius: 3 }} />
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} transition={spring} onClick={() => logProgress(g.id)} aria-label={`Log progress for ${g.title}`}
                  style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, border: complete ? "none" : `1.5px solid ${g.color}`, background: complete ? g.color : "transparent", color: complete ? "#fff" : g.color, fontSize: 18, cursor: "pointer" }}>
                  {complete ? "✓" : "+"}
                </motion.button>
              </div>
            </Reveal>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: t.muted, marginTop: 18, textAlign: "center", lineHeight: 1.5 }}>
        Goals are gentle aims, not tests. Progress here is yours to shape.
      </p>

      <BottomNav />
    </div>
  );
}
