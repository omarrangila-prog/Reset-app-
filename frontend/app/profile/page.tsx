"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function ProfilePage() {
  const { userId } = useAppStore();
  const [me, setMe] = useState<MeProfile | null>(null);

  useEffect(() => {
    if (userId) api.getMe().then(setMe).catch(() => {});
  }, [userId]);

  const stats = [
    { label: "Recovery Score", value: me ? `${me.disciplineScore}` : "—", accent: t.accent },
    { label: "Current Streak", value: me ? `${me.streak}d` : "—", accent: t.emerald },
    { label: "Best Streak", value: me ? `${me.longestStreak}d` : "—", accent: t.accent2 },
    { label: "Urges Faced", value: me ? `${me.totalUrges}` : "—", accent: t.sky },
  ];

  const links = [
    { href: "/profile/goals", label: "Your goals", icon: "◆" },
    { href: "/achievements", label: "Achievements", icon: "✦" },
    { href: "/habits", label: "Habits", icon: "◈" },
    { href: "/learn", label: "Learn", icon: "◇" },
    { href: "/journey/timeline", label: "Your journey", icon: "◔" },
    { href: "/profile/notifications", label: "Reminders", icon: "◒" },
    { href: "/profile/privacy", label: "Your privacy", icon: "○" },
  ];

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      {/* Profile hero */}
      <Reveal index={0}>
        <div className="mesh" style={{ borderRadius: 28, padding: "32px 24px", marginBottom: 20, textAlign: "center", boxShadow: t.shadowAccent }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: 84, height: 84, borderRadius: "50%", margin: "0 auto 14px", background: "rgba(255,255,255,0.22)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, backdropFilter: "blur(8px)" }} aria-hidden>
              🌿
            </div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Your journey</div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 }}>
              {me ? `Day ${me.streak} · keep rising` : "Private & anonymous"}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Stats grid */}
      <Reveal index={1}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {stats.map((s) => (
            <Card key={s.label} variant="soft">
              <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: t.fontHeading, fontSize: 26, fontWeight: 700, color: s.accent, letterSpacing: "-0.02em" }}>{s.value}</div>
            </Card>
          ))}
        </div>
      </Reveal>

      {/* Links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((l, i) => (
          <Reveal key={l.href} index={i + 2}>
            <Link href={l.href} style={{ display: "block" }}>
              <Card variant="soft">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: t.accentSoft, color: t.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }} aria-hidden>{l.icon}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: t.text }}>{l.label}</span>
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
