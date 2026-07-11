"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Wind, Footprints, BookOpen, MessageCircle, Check } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { AICoachOrb } from "@/components/ui/AICoachOrb";
import { t } from "@/components/ui/theme";
import { haptic } from "@/lib/haptics";

/**
 * Delay, don't fight. Choose a short window (5/10/15 min) and stay with the
 * feeling. Activities are offered during the wait. Finishing is celebrated
 * regardless of outcome. Theme-aware; reduced-motion aware.
 */
const ACTIVITIES = [
  { label: "Breathing", Icon: Wind, href: "/urge" },
  { label: "Walk", Icon: Footprints, href: "/habits" },
  { label: "Journal", Icon: BookOpen, href: "/journey/journal" },
  { label: "AI Coach", Icon: MessageCircle, href: "/coach" },
];

export default function DelayPage() {
  const reduced = useReducedMotion();
  const [total, setTotal] = useState<number | null>(null); // seconds
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const start = (mins: number) => {
    haptic("select");
    const secs = mins * 60;
    setTotal(secs); setLeft(secs); setDone(false);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          haptic("success"); setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const reset = () => { if (timer.current) clearInterval(timer.current); setTotal(null); setLeft(0); setDone(false); };
  const pct = total ? (total - left) / total : 0;
  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--grad-calm)", color: t.text, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px 20px 0", maxWidth: 520, width: "100%", margin: "0 auto" }}>
        <BackButton fallbackHref="/urge" />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px 40px", textAlign: "center", maxWidth: 520, margin: "0 auto", width: "100%" }}>
        <AnimatePresence mode="wait">
          {total === null ? (
            <motion.div key="choose" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ width: "100%" }}>
              <h1 style={{ fontFamily: t.fontHeading, fontSize: 28, fontWeight: 700, color: t.text, lineHeight: 1.2, marginBottom: 14 }}>You don&apos;t have to decide right now.</h1>
              <p style={{ fontSize: 16, color: t.sub, lineHeight: 1.6, marginBottom: 32, maxWidth: 340, marginLeft: "auto", marginRight: "auto" }}>
                Stay with this feeling for just a few minutes. Urges rise and fall — most pass sooner than you expect.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {[5, 10, 15].map((m) => (
                  <button key={m} onClick={() => start(m)} style={{ padding: "18px 26px", borderRadius: 20, background: "var(--bg-surface)", color: t.text, fontSize: 17, fontWeight: 700, cursor: "pointer", minHeight: 64, minWidth: 92, boxShadow: "var(--shadow-md)", border: `1px solid ${t.border}` }}>
                    {m}<span style={{ fontSize: 12, color: t.muted, fontWeight: 500, display: "block" }}>minutes</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : done ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: "100%" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--recovery)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "var(--shadow-lg)" }}>
                <Check size={34} strokeWidth={3} />
              </div>
              <h1 style={{ fontFamily: t.fontHeading, fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 12 }}>You stayed with it.</h1>
              <p style={{ fontSize: 15.5, color: t.sub, lineHeight: 1.6, marginBottom: 28, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
                That took real strength — whatever happens next, you gave yourself space to choose. Recovery continues.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/journey/journal" style={cta(true)}>Write a note</Link>
                <button onClick={reset} style={cta(false)}>Another round</button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: "100%" }}>
              {/* Progress ring around the orb */}
              <div style={{ position: "relative", width: 200, height: 200, margin: "0 auto 24px" }}>
                <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} aria-hidden>
                  <circle cx="100" cy="100" r="92" fill="none" stroke="var(--border)" strokeWidth="6" />
                  <motion.circle cx="100" cy="100" r="92" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 92} strokeDashoffset={2 * Math.PI * 92 * (1 - pct)}
                    animate={{ strokeDashoffset: 2 * Math.PI * 92 * (1 - pct) }} transition={{ ease: "linear", duration: 0.9 }} />
                </svg>
                <div style={{ position: "absolute", inset: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AICoachOrb size={120} state="idle" />
                </div>
              </div>
              <div style={{ fontFamily: t.fontHeading, fontSize: 40, fontWeight: 700, color: t.text, fontVariantNumeric: "tabular-nums", marginBottom: 6 }}>{mmss}</div>
              <p style={{ fontSize: 15, color: t.sub, marginBottom: 24 }}>Stay with it. This feeling will pass.</p>

              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 10 }}>While you wait</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
                {ACTIVITIES.map((a) => (
                  <Link key={a.label} href={a.href} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 15px", borderRadius: 999, background: "var(--bg-surface)", border: `1px solid ${t.border}`, color: t.text, fontSize: 13.5, fontWeight: 600, minHeight: 44 }}>
                    <a.Icon size={16} color="var(--accent)" /> {a.label}
                  </Link>
                ))}
              </div>
              <button onClick={reset} style={{ background: "none", border: "none", color: t.muted, fontSize: 13, cursor: "pointer", minHeight: 40 }}>End early</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function cta(primary: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "13px 22px", borderRadius: 14, minHeight: 50, cursor: "pointer", fontSize: 14.5, fontWeight: 600,
    ...(primary
      ? { background: "var(--grad-hero)", color: "#fff", border: "none", boxShadow: "var(--shadow-accent)" }
      : { background: "var(--bg-surface)", color: "var(--text)", border: "1px solid var(--border)" }),
  };
}
