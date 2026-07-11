"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Mic, Square, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { AICoachOrb, OrbState } from "@/components/ui/AICoachOrb";
import { t } from "@/components/ui/theme";
import { api } from "@/lib/api";
import { haptic } from "@/lib/haptics";

/**
 * Voice Coach — talk out loud; the coach listens (live transcription) and can
 * speak back. Uses the Web Speech API (SpeechRecognition + speechSynthesis).
 *
 * Full flow: idle → permission → listening (live transcript) → stop → send to
 * AI Coach → response → optional spoken reply. Honest fallback to typing when
 * recognition is unsupported (e.g. most iOS Safari) or permission is denied.
 * Reuses the same /coach/intervene endpoint as text chat, so crisis detection
 * and safe fallbacks still apply.
 */
type Phase = "idle" | "listening" | "thinking" | "speaking" | "error" | "denied" | "unsupported";

const orbStateFor = (p: Phase): OrbState =>
  p === "listening" ? "listening" : p === "thinking" ? "thinking" : p === "speaking" ? "speaking" : "idle";

export default function VoiceCoachPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [caption, setCaption] = useState("Tap the mic and talk. I’m listening.");
  const [transcript, setTranscript] = useState(""); // live (interim + final)
  const [reply, setReply] = useState("");
  const [voiceOut, setVoiceOut] = useState(true); // TTS on by default; user can mute
  const [elapsed, setElapsed] = useState(0);
  const [typed, setTyped] = useState("");

  const recogRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef(""); // accumulated final transcript
  const ttsSupported = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Feature detection + recognition setup ──────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    ttsSupported.current = "speechSynthesis" in window;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setPhase("unsupported");
      setCaption("Voice recognition isn’t supported in this browser yet.");
      return;
    }
    const r = new SR();
    r.lang = navigator.language || "en-US";
    r.continuous = false;
    r.interimResults = true; // live transcription
    r.maxAlternatives = 1;

    r.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalRef.current += res[0].transcript;
        else interim += res[0].transcript;
      }
      setTranscript((finalRef.current + interim).trim());
    };
    r.onspeechend = () => { try { r.stop(); } catch {} };
    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      stopTimer();
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setPhase("denied");
        setCaption("Microphone access is off. Enable it in your browser settings, or type below.");
      } else if (e.error === "no-speech") {
        setPhase("idle");
        setCaption("I didn’t hear anything — tap the mic and try again.");
      } else if (e.error === "aborted") {
        setPhase("idle");
      } else if (e.error === "network") {
        setPhase("error");
        setCaption("Speech needs a connection right now. You can type instead.");
      } else {
        setPhase("error");
        setCaption("Something interrupted the mic. Tap to try again, or type below.");
      }
    };
    r.onend = () => {
      stopTimer();
      setPhase((p) => {
        if (p !== "listening") return p;
        const text = finalRef.current.trim();
        if (text) { void handle(text); return "thinking"; }
        setCaption("I didn’t catch that — tap the mic to try again.");
        return "idle";
      });
    };
    recogRef.current = r;
    return () => {
      try { r.abort(); } catch {}
      window.speechSynthesis?.cancel();
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  // ── Text-to-speech ─────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!ttsSupported.current || !voiceOut) { setPhase("idle"); setCaption("I’m here. Tap the mic to talk again."); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.98; u.pitch = 1; u.lang = navigator.language || "en-US";
    const preferred = window.speechSynthesis.getVoices().find((v) => /en/i.test(v.lang) && /female|samantha|google/i.test(v.name));
    if (preferred) u.voice = preferred;
    u.onstart = () => setPhase("speaking");
    u.onend = () => { setPhase("idle"); setCaption("I’m here. Tap the mic to talk again."); };
    window.speechSynthesis.speak(u);
  }, [voiceOut]);

  const handle = useCallback(async (text: string) => {
    setPhase("thinking");
    setCaption("Thinking…");
    try {
      const res = await api.intervene(text, 6);
      setReply(res.message);
      setCaption(res.message);
      speak(res.message);
    } catch {
      const msg = "I’m right here with you. Take one slow breath — in for four, out for six.";
      setReply(msg); setCaption(msg); speak(msg);
    }
  }, [speak]);

  // ── Controls ────────────────────────────────────────────────────────────────
  const startListening = () => {
    if (!recogRef.current || phase === "listening") return;
    window.speechSynthesis?.cancel();
    finalRef.current = "";
    setTranscript("");
    setReply("");
    setPhase("listening");
    setCaption("Listening… tap stop when you’re done.");
    setElapsed(0);
    haptic("orb");
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    try { recogRef.current.start(); }
    catch { /* start() throws if already started — ignore */ }
  };

  const stopListening = () => {
    if (!recogRef.current) return;
    haptic("tap");
    try { recogRef.current.stop(); } catch {}
  };

  const replay = () => { if (reply) { setVoiceOut(true); speak(reply); } };
  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setPhase("idle"); };

  const sendTyped = () => {
    const text = typed.trim();
    if (!text) return;
    setTranscript(text);
    setTyped("");
    haptic("select");
    void handle(text);
  };

  const toggleVoiceOut = () => {
    setVoiceOut((v) => {
      const next = !v;
      if (!next) window.speechSynthesis?.cancel();
      return next;
    });
    haptic("select");
  };

  const canType = phase === "unsupported" || phase === "denied" || phase === "error";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1, background: "linear-gradient(165deg, #EAF0FF 0%, #F3EEFF 55%, #EAFBF4 100%)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/coach" aria-label="Back to chat" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.7)", border: `1px solid ${t.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: t.sub, boxShadow: "-3px -3px 8px rgba(255,255,255,0.8), 3px 3px 8px rgba(90,100,150,0.10)" }}>‹</Link>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>Voice coach</div>
        </div>
        {/* Voice output mute/unmute */}
        {phase !== "unsupported" && (
          <button onClick={toggleVoiceOut} aria-label={voiceOut ? "Mute spoken replies" : "Unmute spoken replies"} aria-pressed={voiceOut}
            style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${t.border}`, background: voiceOut ? "#EEF1FF" : "rgba(255,255,255,0.7)", color: voiceOut ? t.accent : t.muted, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            {voiceOut ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        )}
      </header>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px 32px", textAlign: "center" }}>
        {/* Orb — grounded on a soft neumorphic pad */}
        <div style={{ position: "relative", padding: 26, borderRadius: "50%", background: "linear-gradient(145deg,#F7F9FF,#E7ECFA)", boxShadow: "-10px -10px 22px rgba(255,255,255,0.9), 12px 12px 26px rgba(90,100,150,0.14), inset 1px 1px 0 rgba(255,255,255,0.7)" }}>
          <AICoachOrb size={140} state={orbStateFor(phase)} />
        </div>

        <p aria-live="polite" style={{ marginTop: 30, fontSize: 16, color: t.text, lineHeight: 1.6, maxWidth: 360, minHeight: 54, fontWeight: 500 }}>
          {caption}
        </p>

        {/* Live transcript */}
        {transcript && (
          <p style={{ marginTop: 6, fontSize: 13, color: t.muted, maxWidth: 360, fontStyle: "italic" }}>
            “{transcript}”
          </p>
        )}

        {/* Elapsed timer while listening */}
        {phase === "listening" && (
          <div style={{ marginTop: 10, fontSize: 12, color: t.accent, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {String(Math.floor(elapsed / 60)).padStart(1, "0")}:{String(elapsed % 60).padStart(2, "0")}
          </div>
        )}

        {/* Primary control */}
        {phase !== "unsupported" && (
          <div style={{ marginTop: 26, display: "flex", gap: 12, alignItems: "center" }}>
            {phase === "listening" ? (
              <button onClick={stopListening} aria-label="Stop recording"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 30px", borderRadius: 999, border: "none", background: "linear-gradient(135deg,#EC6A5E,#E5687C)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 54, boxShadow: "0 10px 26px rgba(229,104,124,0.32)" }}>
                <Square size={16} fill="#fff" /> Stop
              </button>
            ) : phase === "speaking" ? (
              <button onClick={stopSpeaking} aria-label="Stop speaking"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 30px", borderRadius: 999, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.7)", color: t.text, fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 54 }}>
                <Square size={15} /> Stop
              </button>
            ) : (
              <button onClick={startListening} disabled={phase === "thinking"} aria-label="Tap to talk"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 32px", borderRadius: 999, border: "none", background: phase === "thinking" ? t.borderMid : "linear-gradient(135deg,#6E8CFB,#9B7BF2)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: phase === "thinking" ? "default" : "pointer", minHeight: 54, boxShadow: "0 10px 26px rgba(91,124,250,0.30)" }}>
                <Mic size={18} /> {phase === "thinking" ? "Thinking…" : "Tap to talk"}
              </button>
            )}

            {reply && phase !== "listening" && phase !== "thinking" && (
              <button onClick={replay} aria-label="Replay response"
                style={{ width: 54, height: 54, borderRadius: "50%", border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.7)", color: t.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "-4px -4px 10px rgba(255,255,255,0.8), 4px 4px 10px rgba(90,100,150,0.10)" }}>
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        )}

        {/* Honest fallback: type when voice is unsupported / denied / errored */}
        {canType && (
          <div style={{ marginTop: 26, width: "100%", maxWidth: 380 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") sendTyped(); }}
                placeholder="Type what’s on your mind…"
                aria-label="Type your message to the coach"
                style={{ flex: 1, padding: "14px 16px", borderRadius: 14, border: `1px solid ${t.border}`, background: "rgba(255,255,255,0.85)", color: t.text, fontSize: 14, outline: "none", minHeight: 48 }}
              />
              <button onClick={sendTyped} style={{ padding: "0 20px", borderRadius: 14, border: "none", background: t.gradHero, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}>
                Send
              </button>
            </div>
            <Link href="/coach" style={{ display: "inline-block", marginTop: 14, fontSize: 13, color: t.accent, fontWeight: 600 }}>
              Or open the full text coach →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
