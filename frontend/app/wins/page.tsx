"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X, Trophy } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { useToast } from "@/components/ui/SaveToast";
import { haptic } from "@/lib/haptics";
import { Win, SUGGESTED_WINS, loadWins, addWin, removeWin } from "@/lib/wins";

/**
 * Victories — the Wins Journal + Victory Wall. Records successes, not problems.
 * "What is one thing you did today that made recovery a little easier?"
 * Theme-aware, private, SaveToast confirmation.
 */
export default function WinsPage() {
  const { toast } = useToast();
  const [wins, setWins] = useState<Win[]>([]);
  const [text, setText] = useState("");

  useEffect(() => { setWins(loadWins()); }, []);

  const add = (value: string) => {
    const v = value.trim();
    if (!v) return;
    haptic("achievement");
    setWins(addWin(v));
    setText("");
    toast("Win recorded", { kind: "success", subtitle: "That's a step worth keeping." });
  };
  const del = (id: string) => { haptic("tap"); setWins(removeWin(id)); };

  const usedSuggestions = new Set(wins.map((w) => w.text));
  const suggestions = SUGGESTED_WINS.filter((s) => !usedSuggestions.has(s));

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/profile" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Victories</div>
            <div style={{ fontSize: 12, color: t.muted }}>{wins.length} recorded</div>
          </div>
        </header>

        {/* Prompt */}
        <div style={{ borderRadius: 20, padding: "18px 18px", margin: "16px 0 22px", background: "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))", border: `1px solid ${t.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Trophy size={18} color="var(--accent)" />
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--accent-text)" }}>Today&apos;s win</div>
          </div>
          <p style={{ fontSize: 15, color: t.text, lineHeight: 1.5 }}>What is one thing you did today that made recovery a little easier?</p>
        </div>

        {/* Add custom */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(text); }}
            placeholder="I…" aria-label="Record a win"
            style={{ flex: 1, padding: "13px 16px", borderRadius: 14, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 14, outline: "none", minHeight: 48 }} />
          <button onClick={() => add(text)} disabled={!text.trim()} style={{ padding: "0 18px", borderRadius: 14, border: "none", background: text.trim() ? "var(--grad-hero)" : t.borderMid, color: "#fff", fontSize: 14, fontWeight: 600, cursor: text.trim() ? "pointer" : "default", minHeight: 48 }}>Add</button>
        </div>

        {/* Quick add */}
        {suggestions.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 26 }}>
            {suggestions.map((s) => (
              <button key={s} onClick={() => add(s)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 13px", borderRadius: 999, minHeight: 40, cursor: "pointer", fontSize: 13, fontWeight: 500, background: t.surface, border: `1px solid ${t.border}`, color: t.text }}>
                <Plus size={13} color="var(--accent)" /> {s}
              </button>
            ))}
          </div>
        )}

        {/* Victory wall */}
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 12 }}>Your victory wall</div>
        {wins.length === 0 ? (
          <div style={{ textAlign: "center", padding: "26px 20px", background: "var(--accent-soft)", borderRadius: 20, border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 15, color: t.text, fontWeight: 600, marginBottom: 4 }}>Your wins collect here</div>
            <div style={{ fontSize: 13, color: t.sub }}>Even small steps count. Add your first above.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence initial={false}>
              {wins.map((w) => (
                <motion.div key={w.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: 16, background: "var(--bg-surface)", border: `1px solid ${t.border}`, boxShadow: "var(--shadow-sm)" }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--recovery)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} aria-hidden><Check size={15} strokeWidth={3} /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, color: t.text, fontWeight: 500 }}>{w.text}</div>
                    <div style={{ fontSize: 11.5, color: t.muted, marginTop: 1 }}>{new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                  </div>
                  <button onClick={() => del(w.id)} aria-label={`Remove win: ${w.text}`} style={{ width: 32, height: 32, borderRadius: 9, border: "none", background: "transparent", color: t.muted, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={15} /></button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
