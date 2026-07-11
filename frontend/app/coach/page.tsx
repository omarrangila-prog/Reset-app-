"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api, InterventionResponse } from "@/lib/api";
import { BottomNav } from "@/components/ui/BottomNav";
import { AICoachOrb } from "@/components/ui/AICoachOrb";
import { FeatureIntro } from "@/components/ui/FeatureIntro";
import { spring } from "@/components/ui/motion";
import { t } from "@/components/ui/theme";

type Mode = "URGE" | "VULNERABILITY" | "RECOVERY";

interface ChatMsg {
  id: string;
  role: "user" | "coach";
  text: string;
  actionSteps?: string[];
  crisis?: boolean;
  resources?: Array<{ label: string; value: string; href: string }>;
}

const modeMeta: Record<Mode, { label: string; accent: string; hint: string; opener: string; placeholder: string; auto: string }> = {
  URGE: {
    label: "In the moment",
    accent: t.urge,
    hint: "Let's move through this together, right now.",
    opener: "I'm right here with you. Take one slow breath — what's happening in this moment?",
    placeholder: "Describe what you're feeling right now…",
    auto: "I feel an urge and I need support right now.",
  },
  VULNERABILITY: {
    label: "Soft space",
    accent: t.vuln,
    hint: "A gentle place to name what you feel.",
    opener: "However you're feeling is welcome here. What's sitting with you today?",
    placeholder: "Share what you're feeling…",
    auto: "I'm feeling vulnerable and could use some support.",
  },
  RECOVERY: {
    label: "Daily check-in",
    accent: t.emerald,
    hint: "Reflect and reinforce your progress.",
    opener: "Good to see you. How are things going today?",
    placeholder: "How are you doing today?",
    auto: "I want to check in on how I'm doing.",
  },
};

function fallback(mode: Mode): InterventionResponse {
  const byMode: Record<Mode, string> = {
    URGE: "Stand up and change rooms. Drink a full glass of cold water. This urge peaks and passes — set a 90-second timer and breathe until it rings.",
    VULNERABILITY: "This feeling is a signal, not a command. Name what you actually need — rest, connection, or a pause — and take one small step toward it.",
    RECOVERY: "You're building something real, one day at a time. Notice one thing that went right today, and let that be enough.",
  };
  return { message: byMode[mode], mode, actionSteps: [], context: { streak: 0 }, fallback: true };
}

