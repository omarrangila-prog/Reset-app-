"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Shield, Mic2, Download, Trash2, ChevronRight, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { BottomNav } from "@/components/ui/BottomNav";
import { ThemeSwitch } from "@/components/ui/ThemeSwitch";
import { APP_BUILD_VERSION } from "@/lib/version";
import { DEMO_PROFILE } from "@/lib/demoProfile";
import { t } from "@/components/ui/theme";

const EASE = [0.22, 1, 0.36, 1] as const;

function stateLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Improving";
  if (score >= 40) return "Building";
  return "Getting started";
}

export default function SettingsPage() {
  const { user } = useAppStore();
  const clearSession = useAppStore((s) => s.clearSession);
  const [status, setStatus] = useState<"idle" | "deleting" | "deleted" | "error">("idle");
  const [confirming, setConfirming] = useState(false);

  // Notification/voice prefs (persisted locally; wired to real settings elsewhere).
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    spokenReplies: true, morningCheckin: true, eveningReflection: true, urgeSupport: true, appLock: false, notifPrivacy: true,
  });
  const toggle = (k: string) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  // The app is anonymous (device identity), so the display name is always the
  // friendly sample name; streak/score come from real data when present.
  const name = DEMO_PROFILE.name;
  const streak = user?.streak ?? DEMO_PROFILE.streak;
  const score = user?.disciplineScore ?? 68;

  const handleExport = () => { window.location.href = api.exportUrl; };
  const handleDelete = async () => {
    setStatus("deleting");
    try {
      await api.deleteAccount();
      clearSession();
      localStorage.clear();
      if ("indexedDB" in window) indexedDB.deleteDatabase("reset-identity");
      setStatus("deleted");
    } catch { setStatus("error"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: t.fontBody }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "26px 22px 130px" }}>

        {/* ── HERO ── */}
        <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: t.muted }}>Your RESET</div>
          <h1 style={{ fontFamily: t.fontHeading, fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: 8, color: t.text }}>
            Shape the app around<br />how you want to recover.
          </h1>
        </motion.header>

        {/* ── PROFILE SUMMARY (featured module) ── */}
        <Reveal delay={0.06}>
          <div className="mesh pearl" style={{ borderRadius: 26, padding: "20px 20px", marginBottom: 22, boxShadow: t.shadowAccent, display: "flex", alignItems: "center", gap: 16 }}>
            <div aria-hidden style={{ width: 58, height: 58, borderRadius: "50%", flexShrink: 0, background: "radial-gradient(circle at 34% 30%, #fff, rgba(200,210,255,0.7) 40%, #9B7BF2 100%)", boxShadow: "inset 0 3px 10px rgba(255,255,255,0.6), 0 8px 20px rgba(91,124,250,0.35)" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", marginTop: 2 }}>
                Day {streak} · {stateLabel(score)}
              </div>
            </div>
            <Link href="/profile" aria-label="Edit profile" style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.32)", borderRadius: 999, padding: "8px 14px", minHeight: 40, display: "inline-flex", alignItems: "center", backdropFilter: "blur(8px)" }}>
              Edit
            </Link>
          </div>
        </Reveal>

        {/* ── APPEARANCE (featured — the physical switch) ── */}
        <Group title="Appearance" delay={0.1}>
          <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "6px 4px" }}>
            <ThemeSwitch />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Theme</div>
              <div style={{ fontSize: 13, color: t.sub, marginTop: 4, lineHeight: 1.5 }}>
                Flip up for light, down for dark. Choose <em>System</em> to follow your device automatically.
              </div>
            </div>
          </div>
        </Group>

        {/* ── VOICE ── */}
        <Group title="Voice" delay={0.14}>
          <ToggleRow icon={<Mic2 size={17} />} label="Spoken responses" desc="Hear the coach reply aloud" on={prefs.spokenReplies} onClick={() => toggle("spokenReplies")} />
          <Divider />
          <NavRow icon={<Mic2 size={17} />} label="Speech & voice" desc="Language and voice selection" href="/coach/voice" />
        </Group>

        {/* ── REMINDERS ── */}
        <Group title="Reminders" delay={0.18}>
          <ToggleRow icon={<Bell size={17} />} label="Morning check-in" desc="A gentle start to the day" on={prefs.morningCheckin} onClick={() => toggle("morningCheckin")} />
          <Divider />
          <ToggleRow icon={<Bell size={17} />} label="Evening reflection" desc="Wind down and reflect" on={prefs.eveningReflection} onClick={() => toggle("eveningReflection")} />
          <Divider />
          <ToggleRow icon={<Bell size={17} />} label="Urge support" desc="Nudges when you may need them" on={prefs.urgeSupport} onClick={() => toggle("urgeSupport")} />
        </Group>

        {/* ── PRIVACY ── */}
        <Group title="Privacy" delay={0.22}>
          <ToggleRow icon={<Lock size={17} />} label="App lock" desc="Require unlock to open RESET" on={prefs.appLock} onClick={() => toggle("appLock")} />
          <Divider />
          <ToggleRow icon={<Shield size={17} />} label="Notification privacy" desc="Hide details on the lock screen" on={prefs.notifPrivacy} onClick={() => toggle("notifPrivacy")} />
          <Divider />
          <NavRow icon={<Shield size={17} />} label="Privacy details" desc="How your data is handled" href="/profile/privacy" />
        </Group>

        {/* ── DATA (two compact tactile modules) ── */}
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.muted, margin: "26px 4px 12px" }}>Data</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
          <button onClick={handleExport} className="neu-btn" style={{ flex: 1, borderRadius: 20, padding: "18px 14px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, cursor: "pointer", color: t.text }}>
            <Download size={20} color="var(--accent)" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Export data</span>
            <span style={{ fontSize: 12, color: t.sub, textAlign: "left" }}>Download everything as JSON</span>
          </button>
          <button onClick={() => setConfirming(true)} className="neu-btn" style={{ flex: 1, borderRadius: 20, padding: "18px 14px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, cursor: "pointer", color: t.text }}>
            <Trash2 size={20} color="var(--danger)" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Delete data</span>
            <span style={{ fontSize: 12, color: t.sub, textAlign: "left" }}>Erase your account permanently</span>
          </button>
        </div>

        {/* Delete confirm */}
        {confirming && status !== "deleted" && (
          <div role="alertdialog" aria-label="Confirm delete" className="pearl" style={{ background: t.surface, border: `1px solid ${t.danger}55`, borderRadius: 20, padding: 20, marginBottom: 22 }}>
            <p style={{ color: t.text, fontWeight: 600, marginBottom: 14 }}>Delete your account and all data? This can’t be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleDelete} disabled={status === "deleting"} style={{ flex: 1, padding: "13px 16px", background: t.danger, color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44, opacity: status === "deleting" ? 0.7 : 1 }}>
                {status === "deleting" ? "Deleting…" : "Yes, delete permanently"}
              </button>
              <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: "13px 16px", background: "transparent", color: t.sub, border: `1px solid ${t.border}`, borderRadius: 12, fontSize: 14, cursor: "pointer", minHeight: 44 }}>
                Keep my account
              </button>
            </div>
            {status === "error" && <p role="alert" style={{ color: "var(--danger)", fontSize: 13, marginTop: 12 }}>Something went wrong. Please try again.</p>}
          </div>
        )}
        {status === "deleted" && (
          <div className="pearl" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 20, padding: 20, marginBottom: 22, color: "var(--recovery)" }}>
            Your account and all data have been permanently deleted. Take care of yourself.
          </div>
        )}

        {/* ── ABOUT ── */}
        <Group title="About" delay={0.26}>
          <NavRow label="Privacy policy" href="/profile/privacy" />
          <Divider />
          <NavRow label="Support" href="/coach" />
          <Divider />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 4px" }}>
            <span style={{ fontSize: 14, color: t.sub }}>Version</span>
            <span style={{ fontSize: 13, color: t.muted, fontVariantNumeric: "tabular-nums" }}>1.0 · Build {APP_BUILD_VERSION}</span>
          </div>
        </Group>
      </div>

      <BottomNav />
    </div>
  );
}

