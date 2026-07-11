"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { Reveal } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";
import { LESSONS } from "@/lib/lessons";

const categoryColor: Record<string, string> = {
  Understand: t.accent,
  "In the moment": t.urge,
  "Build habits": t.emerald,
};

export default function LearnPage() {
  const [read, setRead] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      setRead(JSON.parse(localStorage.getItem("lessons_read") || "{}"));
    } catch {}
  }, []);

  const featured = LESSONS[0];
  const rest = LESSONS.slice(1);
  const readCount = Object.values(read).filter(Boolean).length;
  // "Continue" = first unread lesson (seeded feel even for new users).
  const continueLesson = LESSONS.find((l) => !read[l.slug]) ?? LESSONS[0];

  const categories = Array.from(new Set(LESSONS.map((l) => l.category)));

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "24px 20px 120px", position: "relative", zIndex: 1 }}>
      {/* Masthead */}
      <Reveal index={0}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: t.muted }}>Learn</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: 6, marginBottom: 6 }}>
          Understand<br />what helps.
        </h1>
        <p style={{ fontSize: 14, color: t.sub, marginBottom: 22 }}>
          {readCount > 0 ? `${readCount} of ${LESSONS.length} read · keep going` : "Short, plain-language reads. No lectures."}
        </p>
      </Reveal>

      {/* FEATURED lesson — editorial hero */}
      <Reveal index={1}>
        <Link href={`/learn/${featured.slug}`} style={{ display: "block", marginBottom: 24 }}>
          <div className="mesh pearl" style={{ borderRadius: 28, padding: 24, boxShadow: t.shadowAccent, position: "relative", minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <span style={{ display: "inline-block", padding: "5px 12px", borderRadius: 999, background: "rgba(255,255,255,0.22)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 14 }}>
                Start here · {featured.minutes} min
              </span>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 6 }}>{featured.title}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>{featured.summary}</div>
            </div>
          </div>
        </Link>
      </Reveal>

      {/* CONTINUE reading */}
      <Reveal index={2}>
        <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 10 }}>Continue reading</div>
        <Link href={`/learn/${continueLesson.slug}`} style={{ display: "block", marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 20, background: "var(--bg-surface)", border: `1px solid ${t.border}`, boxShadow: t.shadowSm }}>
            <span style={{ width: 46, height: 46, borderRadius: 14, background: `${categoryColor[continueLesson.category]}18`, color: categoryColor[continueLesson.category], display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }} aria-hidden>▷</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{continueLesson.title}</div>
              <div style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>{continueLesson.category} · {continueLesson.minutes} min</div>
            </div>
            <span style={{ color: t.muted, fontSize: 20 }} aria-hidden>›</span>
          </div>
        </Link>
      </Reveal>

      {/* By category */}
      {categories.map((cat, ci) => {
        const items = rest.filter((l) => l.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: categoryColor[cat] }} aria-hidden />
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{cat}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((l, i) => (
                <Reveal key={l.slug} index={ci + i}>
                  <Link href={`/learn/${l.slug}`} style={{ display: "block" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, background: "var(--bg-surface)", border: `1px solid ${t.border}`, boxShadow: t.shadowSm, opacity: read[l.slug] ? 0.7 : 1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{l.title}</div>
                        <div style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>{l.minutes} min{read[l.slug] ? " · read" : ""}</div>
                      </div>
                      <span style={{ fontSize: 16, color: read[l.slug] ? t.emerald : t.muted }} aria-hidden>{read[l.slug] ? "✓" : "›"}</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        );
      })}

      <BottomNav />
    </div>
  );
}
