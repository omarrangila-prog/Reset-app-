"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { Reveal } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";

const sections = [
  { href: "/journey/mood", label: "Mood", desc: "How are you feeling right now?", icon: "◐", accent: t.accent },
  { href: "/journey/history", label: "How you've felt", desc: "See your check-ins over time", icon: "◑", accent: t.sky },
  { href: "/journey/triggers", label: "What sets you off", desc: "Spot your patterns and plan for them", icon: "◓", accent: t.vuln },
  { href: "/urge", label: "Calm Mode", desc: "Ride out an urge, one breath at a time", icon: "◯", accent: t.accent2 },
  { href: "/journey/journal", label: "Journal", desc: "A private place to write — only you can see it", icon: "❏", accent: t.mint },
  { href: "/journey/timeline", label: "Your journey", desc: "Your story so far", icon: "◔", accent: t.sky },
];

export default function JourneyPage() {
  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "24px 20px 120px", position: "relative", zIndex: 1 }}>
      <Reveal index={0}>
        <header style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Your journey</h1>
          <p style={{ fontSize: 14, color: t.sub, marginTop: 4 }}>Small reflections build lasting change.</p>
        </header>
      </Reveal>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sections.map((s, i) => (
          <Reveal key={s.href} index={i + 1}>
            <Link href={s.href} style={{ display: "block" }}>
              <Card variant="soft">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ width: 46, height: 46, borderRadius: 14, background: `${s.accent}18`, color: s.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }} aria-hidden>
                    {s.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>{s.label}</div>
                    <div style={{ fontSize: 13, color: t.sub, marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <span style={{ color: t.muted, fontSize: 18 }} aria-hidden>›</span>
                </div>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
