"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { useToast } from "@/components/ui/SaveToast";
import {
  RecoveryProfile, DEFAULT_PROFILE, loadProfile, saveProfile, deriveRecovery,
  GOAL_OPTIONS, TIME_OPTIONS, TRIGGER_OPTIONS, LOCATION_OPTIONS, FREQUENCY_OPTIONS, SUCCESS_OPTIONS, REMINDER_OPTIONS,
} from "@/lib/recoveryProfile";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Settings → Recovery Profile editor. Reads/writes the single centralized
 * RecoveryProfile; changes immediately re-derive recommendations. Theme-aware.
 */
export default function RecoveryProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<RecoveryProfile>({ ...DEFAULT_PROFILE });

  useEffect(() => { setProfile(loadProfile()); }, []);

  const toggle = (key: keyof RecoveryProfile, val: string) =>
    setProfile((p) => {
      const arr = (p[key] as string[]) || [];
      return { ...p, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  const setSingle = (key: keyof RecoveryProfile, val: string) => setProfile((p) => ({ ...p, [key]: val }));

  const save = () => {
    saveProfile({ ...profile, onboardingCompleted: true });
    toast("Saved", { kind: "success", subtitle: "Your recommendations are updated." });
  };

  const derived = deriveRecovery(profile);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/settings" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Recovery profile</div>
            <div style={{ fontSize: 12, color: t.muted }}>Personalizes your recommendations</div>
          </div>
        </header>

        {/* Live recommendation preview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }}
          style={{ borderRadius: 20, padding: "16px 18px", margin: "16px 0 24px", background: "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))", border: `1px solid ${t.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent-text)", marginBottom: 6 }}>Your focus right now</div>
          <p style={{ fontSize: 14.5, color: t.text, lineHeight: 1.5 }}>{derived.firstStep}</p>
        </motion.div>

        <Group title="What brings you here">
          <Chips options={GOAL_OPTIONS} selected={profile.primaryGoals} onToggle={(v) => toggle("primaryGoals", v)} />
        </Group>
        <Group title="When urges are strongest">
          <Chips options={TIME_OPTIONS} selected={profile.highRiskTimes} onToggle={(v) => toggle("highRiskTimes", v)} />
        </Group>
        <Group title="What usually triggers them">
          <Chips options={TRIGGER_OPTIONS} selected={profile.triggers} onToggle={(v) => toggle("triggers", v)} />
        </Group>
        <Group title="Where it usually happens">
          <Chips options={LOCATION_OPTIONS} selected={profile.locations} onToggle={(v) => toggle("locations", v)} />
        </Group>
        <Group title="How often (optional)">
          <Chips options={FREQUENCY_OPTIONS} selected={profile.frequency ? [profile.frequency] : []} onToggle={(v) => setSingle("frequency", profile.frequency === v ? "" : v)} single />
        </Group>
        <Group title="What success looks like">
          <Chips options={SUCCESS_OPTIONS} selected={profile.successGoals} onToggle={(v) => toggle("successGoals", v)} />
        </Group>
        <Group title="Daily check-in">
          <Chips options={REMINDER_OPTIONS.map((r) => r.label)} selected={REMINDER_OPTIONS.filter((r) => r.time === profile.reminderTime).map((r) => r.label)}
            onToggle={(label) => { const r = REMINDER_OPTIONS.find((x) => x.label === label); if (r) setSingle("reminderTime", r.time); }} single />
        </Group>

        <button onClick={save} style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", background: "var(--grad-hero)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 54, boxShadow: "var(--shadow-accent)", marginTop: 8 }}>
          Save profile
        </button>
      </div>
      <BottomNav />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
function Chips({ options, selected, onToggle, single }: { options: string[]; selected: string[]; onToggle: (v: string) => void; single?: boolean }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role={single ? "radiogroup" : "group"}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} onClick={() => onToggle(o)} role={single ? "radio" : "checkbox"} aria-checked={on}
            style={{ padding: "9px 14px", borderRadius: 999, minHeight: 40, cursor: "pointer", fontSize: 13.5, fontWeight: on ? 600 : 500,
              background: on ? "var(--accent-soft)" : t.surface, border: `1.5px solid ${on ? t.accent : t.border}`, color: on ? "var(--accent-text)" : t.text }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}
