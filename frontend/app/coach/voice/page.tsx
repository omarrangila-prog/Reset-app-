"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Mic, Square, Volume2, VolumeX, RotateCcw, MessageSquare, PhoneOff } from "lucide-react";
import { AICoachOrb, OrbState } from "@/components/ui/AICoachOrb";
import { t } from "@/components/ui/theme";
import { api } from "@/lib/api";
import { haptic } from "@/lib/haptics";

/**
 * Voice Coach — natural back-and-forth with the AI coach via the Web Speech API
 * (SpeechRecognition + speechSynthesis). Two modes:
 *
 *  • Push-to-talk: tap mic → speak → stop → coach replies (optionally aloud).
 *  • Live conversation: after the coach finishes speaking, listening resumes
 *    automatically until you press End. Never auto-starts without opt-in.
 *
 * Feedback-loop safety: recognition is fully stopped while TTS speaks, and only
 * restarts after `onend` + a short delay, so the app never transcribes its own
 * voice. All timers/recognition are cancelled on unmount. Honest typed fallback
 * when recognition is unsupported (most iOS Safari) or permission is denied.
 */
type Phase =
  | "idle" | "listening" | "thinking" | "speaking"
  | "returning" | "error" | "denied" | "unsupported";

interface Turn { role: "you" | "coach"; text: string }

const orbStateFor = (p: Phase): OrbState =>
  p === "listening" ? "listening" : p === "thinking" ? "thinking" : p === "speaking" ? "speaking" : "idle";

