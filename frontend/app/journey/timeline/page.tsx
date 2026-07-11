"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { haptic } from "@/lib/haptics";
import { api, MeProfile } from "@/lib/api";
import { useAppStore } from "@/lib/store";

/**
 * Your Recovery Map — an interactive personal journey. A curved illuminated
 * path connects milestone nodes: completed nodes glow, the current chapter
 * pulses, upcoming nodes are dim. Tap a node to expand what it means, what
 * helped, and the next recommended action. Unlocks from real streak/log data.
 * Fully theme-aware (dark navy + lavender/pink path in dark mode).
 */
interface Node {
  title: string;
  meaning: string;
  helped: string;
  action?: { label: string; href: string };
  done: boolean;
  progress?: string;
}

export default function TimelinePage() {
  const { userId } = useAppStore();
  const reduced = useReducedMotion();
  const [me, setMe] = useState<MeProfile | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (userId) api.getMe().then(setMe).catch(() => {});
  }, [userId]);

  const streak = me?.streak ?? 12;
  const logs = me?.logs?.length ?? 6;

  const nodes: Node[] = [
    { title: "Started your journey", meaning: "You showed up — the hardest first step.", helped: "Deciding to begin.", done: true, progress: me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : "Day 0" },
    { title: "First honest check-in", meaning: "Noticing how you feel is where awareness starts.", helped: "A quiet moment of honesty.", action: { label: "Check in", href: "/journey/mood" }, done: logs > 0 },
    { title: "Three calm responses", meaning: "You chose to pause instead of react.", helped: "Calm Mode and breathing.", action: { label: "Open Calm Mode", href: "/urge" }, done: streak >= 3 },
    { title: "One week of reflection", meaning: "A full week of returning to your intention.", helped: "Journaling most evenings.", action: { label: "Write a note", href: "/journey/journal" }, done: streak >= 7 },
    { title: "Two-week consistency", meaning: "Momentum is becoming a routine.", helped: "Earlier nights, fewer late triggers.", done: streak >= 14, progress: streak < 14 ? `${streak}/14 days` : undefined },
    { title: "A stable routine", meaning: "Freedom is built on steady, ordinary days.", helped: "Small habits, repeated.", done: streak >= 30, progress: streak < 30 ? `${streak}/30 days` : undefined },
  ];

  // Current chapter = first not-done node (or the last if all done).
  const currentIdx = Math.min(nodes.findIndex((n) => !n.done) === -1 ? nodes.length - 1 : nodes.findIndex((n) => !n.done), nodes.length - 1);
  const chapterName = ["Beginning", "Awareness", "Control", "Reflection", "Consistency", "Stability"][currentIdx] || "Freedom";

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <BackButton fallbackHref="/journey" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Your recovery map</div>
            <div style={{ fontSize: 12, color: t.muted }}>Chapter: {chapterName}</div>
          </div>
        </header>

        {/* The path */}
        <div style={{ position: "relative", paddingLeft: 6 }}>
          {nodes.map((n, i) => {
            const isCurrent = i === currentIdx;
            const isOpen = open === i;
            // Alternate the node's horizontal offset so the connecting line curves.
            const offset = i % 2 === 0 ? 0 : 34;
            const nextOffset = (i + 1) % 2 === 0 ? 0 : 34;
            const nodeColor = n.done ? "var(--accent)" : isCurrent ? "var(--accent-2)" : t.borderMid;

            return (
              <div key={n.title} style={{ position: "relative", paddingBottom: i === nodes.length - 1 ? 0 : 30 }}>
                {/* curved connector to the next node */}
                {i < nodes.length - 1 && (
                  <svg aria-hidden width="60" height="72" viewBox="0 0 60 72" style={{ position: "absolute", left: 8 + Math.min(offset, nextOffset), top: 30, zIndex: 0, overflow: "visible" }}>
                    <motion.path
                      d={`M ${offset < nextOffset ? 6 : 40} 0 C ${23} 30, ${23} 42, ${nextOffset < offset ? 6 : 40} 72`}
                      fill="none"
                      stroke={n.done ? "var(--accent)" : "var(--border)"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={n.done ? "0" : "5 6"}
                      initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: n.done ? 0.7 : 0.4 }}
                      transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </svg>
                )}

                <motion.div
                  initial={reduced ? undefined : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: "flex", gap: 14, marginLeft: offset, alignItems: "flex-start", position: "relative", zIndex: 1 }}
                >
                  {/* Node */}
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    {isCurrent && !reduced && (
                      <motion.span aria-hidden style={{ position: "absolute", inset: -6, borderRadius: "50%", background: "var(--accent-2)", opacity: 0.3 }}
                        animate={{ scale: [1, 1.5], opacity: [0.35, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
                    )}
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: n.done ? "var(--grad-hero)" : isCurrent ? "var(--accent-2)" : t.surface,
                      border: n.done || isCurrent ? "none" : `2px solid ${t.border}`,
                      boxShadow: n.done ? t.shadowAccent : isCurrent ? "0 6px 18px rgba(167,139,250,0.5)" : "none",
                      display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", position: "relative",
                    }} aria-hidden>
                      {n.done ? <Check size={15} strokeWidth={3} /> : isCurrent ? <Sparkles size={14} /> : null}
                    </div>
                  </div>

                  {/* Card */}
                  <motion.button
                    onClick={() => { haptic("select"); setOpen(isOpen ? null : i); }}
                    aria-expanded={isOpen}
                    whileTap={reduced ? undefined : { scale: 0.99 }}
                    style={{
                      flex: 1, textAlign: "left", cursor: "pointer",
                      background: isCurrent ? "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))" : "var(--bg-surface)",
                      border: `1px solid ${isCurrent ? "var(--accent-2)" : t.border}`,
                      borderRadius: 18, padding: "14px 16px",
                      boxShadow: n.done || isCurrent ? "var(--shadow-md)" : "var(--shadow-sm)",
                      color: t.text,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: n.done || isCurrent ? t.text : t.muted }}>{n.title}</div>
                        {(n.progress || isCurrent) && (
                          <div style={{ fontSize: 12, color: isCurrent ? "var(--accent-text)" : t.muted, marginTop: 2, fontWeight: isCurrent ? 600 : 500 }}>
                            {n.progress || "You’re here now"}
                          </div>
                        )}
                      </div>
                      <motion.span aria-hidden animate={{ rotate: isOpen ? 180 : 0 }} style={{ color: t.muted, flexShrink: 0 }}>
                        <ChevronDown size={18} />
                      </motion.span>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={reduced ? undefined : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduced ? undefined : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          style={{ overflow: "hidden" }}
                        >
                          <div style={{ paddingTop: 12, marginTop: 12, borderTop: `1px solid ${t.border}` }}>
                            <p style={{ fontSize: 13.5, color: t.sub, lineHeight: 1.55 }}>{n.meaning}</p>
                            <div style={{ fontSize: 12.5, color: t.muted, marginTop: 8 }}>
                              <span style={{ color: "var(--accent-text)", fontWeight: 600 }}>What helped: </span>{n.helped}
                            </div>
                            {n.action && (
                              <Link href={n.action.href} onClick={(e) => e.stopPropagation()}
                                style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "9px 16px", borderRadius: 999, background: "var(--grad-hero)", color: "#fff", fontSize: 13, fontWeight: 600, minHeight: 40, boxShadow: t.shadowAccent }}>
                                {n.action.label} →
                              </Link>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
