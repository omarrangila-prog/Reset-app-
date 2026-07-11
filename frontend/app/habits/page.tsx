"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Footprints, Sunrise, Moon, BookOpen, Sparkles, Plus } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Reveal, spring } from "@/components/ui/motion";
import { FeatureIntro } from "@/components/ui/FeatureIntro";
import { t } from "@/components/ui/theme";
import { api, HabitItem } from "@/lib/api";
import { haptic } from "@/lib/haptics";
import { useAppStore } from "@/lib/store";

// Map stored icon keys → lucide components (premium icon language, no emoji).
const ICONS: Record<string, typeof Footprints> = {
  walk: Footprints,
  reflect: Sunrise,
  sleep: Moon,
  read: BookOpen,
  spark: Sparkles,
};

function CompletionRing({ done, accent }: { done: boolean; accent: string }) {
  const size = 44, stroke = 3, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.border} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          animate={{ strokeDashoffset: done ? 0 : c }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: done ? accent : t.muted, fontSize: 15 }}>
        {done ? "✓" : ""}
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const { userId } = useAppStore();
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    // Don't get stuck on the skeleton: if the session isn't ready yet, keep
    // showing the skeleton but never hang — a short fallback ends loading.
    if (!userId) {
      const fallback = setTimeout(() => setLoading(false), 2500);
      return () => clearTimeout(fallback);
    }
    let done = false;
    api.getHabits().then((h) => { done = true; setHabits(h); }).catch(() => {}).finally(() => setLoading(false));
    // Safety timeout in case the request hangs.
    const t = setTimeout(() => { if (!done) setLoading(false); }, 6000);
    return () => clearTimeout(t);
  }, [userId]);

  const doneCount = habits.filter((h) => h.doneToday).length;
  const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

  const toggle = async (id: string) => {
    // haptic: satisfying confirm when completing, soft tap when un-completing
    const wasDone = habits.find((h) => h.id === id)?.doneToday;
    haptic(wasDone ? "tap" : "success");
    // optimistic
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, doneToday: !h.doneToday, streak: h.doneToday ? h.streak - 1 : h.streak + 1 } : h)));
    try {
      const updated = await api.toggleHabit(id);
      setHabits((hs) => hs.map((h) => (h.id === id ? updated : h)));
    } catch {
      // revert on failure
      api.getHabits().then(setHabits).catch(() => {});
    }
  };

  const create = async () => {
    const name = newName.trim();
    if (!name) { setCreating(false); return; }
    try {
      const h = await api.createHabit(name, "spark", t.accent);
      setHabits((hs) => [...hs, h]);
    } catch {}
    setNewName("");
    setCreating(false);
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <Reveal index={0}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: "-0.02em" }}>Habits</h1>
            <p style={{ fontSize: 13, color: t.sub, marginTop: 2 }}>{doneCount} of {habits.length} done today</p>
          </div>
          <div className="mesh" style={{ padding: "10px 16px", borderRadius: 16, color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: t.shadowAccent }}>
            <span style={{ position: "relative", zIndex: 1 }}>{pct}%</span>
          </div>
        </header>
      </Reveal>

      <FeatureIntro
        what="Small daily actions that make hard moments easier — like a short walk or getting to bed on time. Tap the circle when you do one."
        time="Under a minute"
        benefit="Each day you show up builds real momentum"
      />

      {loading ? (
        <div><SkeletonCard lines={2} /><SkeletonCard lines={3} /></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {habits.map((h, i) => {
            const Icon = ICONS[h.icon] ?? Sparkles;
            return (
              <Reveal key={h.id} index={i + 1}>
                <Card variant="soft" onClick={() => toggle(h.id)} ariaLabel={`Toggle ${h.name}`}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ width: 46, height: 46, borderRadius: 14, background: `${h.accent}18`, color: h.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden>
                      <Icon size={20} strokeWidth={2.2} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{h.name}</div>
                      <div style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>{h.streak} day streak</div>
                    </div>
                    <motion.div whileTap={{ scale: 0.9 }} transition={spring}>
                      <CompletionRing done={h.doneToday} accent={h.accent} />
                    </motion.div>
                  </div>
                </Card>
              </Reveal>
            );
          })}

          {creating ? (
            <Card variant="soft">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value.slice(0, 80))}
                onKeyDown={(e) => e.key === "Enter" && create()}
                placeholder="New habit name…"
                aria-label="New habit name"
                style={{ width: "100%", border: "none", outline: "none", background: "transparent", fontSize: 15, color: t.text, fontFamily: t.fontBody, marginBottom: 12 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={create} style={{ flex: 1, padding: "10px", background: t.gradHero, border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, cursor: "pointer", minHeight: 44 }}>Add</button>
                <button onClick={() => { setCreating(false); setNewName(""); }} style={{ flex: 1, padding: "10px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: 10, color: t.sub, cursor: "pointer", minHeight: 44 }}>Cancel</button>
              </div>
            </Card>
          ) : (
            <button
              onClick={() => setCreating(true)}
              style={{ width: "100%", marginTop: 4, padding: "16px", background: "transparent", border: `1.5px dashed ${t.borderMid}`, borderRadius: 16, color: t.accentText, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 52, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Plus size={18} /> Create a new habit
            </button>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
