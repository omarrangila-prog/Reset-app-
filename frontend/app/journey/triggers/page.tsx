"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Coffee, CloudRain, Moon, Users, Frown, Clock, HeartCrack } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { spring } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";

const CATALOG = [
  { type: "STRESS", label: "Stress", Icon: Zap, color: "#EC6A5E" },
  { type: "BOREDOM", label: "Boredom", Icon: Coffee, color: "#F0B24B" },
  { type: "LONELINESS", label: "Loneliness", Icon: CloudRain, color: "#4FB6F5" },
  { type: "LATE_NIGHT", label: "Late night", Icon: Moon, color: "#7C6BF0" },
  { type: "SOCIAL_REJECTION", label: "Feeling rejected", Icon: Users, color: "#E5687C" },
  { type: "SADNESS", label: "Sadness", Icon: Frown, color: "#8A93A6" },
  { type: "IDLE_TIME", label: "Idle time", Icon: Clock, color: "#34C9A3" },
  { type: "ANXIETY", label: "Anxiety", Icon: HeartCrack, color: "#5B7CFA" },
];

export default function TriggersPage() {
  const { userId } = useAppStore();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    api.getMe().then(setMe).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  const freq: Record<string, number> = {};
  (me?.triggerPatterns ?? []).forEach((p) => { freq[p.type] = p.frequency; });
  const topType = (me?.triggerPatterns ?? []).slice().sort((a, b) => b.frequency - a.frequency)[0]?.type;

  const add = (type: string) => {
    setLogged((l) => ({ ...l, [type]: true }));
    if (userId) api.logTrigger(type).catch(() => {});
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "24px 22px 130px", position: "relative", zIndex: 1 }}>
      {/* Editorial masthead */}
      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Link href="/journey" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: t.shadowSm, flexShrink: 0 }}>‹</Link>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: t.muted }}>What sets you off</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: 6 }}>Know your<br />patterns.</h1>
        </div>
      </motion.header>

      {/* Insight line */}
      {topType && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ fontSize: 15, color: t.sub, lineHeight: 1.6, marginBottom: 28 }}>
          Lately your urges lean toward{" "}
          <span style={{ color: t.accent, fontWeight: 700 }}>{CATALOG.find((c) => c.type === topType)?.label.toLowerCase()}</span>. Noting them here helps you get ahead.
        </motion.p>
      )}

      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: t.muted, marginBottom: 12 }}>Common triggers</div>

      {loading ? (
        <div><SkeletonCard lines={2} /><SkeletonCard lines={2} /></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {CATALOG.map((c, i) => {
            const { Icon } = c;
            const count = freq[c.type];
            const isTop = c.type === topType;
            const done = logged[c.type];
            return (
              <motion.button
                key={c.type}
                onClick={() => add(c.type)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ...spring }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex", alignItems: "center", gap: 14, width: "100%",
                  padding: "14px 16px", borderRadius: 18, cursor: "pointer", textAlign: "left",
                  background: isTop ? `linear-gradient(180deg,#FFFFFF,#F6F4FF)` : "linear-gradient(180deg,#FFFFFF,#F7F8FD)",
                  border: `1px solid ${isTop ? `${c.color}33` : t.border}`,
                  boxShadow: `0 4px 14px rgba(46,62,120,0.05), inset 0 1px 0 rgba(255,255,255,0.9)`,
                }}
              >
                <span style={{ width: 42, height: 42, borderRadius: 13, background: `${c.color}18`, color: c.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden>
                  <Icon size={19} strokeWidth={2.1} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{c.label}</div>
                  {count ? <div style={{ fontSize: 12, color: t.muted, marginTop: 1 }}>Noted {count}×{isTop ? " · your top one" : ""}</div> : null}
                </div>
                <span style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: done ? c.color : "transparent", border: done ? "none" : `1.5px solid ${t.borderMid}`, color: "#fff", fontSize: 15 }} aria-hidden>
                  {done ? "✓" : "+"}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
