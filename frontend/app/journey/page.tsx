"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloudMoon, PenLine, Compass, Wind, LineChart, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { Reveal } from "@/components/ui/motion";
import { RecoveryOrb } from "@/components/ui/RecoveryOrb";
import { t } from "@/components/ui/theme";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";

// Which chapter of the journey the user is in, from real streak data.
function chapter(streak: number) {
  if (streak >= 30) return { name: "Mastery", note: "You've made this a way of life." };
  if (streak >= 14) return { name: "Consistency", note: "You're building something that lasts." };
  if (streak >= 3) return { name: "Control", note: "You're learning to ride the waves." };
  return { name: "Awareness", note: "Noticing is where it all begins." };
}

export default function JourneyPage() {
  const { userId } = useAppStore();
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => {
    if (userId) api.getMe().then(setMe).catch(() => {});
  }, [userId]);

  const streak = me?.streak ?? 0;
  const score = me?.disciplineScore ?? 0;
  const ch = chapter(streak);
  const lastMood = me?.logs?.find((l) => l.type === "CHECK_IN" && l.emotion)?.emotion;

  const tools = [
    { href: "/journey/triggers", label: "Triggers", desc: "What sets you off", Icon: Compass, color: t.vuln },
    { href: "/urge", label: "Calm mode", desc: "Ride out an urge", Icon: Wind, color: t.accent2 },
    { href: "/journey/history", label: "Mood history", desc: "How you've felt", Icon: LineChart, color: t.sky },
    { href: "/journey/timeline", label: "Recovery map", desc: "Your milestones", Icon: Sparkles, color: t.emerald },
  ];

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "24px 20px 120px", position: "relative", zIndex: 1 }}>
      {/* Editorial masthead */}
      <Reveal index={0}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: t.muted }}>Your journey</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: 6, marginBottom: 20 }}>
          Chapter: {ch.name}.
        </h1>
      </Reveal>

      {/* HERO — orb + chapter story (asymmetric) */}
      <Reveal index={1}>
        <div className="mesh pearl" style={{ borderRadius: 28, padding: "24px", marginBottom: 14, display: "flex", alignItems: "center", gap: 18, boxShadow: t.shadowAccent, position: "relative" }}>
          <div style={{ position: "relative", zIndex: 1, flexShrink: 0 }}>
            <RecoveryOrb score={score} size={110} label="" />
          </div>
          <div style={{ position: "relative", zIndex: 1, color: "#fff" }}>
            <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{streak} days in</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 4, lineHeight: 1.5 }}>{ch.note}</div>
          </div>
        </div>
      </Reveal>

      {/* FEATURED — mood check-in (wide) */}
      <Reveal index={2}>
        <Link href="/journey/mood" style={{ display: "block", marginBottom: 14 }}>
          <div style={{ background: "var(--card-sculpted)", border: `1px solid ${t.border}`, borderRadius: 24, padding: 20, boxShadow: t.shadowSm, display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 52, height: 52, borderRadius: 18, background: `${t.accent}18`, color: t.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden>
              <CloudMoon size={24} strokeWidth={2} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: t.text }}>How are you feeling?</div>
              <div style={{ fontSize: 13, color: t.sub, marginTop: 2 }}>
                {lastMood ? `Last time you felt ${lastMood.toLowerCase()} — check in again` : "A 10-second check-in"}
              </div>
            </div>
            <span style={{ color: t.muted, fontSize: 20 }} aria-hidden>›</span>
          </div>
        </Link>
      </Reveal>

      {/* FEATURED — journal (wide, warm) */}
      <Reveal index={3}>
        <Link href="/journey/journal" style={{ display: "block", marginBottom: 20 }}>
          <div style={{ background: "var(--card-sculpted)", border: "1px solid #EFE7DA", borderRadius: 24, padding: 20, boxShadow: t.shadowSm, display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" }}>
            <span aria-hidden style={{ position: "absolute", top: -2, right: 22, width: 16, height: 32, background: t.gradHero, clipPath: "polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)" }} />
            <span style={{ width: 52, height: 52, borderRadius: 18, background: "#F0E7D6", color: "#B08D57", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden>
              <PenLine size={22} strokeWidth={2} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: t.text }}>My safe space</div>
              <div style={{ fontSize: 13, color: t.sub, marginTop: 2 }}>Write a private reflection</div>
            </div>
            <span style={{ color: t.muted, fontSize: 20 }} aria-hidden>›</span>
          </div>
        </Link>
      </Reveal>

      {/* TOOLS — 2×2 compact grid */}
      <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 12 }}>Explore</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {tools.map((tool, i) => {
          const { Icon } = tool;
          return (
            <Reveal key={tool.href} index={i + 4}>
              <Link href={tool.href} style={{ display: "block" }}>
                <div className="pearl" style={{ background: "var(--card-sculpted)", border: `1px solid ${t.border}`, borderRadius: 20, padding: 16, boxShadow: `0 4px 14px rgba(46,62,120,0.05), inset 0 1px 0 rgba(255,255,255,0.9)`, minHeight: 108, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                  <span style={{ width: 40, height: 40, borderRadius: 13, background: `${tool.color}18`, color: tool.color, display: "inline-flex", alignItems: "center", justifyContent: "center" }} aria-hidden>
                    <Icon size={19} strokeWidth={2.1} />
                  </span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{tool.label}</div>
                    <div style={{ fontSize: 12, color: t.sub, marginTop: 1 }}>{tool.desc}</div>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