export default function VoiceCoachPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [caption, setCaption] = useState("Tap the mic and talk. I’m listening.");
  const [transcript, setTranscript] = useState(""); // live (interim + final)
  const [interim, setInterim] = useState("");         // distinguished partial text
  const [reply, setReply] = useState("");
  const [voiceOut, setVoiceOut] = useState(true);
  const [convo, setConvo] = useState(false);          // live conversation mode
  const [history, setHistory] = useState<Turn[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [typed, setTyped] = useState("");

  const recogRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef("");
  const ttsSupported = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convoRef = useRef(false);   // read latest convo flag inside callbacks
  const endedRef = useRef(false);   // page unmounted / conversation ended
  const startRef = useRef<() => void>(() => {});

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  // ── Recognition setup ───────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    ttsSupported.current = "speechSynthesis" in window;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setPhase("unsupported"); setCaption("Voice recognition isn’t supported in this browser yet."); return; }

    const r = new SR();
    r.lang = navigator.language || "en-US";
    r.continuous = false;
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (e: SpeechRecognitionEvent) => {
      let part = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalRef.current += res[0].transcript;
        else part += res[0].transcript;
      }
      setInterim(part);
      setTranscript((finalRef.current + part).trim());
    };
    r.onspeechend = () => { try { r.stop(); } catch {} };
    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      stopTimer();
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setPhase("denied"); setConvo(false); convoRef.current = false;
        setCaption("Microphone access is off. Enable it in settings, or type below.");
      } else if (e.error === "no-speech") {
        if (convoRef.current && !endedRef.current) { scheduleRestart(1200); setCaption("Still here — take your time."); }
        else { setPhase("idle"); setCaption("I didn’t hear anything — tap the mic to try again."); }
      } else if (e.error === "aborted") {
        setPhase((p) => (p === "listening" ? "idle" : p));
      } else if (e.error === "network") {
        setPhase("error"); setCaption("Speech needs a connection right now. You can type instead.");
      } else {
        setPhase("error"); setCaption("Something interrupted the mic. Tap to try again, or type below.");
      }
    };
    r.onend = () => {
      stopTimer();
      setInterim("");
      setPhase((p) => {
        if (p !== "listening") return p;
        const text = finalRef.current.trim();
        if (text) { void handle(text); return "thinking"; }
        if (convoRef.current && !endedRef.current) { scheduleRestart(800); return "returning"; }
        setCaption("I didn’t catch that — tap the mic to try again.");
        return "idle";
      });
    };
    recogRef.current = r;

    return () => {
      endedRef.current = true;
      try { r.abort(); } catch {}
      window.speechSynthesis?.cancel();
      stopTimer();
      if (restartRef.current) clearTimeout(restartRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleRestart = (ms: number) => {
    if (restartRef.current) clearTimeout(restartRef.current);
    restartRef.current = setTimeout(() => {
      if (!endedRef.current && convoRef.current) startRef.current();
    }, ms);
  };

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    const done = () => {
      // Only after the app finishes speaking do we (maybe) listen again —
      // this is what prevents the mic from hearing our own voice.
      if (convoRef.current && !endedRef.current) { setPhase("returning"); setCaption("Your turn…"); scheduleRestart(650); }
      else { setPhase("idle"); setCaption("I’m here. Tap the mic to talk again."); }
    };
    if (!ttsSupported.current || !voiceOut) { done(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98; u.pitch = 1; u.lang = navigator.language || "en-US";
    u.onstart = () => setPhase("speaking");
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
  }, [voiceOut]);

  const handle = useCallback(async (text: string) => {
    setHistory((h) => [...h, { role: "you", text }]);
    setPhase("thinking"); setCaption("Thinking…");
    try {
      const res = await api.intervene(text, 6);
      setReply(res.message); setCaption(res.message);
      setHistory((h) => [...h, { role: "coach", text: res.message }]);
      speak(res.message);
    } catch {
      const msg = "I’m right here with you. Take one slow breath — in for four, out for six.";
      setReply(msg); setCaption(msg);
      setHistory((h) => [...h, { role: "coach", text: msg }]);
      speak(msg);
    }
  }, [speak]);

  // ── Controls ──────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!recogRef.current || endedRef.current) return;
    window.speechSynthesis?.cancel();
    finalRef.current = ""; setTranscript(""); setInterim(""); setReply("");
    setPhase("listening"); setCaption(convoRef.current ? "Listening…" : "Listening… tap stop when you’re done.");
    setElapsed(0); haptic("orb");
    stopTimer();
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    try { recogRef.current.start(); } catch { /* already started */ }
  }, []);
  startRef.current = startListening;

  const stopListening = () => { if (!recogRef.current) return; haptic("tap"); try { recogRef.current.stop(); } catch {} };
  const replay = () => { if (reply) { setVoiceOut(true); speak(reply); } };
  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setPhase(convoRef.current ? "returning" : "idle"); if (convoRef.current) scheduleRestart(500); };

  const startConversation = () => {
    setConvo(true); convoRef.current = true; endedRef.current = false; haptic("select");
    startListening();
  };
  const endConversation = () => {
    setConvo(false); convoRef.current = false; haptic("tap");
    if (restartRef.current) clearTimeout(restartRef.current);
    window.speechSynthesis?.cancel();
    try { recogRef.current?.abort(); } catch {}
    stopTimer();
    setPhase("idle"); setCaption("Conversation ended. Tap the mic whenever you’d like to talk again.");
  };

  const sendTyped = () => {
    const text = typed.trim(); if (!text) return;
    setTranscript(text); setTyped(""); haptic("select"); void handle(text);
  };
  const toggleVoiceOut = () => { setVoiceOut((v) => { if (v) window.speechSynthesis?.cancel(); return !v; }); haptic("select"); };

  const canType = phase === "unsupported" || phase === "denied" || phase === "error";
  const listening = phase === "listening";
  const speaking = phase === "speaking";
  const busy = phase === "thinking" || phase === "returning";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, background: "var(--grad-calm)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/coach" aria-label="Back to chat" style={{ width: 40, height: 40, borderRadius: 12, background: t.glass, border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub }}>‹</Link>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Voice coach</div>
        </div>
        {phase !== "unsupported" && (
          <button onClick={toggleVoiceOut} aria-label={voiceOut ? "Mute spoken replies" : "Unmute spoken replies"} aria-pressed={voiceOut}
            style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${t.border}`, background: voiceOut ? "var(--accent-soft)" : t.glass, color: voiceOut ? "var(--accent)" : t.muted, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {voiceOut ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        )}
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px 20px", textAlign: "center" }}>
        {/* Orb on a soft neumorphic pad */}
        <div style={{ position: "relative", padding: 24, borderRadius: "50%", background: "var(--bg-tint)", boxShadow: "-10px -10px 22px var(--neu-light), 12px 12px 26px var(--neu-dark)" }}>
          <AICoachOrb size={132} state={orbStateFor(phase)} />
        </div>

        {convo && (
          <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 999, background: "var(--accent-soft)", color: "var(--accent-text)", fontSize: 12, fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} /> Live conversation
          </div>
        )}

        <p aria-live="polite" style={{ marginTop: 20, fontSize: 16, color: t.text, lineHeight: 1.6, maxWidth: 360, minHeight: 48, fontWeight: 500 }}>{caption}</p>

        {transcript && (
          <p style={{ marginTop: 4, fontSize: 13, color: t.muted, maxWidth: 360 }}>
            <span style={{ fontStyle: "italic" }}>“{transcript.replace(interim, "")}</span>
            {interim && <span style={{ opacity: 0.55 }}>{interim}</span>}
            <span style={{ fontStyle: "italic" }}>”</span>
          </p>
        )}

        {listening && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--accent)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
          </div>
        )}

        {/* Primary controls */}
        {phase !== "unsupported" && (
          <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            {listening ? (
              <button onClick={stopListening} aria-label="Stop recording"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 30px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#EC6A5E,#E5687C)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 54, boxShadow: "0 10px 26px rgba(229,104,124,0.32)" }}>
                <Square size={16} fill="#fff" /> Stop
              </button>
            ) : speaking ? (
              <button onClick={stopSpeaking} aria-label="Stop speaking"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 30px", borderRadius: 999, border: `1px solid ${t.border}`, background: t.glass, color: t.text, fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 54 }}>
                <Square size={15} /> Stop speaking
              </button>
            ) : (
              <button onClick={startListening} disabled={busy} aria-label="Tap to talk"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 32px", borderRadius: 999, border: "none", background: busy ? t.borderMid : "var(--grad-hero)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: busy ? "default" : "pointer", minHeight: 54, boxShadow: "0 10px 26px rgba(91,124,250,0.30)" }}>
                <Mic size={18} /> {busy ? "…" : "Tap to talk"}
              </button>
            )}

            {reply && !listening && !busy && (
              <button onClick={replay} aria-label="Replay response"
                style={{ width: 54, height: 54, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.glass, color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        )}

        {/* Conversation mode toggle / end */}
        {phase !== "unsupported" && phase !== "denied" && (
          <div style={{ marginTop: 16 }}>
            {!convo ? (
              <button onClick={startConversation}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, border: `1px solid ${t.border}`, background: t.glass, color: t.sub, fontSize: 13.5, fontWeight: 600, cursor: "pointer", minHeight: 44 }}>
                <MessageSquare size={16} /> Start live conversation
              </button>
            ) : (
              <button onClick={endConversation}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, border: "none", background: "var(--danger)", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", minHeight: 44 }}>
                <PhoneOff size={16} /> End conversation
              </button>
            )}
          </div>
        )}

        {/* Typed fallback */}
        {canType && (
          <div style={{ marginTop: 24, width: "100%", maxWidth: 380 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendTyped(); }}
                placeholder="Type what’s on your mind…" aria-label="Type your message to the coach"
                style={{ flex: 1, padding: "14px 16px", borderRadius: 14, border: `1px solid ${t.border}`, background: t.surface, color: t.text, fontSize: 14, outline: "none", minHeight: 48 }} />
              <button onClick={sendTyped} style={{ padding: "0 20px", borderRadius: 14, border: "none", background: "var(--grad-hero)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>Send</button>
            </div>
            <Link href="/coach" style={{ display: "inline-block", marginTop: 14, fontSize: 13, color: "var(--accent-text)", fontWeight: 600 }}>Or open the full text coach →</Link>
          </div>
        )}

        {/* Conversation history */}
        {history.length > 0 && (
          <div style={{ marginTop: 26, width: "100%", maxWidth: 400, textAlign: "left", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 2 }}>Conversation</div>
            {history.slice(-6).map((turn, i) => (
              <div key={i} style={{ alignSelf: turn.role === "you" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "10px 14px", borderRadius: 16, fontSize: 13.5, lineHeight: 1.45,
                background: turn.role === "you" ? "var(--accent)" : t.surface, color: turn.role === "you" ? "#fff" : t.text, border: turn.role === "you" ? "none" : `1px solid ${t.border}` }}>
                {turn.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
