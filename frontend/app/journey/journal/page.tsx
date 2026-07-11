"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Reveal } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";
import { api, JournalEntry } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/components/ui/SaveToast";

// Gentle, emotional prompts — tap one to start writing.
const PROMPTS = [
  "What are you proud of today?",
  "What felt hard, and how did you handle it?",
  "What are you grateful for right now?",
  "What did you learn about yourself?",
  "What do you need more of this week?",
];

export default function JournalPage() {
  const { userId } = useAppStore();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  const load = async () => {
    try { setEntries(await api.getJournal(50)); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { if (userId) load(); else setLoading(false); }, [userId]);

  const save = async () => {
    const content = text.trim();
    if (!content || saving) return; // guard duplicate saves while processing
    setSaving(true);
    try {
      await api.createJournal(content);
      setText("");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
      toast("Saved", { kind: "success", subtitle: "Your reflection is safe." });
      await load();
    } catch {
      // Keep the writing visible; surface a calm, non-blocking error toast.
      toast("Couldn’t save yet", { kind: "error", subtitle: "Your note is still here — try again." });
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      {/* Hero — warm, personal */}
      <Reveal index={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/journey" />
          <div style={{ fontSize: 12, color: t.muted }}>{today}</div>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: t.text, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 4 }}>My safe space</h1>
        <p style={{ fontSize: 14, color: t.sub, marginBottom: 20 }}>No one else can read this. Write as freely as you like.</p>
      </Reveal>

      {/* Writing card — soft paper feel + bookmark ribbon */}
      <Reveal index={1}>
        <div
          className="frost"
          style={{
            position: "relative",
            background: "var(--card-sculpted)",
            border: `1px solid ${t.border}`,
            borderRadius: 24,
            padding: "20px 20px 16px",
            boxShadow: t.shadowMd,
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          {/* Bookmark ribbon */}
          <div aria-hidden style={{ position: "absolute", top: -2, right: 22, width: 20, height: 40, background: t.gradHero, borderRadius: "0 0 4px 4px", boxShadow: t.shadowSm, clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)" }} />
          {/* Faint ruled lines for a notebook feel */}
          <div aria-hidden style={{ position: "absolute", inset: "56px 20px 44px", backgroundImage: `repeating-linear-gradient(${t.border} 0 1px, transparent 1px 30px)`, opacity: 0.4, pointerEvents: "none" }} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 5000))}
            placeholder="Today, I…"
            aria-label="Write a journal entry"
            style={{ position: "relative", width: "100%", minHeight: 150, resize: "none", border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 16, lineHeight: "30px", fontFamily: t.fontBody, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: t.muted }}>{text.length} / 5000</span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={save}
              disabled={saving || !text.trim()}
              style={{ padding: "11px 22px", background: text.trim() ? t.gradHero : t.borderMid, border: "none", borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 600, cursor: text.trim() ? "pointer" : "default", minHeight: 44, boxShadow: text.trim() ? t.shadowAccent : "none" }}
            >
              {saving ? "Saving…" : justSaved ? "Saved ✓" : "Keep this"}
            </motion.button>
          </div>
        </div>
      </Reveal>

      {/* Prompts — tap to start */}
      {!text && (
        <Reveal index={2}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 10 }}>Not sure where to start?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PROMPTS.map((p) => (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setText(p + "\n\n")}
                  style={{ padding: "10px 14px", borderRadius: 999, background: t.accentSoft, border: `1px solid ${t.accent}22`, color: t.accentText, fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left", minHeight: 40 }}
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Memory timeline */}
      {loading ? (
        <div><SkeletonCard lines={2} /><SkeletonCard lines={3} /></div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 20px", background: t.accentSoft, borderRadius: 20, border: `1px solid ${t.accent}18` }}>
          <div style={{ fontSize: 15, color: t.text, fontWeight: 600, marginBottom: 4 }}>Your story starts here</div>
          <div style={{ fontSize: 13, color: t.sub }}>Even one honest sentence is a step. This space grows with you.</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 11, color: t.muted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 12 }}>Your entries</div>
          <div style={{ position: "relative", paddingLeft: 22 }}>
            {/* vertical thread */}
            <div aria-hidden style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: `${t.accent}22` }} />
            {entries.map((e, i) => (
              <Reveal key={e.id} index={i}>
                <div style={{ position: "relative", marginBottom: 14 }}>
                  <span aria-hidden style={{ position: "absolute", left: -21, top: 20, width: 12, height: 12, borderRadius: "50%", background: t.gradHero, boxShadow: `0 0 0 3px ${t.accent}22` }} />
                  <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 18, padding: 16, boxShadow: t.shadowSm }}>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 8 }}>
                      {new Date(e.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                    <div style={{ fontSize: 14, color: t.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{e.content}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
