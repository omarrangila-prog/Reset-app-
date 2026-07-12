"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, Target, BookOpen } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { t } from "@/components/ui/theme";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { DEMO_PROFILE } from "@/lib/demoProfile";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProfilePage() {
  const { userId } = useAppStore();
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => {
    if (userId) api.getMe().then(setMe).catch(() => {});
  }, [userId]);

  // Real data where available; fall back to the central seeded profile so the
  // page always looks complete. `isDemo` is true when no real activity yet.
  const hasReal = !!me && (me.streak > 0 || me.totalUrges > 0);
  const isDemo = !hasReal;
  const streak = hasReal ? me!.streak : DEMO_PROFILE.streak;
  const longest = hasReal ? me!.longestStreak : DEMO_PROFILE.longestStreak;
  const urgesWorked = hasReal ? me!.totalUrges : DEMO_PROFILE.urgesWorkedThrough;

  const milestones = [
    { day: 1, label: "First day", done: streak >= 1 },
    { day: 3, label: "3 days", done: streak >= 3 },
    { day: 7, label: "One week", done: streak >= 7 },
    { day: 14, label: "Two weeks", done: streak >= 14 },
    { day: 30, label: "One month", done: streak >= 30 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 22px 130px", position: "relative", zIndex: 1 }}>

        {/* ── HERO: recovery portrait ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE }}
          className="mesh pearl" style={{ borderRadius: 30, padding: "30px 24px 28px", marginBottom: 18, boxShadow: t.shadowAccent, textAlign: "center", position: "relative" }}>
          {isDemo && (
            <span style={{ position: "absolute", top: 14, right: 14, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, padding: "3px 9px", backdropFilter: "blur(8px)" }}>
              Sample profile
            </span>
          )}
          {/* Identity object — a calm liquid-glass orb (replaces the old leaf) */}
          <div aria-hidden style={{ width: 92, height: 92, borderRadius: "50%", margin: "0 auto 16px", background: "radial-gradient(circle at 34% 28%, #fff, rgba(200,210,255,0.7) 34%, #9B7BF2 100%)", boxShadow: "inset 0 4px 14px rgba(255,255,255,0.6), inset 0 -8px 18px rgba(91,124,250,0.3), 0 14px 30px rgba(91,124,250,0.4)" }} />
          <div style={{ color: "#fff", fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>{DEMO_PROFILE.name}</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, marginTop: 4, fontWeight: 500 }}>{DEMO_PROFILE.chapter}</div>
          <div style={{ color: "rgba(255,255,255,0.92)", fontSize: 15, marginTop: 14, lineHeight: 1.5, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
            You have returned to your intention <strong>{streak} days</strong> in a row.
          </div>
        </motion.div>

        {/* ── TWO COMPACT STATS ── */}
        <Reveal delay={0.06}>
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <Stat value={`${streak}`} unit="days" label="Current streak" accent="var(--accent)" />
            <Stat value={`${longest}`} unit="days" label="Longest streak" accent="var(--accent-2)" />
          </div>
        </Reveal>

        {/* ── MILESTONE STRIP ── */}
        <Reveal delay={0.1}>
          <div className="pearl" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 22, padding: "18px 18px", marginBottom: 18, boxShadow: t.shadowSm }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 16 }}>Milestones</div>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              <div aria-hidden style={{ position: "absolute", top: 13, left: 12, right: 12, height: 2, background: t.border }} />
              {milestones.map((m) => (
                <div key={m.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                    background: m.done ? "var(--grad-hero)" : t.bgTint, color: m.done ? "#fff" : t.muted,
                    boxShadow: m.done ? "0 4px 10px rgba(91,124,250,0.3)" : "none", border: m.done ? "none" : `1px solid ${t.border}` }}>
                    {m.done ? "✓" : m.day}
                  </div>
                  <span style={{ fontSize: 10.5, color: m.done ? t.text : t.muted, fontWeight: m.done ? 600 : 500, whiteSpace: "nowrap" }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── WIDE REFLECTION / PATTERNS PANEL ── */}
        <Reveal delay={0.14}>
          <div className="pearl" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 22, padding: "20px 20px", marginBottom: 18, boxShadow: t.shadowSm }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 12 }}>What’s been helping</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              <MiniFact label="Reflections this month" value={`${DEMO_PROFILE.reflectionsThisMonth}`} />
              <MiniFact label="Calm sessions" value={`${DEMO_PROFILE.calmSessions}`} />
              <MiniFact label="Urges worked through" value={`${urgesWorked}`} />
            </div>
            <div style={{ height: 1, background: t.border, margin: "16px 0" }} />
            <div style={{ fontSize: 14.5, color: t.text, lineHeight: 1.55 }}>
              Your strongest improvement is your <strong>{DEMO_PROFILE.strongestImprovement.toLowerCase()}</strong>. When an urge hit, <strong>{DEMO_PROFILE.helpfulAction.toLowerCase()}</strong> helped most.
            </div>
          </div>
        </Reveal>

        {/* ── FEATURED GOAL ── */}
        <Reveal delay={0.18}>
          <Link href="/profile/goals" style={{ display: "block", marginBottom: 18 }}>
            <div style={{ borderRadius: 22, padding: "20px 20px", background: "linear-gradient(180deg, var(--accent-soft), var(--bg-surface))", border: `1px solid ${t.border}`, boxShadow: t.shadowSm, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ width: 44, height: 44, borderRadius: 14, background: "var(--grad-hero)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 6px 14px rgba(91,124,250,0.28)" }}>
                <Target size={20} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent-text)" }}>Current goal</div>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: t.text, marginTop: 3 }}>{DEMO_PROFILE.currentGoal}</div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          </Link>
        </Reveal>

        {/* ── ACHIEVEMENT + LEARN PREVIEW (two modules) ── */}
        <Reveal delay={0.22}>
          <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
            <PreviewTile href="/achievements" icon={<Sparkles size={20} color="var(--accent-2)" />} title="Achievements" sub="See your collection" />
            <PreviewTile href="/learn" icon={<BookOpen size={20} color="var(--accent)" />} title="Learn" sub="Lessons for recovery" />
          </div>
        </Reveal>

        {/* ── QUICK LINKS ── */}
        <Reveal delay={0.26}>
          <div className="pearl" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 22, padding: "6px 18px", boxShadow: t.shadowSm }}>
            <LinkRow href="/journey/timeline" label="Your journey" />
            <Divider />
            <LinkRow href="/garden" label="Recovery garden" />
            <Divider />
            <LinkRow href="/wins" label="Victories" />
            <Divider />
            <LinkRow href="/search" label="Search" />
            <Divider />
            <LinkRow href="/profile/accountability" label="Accountability" />
            <Divider />
            <LinkRow href="/profile/letter" label="Letter to future me" />
            <Divider />
            <LinkRow href="/urge/plan" label="My urge plan" />
            <Divider />
            <LinkRow href="/profile/notifications" label="Reminders" />
            <Divider />
            <LinkRow href="/settings" label="Settings & privacy" />
          </div>
        </Reveal>
      </div>

      <BottomNav />
    </div>
  );
}

