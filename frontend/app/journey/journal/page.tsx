"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { t } from "@/components/ui/theme";
import { api, JournalEntry } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export default function JournalPage() {
  const { userId } = useAppStore();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setEntries(await api.getJournal(50));
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load();
    else setLoading(false);
  }, [userId]);

  const save = async () => {
    const content = text.trim();
    if (!content) return;
    setSaving(true);
    try {
      await api.createJournal(content);
      setText("");
      await load();
    } catch {
      alert("Couldn't save just now — your note is still here.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <Link href="/journey" aria-label="Back" style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: t.shadowSm }}>‹</Link>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Journal</div>
          <div style={{ fontSize: 12, color: t.muted }}>A private place to write — only you can see it</div>
        </div>
      </header>

      <Card variant="soft" style={{ marginBottom: 20 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 5000))}
          placeholder="What's on your mind?"
          aria-label="New journal entry"
          style={{ width: "100%", minHeight: 120, resize: "none", border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 15, fontFamily: t.fontBody, lineHeight: 1.6, boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: 11, color: t.muted }}>{text.length} / 5000</span>
          <button
            onClick={save}
            disabled={saving || !text.trim()}
            style={{ padding: "10px 20px", background: text.trim() ? t.gradHero : t.borderMid, border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: text.trim() ? "pointer" : "default", minHeight: 44 }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </Card>

      {loading ? (
        <div><SkeletonCard lines={2} /><SkeletonCard lines={3} /></div>
      ) : entries.length === 0 ? (
        <Card variant="tint" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, color: t.text, fontWeight: 600, marginBottom: 4 }}>Your story starts here</div>
          <div style={{ fontSize: 13, color: t.sub }}>Write your first reflection above — even one honest sentence helps.</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {entries.map((e) => (
            <Card key={e.id} variant="soft">
              <div style={{ fontSize: 11, color: t.muted, marginBottom: 8 }}>
                {new Date(e.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <div style={{ fontSize: 14, color: t.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{e.content}</div>
            </Card>
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
