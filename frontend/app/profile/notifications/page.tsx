"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Moon, Sunrise, Droplets, Wind } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { Reveal, spring } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";
import { BackButton } from "@/components/ui/BackButton";

// Premium wellness cards — beautiful moments, not notifications.
const RITUALS = [
  { key: "winddown", Icon: Moon, title: "Wind down", line: "Your future self will thank you.", cta: "Begin", color: t.accent2, href: "/urge" },
  { key: "morning", Icon: Sunrise, title: "Morning reset", line: "Two minutes to start with intention.", cta: "Start", color: t.accent, href: "/journey/mood" },
  { key: "breathe", Icon: Wind, title: "Take a breath", line: "A calm minute, whenever you need it.", cta: "Breathe", color: t.mint, href: "/urge" },
  { key: "hydrate", Icon: Droplets, title: "Hydrate", line: "Small actions create lasting change.", cta: "Done", color: t.sky, href: "/habits" },
];

const PREFS = [
  { key: "checkin", label: "Daily check-in", desc: "A gentle nudge to log how you're doing" },
  { key: "night", label: "Late-night support", desc: "A caring reminder when urges are most likely" },
  { key: "wins", label: "Celebrate small wins", desc: "A note when you reach a milestone" },
];

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} role="switch" aria-checked={on} aria-label={label}
      style={{ width: 48, height: 28, borderRadius: 999, border: "none", background: on ? t.accent : t.borderMid, position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s", minHeight: 28 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}

export default function NotificationsPage() {
  const [state, setState] = useState<Record<string, boolean>>({ checkin: true, night: true, wins: true });
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem("notif_prefs") || "null"); if (s) setState(s); } catch {}
  }, []);

  const toggle = (k: string) => {
    const next = { ...state, [k]: !state[k] };
    setState(next);
    localStorage.setItem("notif_prefs", JSON.stringify(next));
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <BackButton fallbackHref="/profile" />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Gentle rituals</div>
          <div style={{ fontSize: 12, color: t.muted }}>Small, kind moments for your day</div>
        </div>
      </header>

      {/* Wellness cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {RITUALS.map((r, i) => {
          const { Icon } = r;
          const complete = done[r.key];
          return (
            <Reveal key={r.key} index={i}>
              <Card variant="soft" style={{ overflow: "hidden", position: "relative" }}>
                <div aria-hidden style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${r.color}22, transparent 70%)` }} />
                <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
                  <span style={{ width: 48, height: 48, borderRadius: 16, background: `${r.color}1c`, color: r.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden>
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: t.sub, marginTop: 2 }}>{r.line}</div>
                  </div>
                  {r.cta === "Done" ? (
                    <motion.button whileTap={{ scale: 0.94 }} transition={spring}
                      onClick={() => setDone((d) => ({ ...d, [r.key]: !d[r.key] }))}
                      style={{ padding: "9px 16px", borderRadius: 999, border: "none", background: r.color, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 40, flexShrink: 0 }}>
                      {complete ? "✓" : r.cta}
                    </motion.button>
                  ) : (
                    <Link href={r.href} style={{ padding: "9px 16px", borderRadius: 999, background: r.color, color: "#fff", fontSize: 13, fontWeight: 600, minHeight: 40, display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
                      {r.cta}
                    </Link>
                  )}
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>

      {/* Preferences */}
      <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 12 }}>What reminds you</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PREFS.map((o) => (
          <Card key={o.key} variant="soft">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{o.label}</div>
                <div style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>{o.desc}</div>
              </div>
              <Toggle on={!!state[o.key]} onClick={() => toggle(o.key)} label={o.label} />
            </div>
          </Card>
        ))}
      </div>
      <p style={{ fontSize: 12, color: t.muted, marginTop: 16, textAlign: "center" }}>You&apos;re always in control. These stay on your device.</p>

      <BottomNav />
    </div>
  );
}
