"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, X, Plus } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { useToast } from "@/components/ui/SaveToast";
import { haptic } from "@/lib/haptics";
import { UrgeAction, SUGGESTED_ACTIONS, loadPlan, savePlan } from "@/lib/urgePlan";

/**
 * My Urge Plan — build the ordered actions you'll take when a difficult moment
 * begins, before it happens. Reorder by importance; SOS shows this plan first.
 * Theme-aware. Private (local storage).
 */
export default function UrgePlanPage() {
  const { toast } = useToast();
  const [plan, setPlan] = useState<UrgeAction[]>([]);
  const [custom, setCustom] = useState("");

  useEffect(() => { setPlan(loadPlan()); }, []);

  const inPlan = (id: string) => plan.some((a) => a.id === id);
  const add = (a: UrgeAction) => { haptic("tap"); setPlan((p) => [...p, a]); };
  const remove = (id: string) => { haptic("tap"); setPlan((p) => p.filter((a) => a.id !== id)); };
  const move = (i: number, dir: -1 | 1) => {
    haptic("tap");
    setPlan((p) => {
      const j = i + dir;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const addCustom = () => {
    const label = custom.trim();
    if (!label) return;
    haptic("select");
    setPlan((p) => [...p, { id: `custom-${Date.now()}`, label }]);
    setCustom("");
  };
  const save = () => { savePlan(plan); toast("Saved", { kind: "success", subtitle: "Your plan is ready for a difficult moment." }); };

  const available = SUGGESTED_ACTIONS.filter((a) => !inPlan(a.id));

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/urge" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>My urge plan</div>
            <div style={{ fontSize: 12, color: t.muted }}>What you&apos;ll do in a difficult moment</div>
          </div>
        </header>

        <p style={{ fontSize: 14, color: t.sub, lineHeight: 1.6, margin: "12px 0 20px" }}>
          Decide now, while you&apos;re calm. When a difficult moment comes, SOS will show these steps in order.
        </p>

        {/* Current plan (ordered) */}
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 12 }}>When I feel triggered I will</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {plan.length === 0 && (
            <div style={{ padding: "18px 16px", borderRadius: 16, background: "var(--accent-soft)", border: `1px solid ${t.border}`, fontSize: 14, color: t.sub, textAlign: "center" }}>
              Add a few steps below to build your plan.
            </div>
          )}
          {plan.map((a, i) => (
            <motion.div key={a.id} layout style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 16, background: "var(--bg-surface)", border: `1px solid ${t.border}`, boxShadow: "var(--shadow-sm)" }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--grad-hero)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: t.text }}>{a.label}</span>
              <div style={{ display: "flex", gap: 2 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${a.label} up`} style={iconBtn(i === 0)}><ChevronUp size={17} /></button>
                <button onClick={() => move(i, 1)} disabled={i === plan.length - 1} aria-label={`Move ${a.label} down`} style={iconBtn(i === plan.length - 1)}><ChevronDown size={17} /></button>
                <button onClick={() => remove(a.id)} aria-label={`Remove ${a.label}`} style={iconBtn(false)}><X size={16} /></button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add suggested */}
        {available.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 12 }}>Add a step</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {available.map((a) => (
                <button key={a.id} onClick={() => add(a)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, minHeight: 40, cursor: "pointer", fontSize: 13.5, fontWeight: 500, background: t.surface, border: `1px solid ${t.border}`, color: t.text }}>
                  <Plus size={14} color="var(--accent)" /> {a.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Custom */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCustom(); }}
            placeholder="Add your own step…" aria-label="Add a custom action"
            style={{ flex: 1, padding: "13px 16px", borderRadius: 14, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 14, outline: "none", minHeight: 48 }} />
          <button onClick={addCustom} style={{ padding: "0 18px", borderRadius: 14, border: "none", background: "var(--accent-soft)", color: "var(--accent-text)", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>Add</button>
        </div>

        <button onClick={save} style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", background: "var(--grad-hero)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 54, boxShadow: "var(--shadow-accent)" }}>
          Save my plan
        </button>
      </div>
      <BottomNav />
    </div>
  );
}

function iconBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 34, height: 34, borderRadius: 10, border: "none", background: "transparent",
    color: disabled ? "var(--border-mid)" : "var(--text-muted)", cursor: disabled ? "default" : "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  };
}
