"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AICoachOrb, OrbState } from "@/components/ui/AICoachOrb";
import { t } from "@/components/ui/theme";
import { api } from "@/lib/api";

/**
 * Voice Coach — talk out loud, the coach listens and speaks back. Uses the
 * browser Web Speech API (SpeechRecognition + speechSynthesis). Gracefully
 * shows a fallback if the browser doesn't support it. Reuses the same coaching
 * endpoint as the text chat, so crisis detection + safe fallbacks still apply.
 */
export default function VoiceCoachPage() {
  const [state, setState] = useState<OrbState>("idle");
  const [supported, setSupported] = useState(true);
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [caption, setCaption] = useState("Tap the orb and talk. I'm listening.");
  const recogRef = useRef<any>(null);

  useEffect(() => {
    const SR = (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;
    if (!SR) { setSupported(false); return; }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setHeard(text);
      handle(text);
    };
    r.onerror = () => { setState("idle"); setCaption("Didn't catch that — tap and try again."); };
    r.onend = () => setState((s) => (s === "listening" ? "idle" : s));
    recogRef.current = r;
    return () => { try { r.abort(); } catch {} window.speechSynthesis?.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98; u.pitch = 1; u.lang = "en-US";
    u.onstart = () => setState("speaking");
    u.onend = () => { setState("idle"); setCaption("I'm here. Tap to talk again."); };
    window.speechSynthesis.speak(u);
  };

  const handle = async (text: string) => {
    setState("thinking");
    setCaption("Thinking…");
    try {
      const res = await api.intervene(text, 6);
      setReply(res.message);
      setCaption(res.message);
      speak(res.message);
    } catch {
      const msg = "I'm right here with you. Take one slow breath — in for four, out for six.";
      setReply(msg); setCaption(msg); speak(msg);
    }
  };

  const listen = () => {
    if (!recogRef.current || state === "listening") return;
    window.speechSynthesis?.cancel();
    setHeard(""); setReply("");
    setState("listening");
    setCaption("Listening…");
    try { recogRef.current.start(); } catch {}
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, background: "linear-gradient(165deg, #EAF0FF 0%, #F3EEFF 55%, #EAFBF4 100%)" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px" }}>
        <Link href="/coach" aria-label="Back to chat" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.7)", border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub }}>‹</Link>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Voice coach</div>
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" }}>
        {!supported ? (
          <>
            <AICoachOrb size={120} state="idle" />
            <p style={{ marginTop: 24, fontSize: 15, color: t.text, lineHeight: 1.6, maxWidth: 320 }}>
              Your browser doesn&apos;t support voice yet. The text coach works just as well.
            </p>
            <Link href="/coach" style={{ marginTop: 20, padding: "14px 24px", background: t.gradHero, color: "#fff", borderRadius: 14, fontWeight: 600, fontSize: 14, minHeight: 48, display: "inline-flex", alignItems: "center" }}>
              Open text coach
            </Link>
          </>
        ) : (
          <>
            <button onClick={listen} aria-label="Tap to talk" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
              <AICoachOrb size={150} state={state} />
            </button>
            <p aria-live="polite" style={{ marginTop: 28, fontSize: 16, color: t.text, lineHeight: 1.6, maxWidth: 360, minHeight: 60 }}>
              {caption}
            </p>
            {heard && (
              <p style={{ marginTop: 8, fontSize: 12, color: t.muted }}>You said: “{heard}”</p>
            )}
            <button
              onClick={listen}
              disabled={state === "listening" || state === "thinking"}
              style={{ marginTop: 24, padding: "14px 28px", borderRadius: 999, border: "none", background: state === "listening" ? t.borderMid : t.gradHero, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 52, boxShadow: t.shadowAccent }}
            >
              {state === "listening" ? "Listening…" : state === "thinking" ? "Thinking…" : state === "speaking" ? "Speaking…" : "Tap to talk"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
