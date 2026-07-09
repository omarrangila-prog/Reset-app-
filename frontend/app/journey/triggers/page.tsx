"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { FeatureIntro } from "@/components/ui/FeatureIntro";
import { t } from "@/components/ui/theme";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const LABELS: Record<string, string> = {
  BOREDOM: "Boredom", STRESS: "Stress", LONELINESS: "Loneliness", ANXIETY: "Anxiety",
  ANGER: "Anger", SADNESS: "Sadness", LATE_NIGHT: "Late nights", IDLE_TIME: "Idle time",
  SOCIAL_REJECTION: "Feeling rejected",
};
// Plain, supportive suggestion per trigger — no clinical language.
const TIPS: Record<string, string> = {
  BOREDOM: "When there's nothing to do, urges creep in. Keep a short list of small things you enjoy.",
  STRESS: "Stress makes your brain want a quick escape. A short walk or a few slow breaths helps a lot.",
  LONELINESS: "Reaching out to one person — even a quick text — takes the edge off more than you'd think.",
  ANXIETY: "When you feel wound up, slow breathing tells your body it's safe. Try four in, six out.",
  ANGER: "Anger passes faster when you move — walk it off, splash cold water, step outside.",
  SADNESS: "Be gentle with yourself. Sadness isn't a problem to fix, just a feeling to sit with for a bit.",
  LATE_NIGHT: "Late nights are the hardest. An earlier bedtime quietly makes tomorrow easier.",
  IDLE_TIME: "Empty time with your phone is risky. Charge it in another room during those hours.",
  SOCIAL_REJECTION: "Rejection stings. It doesn't mean anything's wrong with you — it just hurts for a while.",
};

export default function TriggersPage() {
  const { userId } = useAppStore();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    api.getMe().then(setMe).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  const patterns = (me?.triggerPatterns ?? []).slice().sort((a, b) => b.frequency - a.frequency);
  const top = patterns[0];

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Link href="/journey" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: t.shadowSm }}>‹</Link>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>What sets you off</div>
          <div style={{ fontSize: 12, color: t.muted }}>Your patterns, gently spotted</div>
        </div>
      </header>

      <FeatureIntro
        what="When you note what triggered an urge, it shows up here — so you can spot patterns and plan for them."
        time="See it anytime"
        benefit="Get ahead of urges before they hit"
      />

      {loading ? (
        <div><SkeletonCard lines={2} /><SkeletonCard lines={3} /></div>
      ) : patterns.length === 0 ? (
        <Card variant="tint" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: t.text, marginBottom: 4 }}>No patterns yet</div>
          <div style={{ fontSize: 13, color: t.sub }}>Next time you use calm mode, note what set it off — patterns will show up here.</div>
        </Card>
      ) : (
        <>
          {/* Headline insight */}
          {top && (
            <Card variant="soft" style={{ marginBottom: 16, borderLeft: `3px solid ${t.accent2}` }}>
              <div style={{ fontSize: 11, color: t.accent2, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>What we noticed</div>
              <p style={{ fontSize: 15, color: t.text, lineHeight: 1.6 }}>
                <strong>{LABELS[top.type] || top.type}</strong> comes up most for you. {TIPS[top.type] || ""}
              </p>
            </Card>
          )}

          {/* Full list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {patterns.map((p) => {
              const max = patterns[0].frequency || 1;
              return (
                <Card key={p.id} variant="soft">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{LABELS[p.type] || p.type}</span>
                    <span style={{ fontSize: 12, color: t.muted }}>{p.frequency}×</span>
                  </div>
                  <div style={{ height: 8, background: t.bgTint, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: `${(p.frequency / max) * 100}%`, height: "100%", background: t.gradHero, borderRadius: 4 }} />
                  </div>
                  <p style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}>{TIPS[p.type] || ""}</p>
                </Card>
              );
            })}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
