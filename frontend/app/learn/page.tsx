"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { BottomNav } from "@/components/ui/BottomNav";
import { Reveal } from "@/components/ui/motion";
import { FeatureIntro } from "@/components/ui/FeatureIntro";
import { t } from "@/components/ui/theme";
import { LESSONS } from "@/lib/lessons";

const categoryColor: Record<string, string> = {
  Understand: t.accent,
  "In the moment": t.urge,
  "Build habits": t.emerald,
};

export default function LearnPage() {
  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "24px 20px 120px", position: "relative", zIndex: 1 }}>
      <Reveal index={0}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Learn</h1>
          <p style={{ fontSize: 14, color: t.sub, marginTop: 2 }}>Short reads that make this easier to understand.</p>
        </header>
      </Reveal>

      <FeatureIntro
        what="Bite-sized lessons in plain language — no lectures, no jargon. Read one when you have a spare minute."
        time="2–3 minutes each"
        benefit="Understand yourself and feel less alone in it"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LESSONS.map((l, i) => (
          <Reveal key={l.slug} index={i + 1}>
            <Link href={`/learn/${l.slug}`} style={{ display: "block" }}>
              <Card variant="soft">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: categoryColor[l.category], textTransform: "uppercase", letterSpacing: "0.04em" }}>{l.category}</span>
                  <span style={{ fontSize: 11, color: t.muted }}>{l.minutes} min</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: t.text, marginBottom: 4 }}>{l.title}</div>
                <div style={{ fontSize: 13, color: t.sub, lineHeight: 1.5 }}>{l.summary}</div>
              </Card>
            </Link>
          </Reveal>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