/* ── blocks ── */
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: EASE }}>{children}</motion.div>;
}
function Stat({ value, unit, label, accent }: { value: string; unit: string; label: string; accent: string }) {
  return (
    <div className="pearl" style={{ flex: 1, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: "18px 16px", boxShadow: t.shadowSm }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontFamily: t.fontHeading, fontSize: 30, fontWeight: 700, color: accent, letterSpacing: "-0.02em" }}>{value}</span>
        <span style={{ fontSize: 13, color: t.muted, fontWeight: 600 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 12.5, color: t.sub, marginTop: 4 }}>{label}</div>
    </div>
  );
}
function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{value}</div>
      <div style={{ fontSize: 11.5, color: t.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}
function PreviewTile({ href, icon, title, sub }: { href: string; icon: ReactNode; title: string; sub: string }) {
  return (
    <Link href={href} className="neu-btn" style={{ flex: 1, borderRadius: 20, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 8, color: t.text }}>
      {icon}
      <span style={{ fontSize: 14.5, fontWeight: 700 }}>{title}</span>
      <span style={{ fontSize: 12, color: t.sub }}>{sub}</span>
    </Link>
  );
}
function Divider() { return <div style={{ height: 1, background: t.border, margin: "0 -18px" }} />; }
function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", padding: "15px 0", color: t.text }}>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 600 }}>{label}</span>
      <ChevronRight size={18} color="var(--text-muted)" />
    </Link>
  );
}