/* ── Building blocks ── */
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5, ease: EASE }}>
      {children}
    </motion.div>
  );
}

function Group({ title, children, delay = 0 }: { title: string; children: ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: t.muted, margin: "0 4px 12px" }}>{title}</div>
      <div className="pearl" style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 22, padding: "6px 18px", marginBottom: 22, boxShadow: t.shadowSm }}>
        {children}
      </div>
    </Reveal>
  );
}

function Divider() {
  return <div style={{ height: 1, background: t.border, margin: "0 -18px" }} />;
}

function ToggleRow({ icon, label, desc, on, onClick }: { icon?: ReactNode; label: string; desc?: string; on: boolean; onClick: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0" }}>
      {icon && <span style={{ color: "var(--accent)", flexShrink: 0 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{label}</div>
        {desc && <div style={{ fontSize: 12.5, color: t.sub, marginTop: 1 }}>{desc}</div>}
      </div>
      <button onClick={onClick} role="switch" aria-checked={on} aria-label={label}
        style={{ width: 48, height: 28, borderRadius: 999, border: "none", background: on ? "var(--accent)" : t.borderMid, position: "relative", cursor: "pointer", flexShrink: 0, transition: "background 0.2s", minHeight: 28 }}>
        <span aria-hidden style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s cubic-bezier(0.22,1,0.36,1)", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }} />
      </button>
    </div>
  );
}

function NavRow({ icon, label, desc, href }: { icon?: ReactNode; label: string; desc?: string; href: string }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", color: t.text }}>
      {icon && <span style={{ color: "var(--accent)", flexShrink: 0 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 12.5, color: t.sub, marginTop: 1 }}>{desc}</div>}
      </div>
      <ChevronRight size={18} color="var(--text-muted)" />
    </Link>
  );
}