function CoachInner() {
  const params = useSearchParams();
  const { userId } = useAppStore();
  const [mode, setMode] = useState<Mode>((params.get("mode") as Mode) || "RECOVERY");
  const [urgency] = useState(parseInt(params.get("urgency") || "5", 10));
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  // Voice-first: open into the big coach orb; user chooses Speak or Open chat.
  // Skip the intro if arriving in URGE mode (they need help immediately).
  const [showIntro, setShowIntro] = useState((params.get("mode") as Mode) !== "URGE");
  const autoSentRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const meta = modeMeta[mode];

  // Seed with the coach's opener.
  useEffect(() => {
    setMessages([{ id: "opener", role: "coach", text: modeMeta[mode].opener }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Auto-send in URGE mode so a person in crisis gets an immediate response.
  useEffect(() => {
    if (mode === "URGE" && !autoSentRef.current) {
      autoSentRef.current = true;
      setTimeout(() => send(modeMeta.URGE.auto), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setInput("");
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: "user", text }]);
    setTyping(true);
    try {
      const res = await api.intervene(text, urgency);
      setMessages((m) => [
        ...m,
        {
          id: `c${Date.now()}`,
          role: "coach",
          text: res.message,
          actionSteps: res.actionSteps,
          crisis: res.crisis,
          resources: res.resources,
        },
      ]);
      if (res.mode && res.mode !== "CRISIS") setMode(res.mode as Mode);
      if (userId && !res.crisis) api.createLog({ type: "URGE", note: text, intensity: urgency }).catch(() => {});
    } catch {
      const f = fallback(mode);
      setMessages((m) => [...m, { id: `c${Date.now()}`, role: "coach", text: f.message, actionSteps: f.actionSteps }]);
    } finally {
      setTyping(false);
    }
  };

  const suggestions = ["I'm having an urge", "I feel anxious", "I'm doing okay today"];

  // ── Voice-first intro: big breathing orb, choose Speak or Open chat ──
  if (showIntro) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 28px", textAlign: "center", background: "var(--grad-calm)", position: "relative", zIndex: 1 }}>
        <Link href="/" aria-label="Back" style={{ position: "absolute", top: 20, left: 20, width: 40, height: 40, borderRadius: 12, background: "var(--bg-glass)", border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub }}>‹</Link>
        <AICoachOrb size={160} state="idle" />
        <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", marginTop: 32 }}>I&apos;m here with you</h1>
        <p style={{ fontSize: 15, color: t.sub, lineHeight: 1.6, marginTop: 8, maxWidth: 320 }}>
          Talk to me out loud, or type — whatever feels easier right now.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32, width: "100%", maxWidth: 320 }}>
          <Link href="/coach/voice" style={{ padding: "16px", background: t.gradHero, color: "#fff", borderRadius: 16, fontSize: 15, fontWeight: 600, minHeight: 56, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: t.shadowAccent }}>
            🎙 Talk out loud
          </Link>
          <button onClick={() => setShowIntro(false)} style={{ padding: "16px", background: "var(--bg-glass)", color: t.text, border: `1px solid ${t.border}`, borderRadius: 16, fontSize: 15, fontWeight: 600, minHeight: 56, cursor: "pointer", backdropFilter: "blur(8px)" }}>
            Open chat instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: t.glass,
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <Link
          href="/"
          aria-label="Back"
          style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub }}
        >
          ‹
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, fontFamily: t.fontHeading }}>AI Coach</div>
          <div style={{ fontSize: 12, color: t.muted }}>
            {typing ? "Thinking…" : meta.hint}
          </div>
        </div>
        <Link
          href="/coach/voice"
          aria-label="Talk out loud (voice coach)"
          style={{ width: 40, height: 40, borderRadius: 12, background: t.surface, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.accent, marginRight: 4 }}
        >
          🎙
        </Link>
        <AICoachOrb size={44} state={typing ? "thinking" : "idle"} />
      </header>

      {/* Mode pills */}
      <div style={{ display: "flex", gap: 8, padding: "12px 20px 4px", overflowX: "auto" }}>
        {(["RECOVERY", "VULNERABILITY", "URGE"] as Mode[]).map((m) => {
          const active = m === mode;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? "transparent" : t.border}`,
                background: active ? t.gradHero : t.surface,
                color: active ? "#fff" : t.sub,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                cursor: "pointer",
                minHeight: 40,
                flexShrink: 0,
              }}
            >
              {modeMeta[m].label}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px 200px", display: "flex", flexDirection: "column", gap: 12, maxWidth: 560, margin: "0 auto", width: "100%" }}>
        {messages.length <= 1 && (
          <FeatureIntro
            what="A supportive coach you can talk to anytime — day or night. Tell it how you feel and get gentle, practical help."
            time="2–5 minutes"
            benefit="Feel more in control when an urge shows up"
          />
        )}
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={spring}
            style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}
          >
            <div
              style={{
                maxWidth: "82%",
                padding: "12px 16px",
                borderRadius: 20,
                fontSize: 15,
                lineHeight: 1.55,
                ...(m.role === "user"
                  ? { background: t.gradHero, color: "#fff", borderBottomRightRadius: 6, boxShadow: t.shadowAccent }
                  : { background: t.surface, color: t.text, border: `1px solid ${t.border}`, borderBottomLeftRadius: 6, boxShadow: t.shadowSm }),
              }}
            >
              {m.text}
              {m.actionSteps && m.actionSteps.length > 0 && (
                <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {m.actionSteps.map((s, i) => (
                    <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: t.sub }}>
                      <span style={{ color: meta.accent, fontWeight: 700 }}>›</span>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {m.crisis && m.resources && (
                <div role="alert" style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  {m.resources.map((r) => (
                    <a key={r.label} href={r.href} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "10px 12px", borderRadius: 12, background: `${t.urge}12`, border: `1px solid ${t.urge}33`, color: t.text, fontSize: 13, fontWeight: 500 }}>
                      <span>{r.label}</span>
                      <span style={{ color: t.urge, fontWeight: 700 }}>{r.value}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "14px 18px", borderRadius: 20, background: t.surface, border: `1px solid ${t.border}`, boxShadow: t.shadowSm }}>
              <span className="typing-dots" aria-label="Coach is typing">
                <i /><i /><i />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 84,
          padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
          maxWidth: 560,
          margin: "0 auto",
          zIndex: 40,
        }}
      >
        {messages.length <= 1 && !typing && (
          <div style={{ display: "flex", gap: 8, marginBottom: 10, overflowX: "auto" }}>
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} style={{ padding: "8px 14px", borderRadius: 999, background: t.surface, border: `1px solid ${t.border}`, color: t.sub, fontSize: 13, whiteSpace: "nowrap", cursor: "pointer", minHeight: 40, flexShrink: 0, boxShadow: t.shadowSm }}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div
          className="glass"
          style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: 8, borderRadius: 24 }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={meta.placeholder}
            aria-label="Message the coach"
            style={{
              flex: 1,
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              color: t.text,
              fontSize: 15,
              fontFamily: t.fontBody,
              padding: "10px 12px",
              maxHeight: 120,
            }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || typing}
            aria-label="Send"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              background: input.trim() && !typing ? t.gradHero : t.borderMid,
              color: "#fff",
              fontSize: 18,
              cursor: input.trim() && !typing ? "pointer" : "default",
              flexShrink: 0,
              boxShadow: input.trim() && !typing ? t.shadowAccent : "none",
              transition: "background 200ms",
            }}
          >
            ↑
          </button>
        </div>
      </div>

      <BottomNav />
      <style>{`
        .typing-dots { display: inline-flex; gap: 4px; align-items: center; height: 8px; }
        .typing-dots i { width: 7px; height: 7px; border-radius: 50%; background: ${t.muted}; display: inline-block; animation: td 1.2s infinite ease-in-out; }
        .typing-dots i:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots i:nth-child(3) { animation-delay: 0.4s; }
        @keyframes td { 0%,60%,100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .typing-dots i { animation: none; } }
      `}</style>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <CoachInner />
    </Suspense>
  );
}
