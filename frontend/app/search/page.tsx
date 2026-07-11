"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, BookOpen, Sparkles, Trophy } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { api, JournalEntry } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { loadWins, Win } from "@/lib/wins";

/**
 * Search everything — journal entries, lessons, and wins. As history grows this
 * becomes valuable. Theme-aware; searches what's available locally + journal.
 */
type Result =
  | { kind: "journal"; id: string; text: string; date: string }
  | { kind: "win"; id: string; text: string; date: string }
  | { kind: "lesson"; id: string; text: string; href: string };

// Lightweight lesson index (titles are static content in /learn).
const LESSONS = [
  { slug: "understanding-urges", title: "Understanding urges" },
  { slug: "why-late-nights", title: "Why late nights are harder" },
  { slug: "building-new-habits", title: "Building new habits" },
  { slug: "handling-stress", title: "Handling stress without escaping" },
];

export default function SearchPage() {
  const { userId } = useAppStore();
  const [q, setQ] = useState("");
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [wins, setWins] = useState<Win[]>([]);

  useEffect(() => {
    if (userId) api.getJournal(200).then(setJournal).catch(() => {});
    setWins(loadWins());
  }, [userId]);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const out: Result[] = [];
    journal.forEach((e) => { if (e.content?.toLowerCase().includes(term)) out.push({ kind: "journal", id: e.id, text: e.content, date: e.createdAt }); });
    wins.forEach((w) => { if (w.text.toLowerCase().includes(term)) out.push({ kind: "win", id: w.id, text: w.text, date: w.date }); });
    LESSONS.forEach((l) => { if (l.title.toLowerCase().includes(term)) out.push({ kind: "lesson", id: l.slug, text: l.title, href: `/learn/${l.slug}` }); });
    return out.slice(0, 50);
  }, [q, journal, wins]);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <BackButton fallbackHref="/profile" />
          <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Search</div>
        </header>

        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderRadius: 16, background: "var(--bg-surface)", border: `1px solid ${t.border}`, boxShadow: "var(--shadow-sm)", marginBottom: 22 }}>
          <SearchIcon size={18} color="var(--text-muted)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="Search journal, wins, lessons…" aria-label="Search"
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 15, minHeight: 28 }} />
        </div>

        {q.trim() === "" ? (
          <div style={{ textAlign: "center", padding: "30px 20px", color: t.muted, fontSize: 14 }}>Search your reflections, victories, and lessons.</div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 20px", color: t.muted, fontSize: 14 }}>Nothing matched “{q}” yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((r) => {
              const meta = r.kind === "journal" ? { Icon: BookOpen, label: "Journal" } : r.kind === "win" ? { Icon: Trophy, label: "Win" } : { Icon: Sparkles, label: "Lesson" };
              const body = (
                <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 16, background: "var(--bg-surface)", border: `1px solid ${t.border}`, boxShadow: "var(--shadow-sm)" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><meta.Icon size={16} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: t.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{meta.label}</div>
                    <div style={{ fontSize: 14, color: t.text, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.text}</div>
                  </div>
                </div>
              );
              return r.kind === "lesson" ? <Link key={`${r.kind}-${r.id}`} href={r.href}>{body}</Link> : <div key={`${r.kind}-${r.id}`}>{body}</div>;
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
