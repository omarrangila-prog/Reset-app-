"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "../../lib/store";
import { api, InterventionResponse } from "../../lib/api";
import { CoachMessage } from "../../components/CoachMessage";
import { InterventionAction } from "../../components/InterventionAction";
import { LoadingState } from "../../components/LoadingState";
import { Button } from "../../components/Button";
import { ResetAudioEngine, AudioMode } from "../../lib/audioEngine";

type Mode = "URGE" | "VULNERABILITY" | "RECOVERY";

type ModeConfig = {
  bg: string;
  accent: string;
  label: string;
  heading: string;
  description: string;
  placeholder: string;
  defaultMessage: string;
};

const modeConfig: Record<Mode, ModeConfig> = {
  URGE: {
    bg: "#100503",
    accent: "#FF3333",
    label: "CRISIS INTERVENTION",
    heading: "Pull the urge out into the open.",
    description:
      "This mode is here to transform pressure into action. Ground the feeling, make a clear choice, and step back from impulsive momentum.",
    placeholder: "Describe what’s happening in the moment.",
    defaultMessage: "I feel an urge and I need help right now.",
  },
  VULNERABILITY: {
    bg: "#120f08",
    accent: "#F5A623",
    label: "SOFT SPACE",
    heading: "Name the feeling without judgment.",
    description:
      "This space helps you listen to what is actually underneath the impulse. Vulnerability is a signal. The coach is a gentle mirror.",
    placeholder: "Share what you are feeling right now.",
    defaultMessage: "I’m feeling vulnerable and need support.",
  },
  RECOVERY: {
    bg: "#061207",
    accent: "#1DB954",
    label: "RECOVERY REPORT",
    heading: "Strengthen what you did right.",
    description:
      "Recovery is about honoring progress and choosing the next best move. Reflect on the moment to make your calm routine more resilient.",
    placeholder: "How are you doing today?",
    defaultMessage: "I want to check in on my progress.",
  },
};

const getDemoResponse = (mode: Mode, urgency: number): InterventionResponse => {
  const responses: Record<Mode, Omit<InterventionResponse, "mode" | "urgencyScore">> = {
    URGE: {
      message:
        "Stand up now. Breathe slow. The urge is a waveform — it will pass if you don’t chase it. Move through it with intention.",
      actionSteps: ["Stand and breathe", "Drink a full glass of water", "Move your body for 60 seconds"],
      context: { streak: 0, disciplineScore: 0 },
    },
    VULNERABILITY: {
      message:
        "This feeling is speaking. Ask yourself: what does it really want? A connection, a break, or a pause? Choose one small human response.",
      actionSteps: ["Name the emotion", "Write one honest sentence", "Reach out to someone real"],
      context: { streak: 0, disciplineScore: 0 },
    },
    RECOVERY: {
      message:
        "You are accumulating calm through each choice. Reflect on what changed, then decide one simple next step that supports the reset.",
      actionSteps: ["Log today’s win", "Describe one thing learned", "Plan a small morning anchor"],
      context: { streak: 0, disciplineScore: 0 },
    },
  };

  return {
    ...responses[mode],
    mode,
    urgencyScore: urgency,
  };
};

function CoachPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, user } = useAppStore();
  const [mode, setMode] = useState<Mode>((searchParams.get("mode") as Mode) || "RECOVERY");
  const [message, setMessage] = useState("");
  const [urgencyScore, setUrgencyScore] = useState(parseInt(searchParams.get("urgency") || "5", 10));
  const [response, setResponse] = useState<InterventionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoSent, setAutoSent] = useState(false);
  const audioRef = useRef<ResetAudioEngine | null>(null);

  const config = modeConfig[mode];

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new ResetAudioEngine();
      audioRef.current.setMode(mode === "URGE" ? "URGE" : mode === "VULNERABILITY" ? "VULNERABILITY" : "CALM");
    }
  }, []);

  useEffect(() => {
    audioRef.current?.setMode(mode === "URGE" ? "URGE" : mode === "VULNERABILITY" ? "VULNERABILITY" : "CALM");
  }, [mode]);

  useEffect(() => {
    if (mode === "URGE" && !autoSent) {
      setAutoSent(true);
      setTimeout(() => sendMessage(config.defaultMessage, "URGE", urgencyScore), 250);
    }
  }, [mode, autoSent, config.defaultMessage, urgencyScore]);

  const speakResponse = (text: string) => {
    audioRef.current?.speak(text, { rate: 0.94, pitch: 1.0 });
  };

  const sendMessage = async (
    msg: string,
    overrideMode?: Mode,
    overrideUrgency?: number
  ) => {
    const finalMessage = msg || message || config.defaultMessage;
    const finalMode = overrideMode || mode;
    const finalUrgency = overrideUrgency ?? urgencyScore;

    if (!finalMessage.trim()) {
      setError("Describe your experience so the coach can respond.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await audioRef.current?.resume();
      // userId comes from the session cookie server-side; never sent by client.
      const result = await api.intervene(finalMessage, finalUrgency);

      setResponse(result);
      // Crisis responses are not a coaching "mode" — keep the current visual mode.
      if (result.mode !== "CRISIS") setMode(result.mode as Mode);
      speakResponse(result.message);

      // Log the urge for analytics (note is encrypted server-side). Best-effort.
      if (userId && !result.crisis) {
        api
          .createLog({ type: "URGE", note: finalMessage, intensity: finalUrgency })
          .catch(() => {});
      }
    } catch (e) {
      // Network/server error — degrade to a safe scripted response, never demo fiction.
      const safe = getDemoResponse(finalMode, finalUrgency);
      setResponse(safe);
      speakResponse(safe.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-slate-950 text-white"
      style={{ background: config.bg }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.05),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-black/50" />
      <div className="relative z-20 mx-auto max-w-[1200px] px-6 py-8 sm:px-10">
        <header className="mb-10 flex flex-col gap-5 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:text-white">
              ← Return to RESET
            </Link>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Cinematic coach</p>
            <h1 className="text-3xl font-heading tracking-[-0.04em] text-white sm:text-4xl">{config.heading}</h1>
          </div>

          <div className="grid gap-3 sm:text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: config.accent }} />
              {config.label}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              Streak: <span className="font-semibold text-white">{user?.streak ?? 0} days</span>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-[32px] border border-white/10 bg-black/70 p-8 shadow-panel backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">{config.label}</p>
                  <p className="mt-4 text-base leading-7 text-slate-300">{config.description}</p>
                </div>
                <div className="grid gap-2 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Urgency</div>
                  <div className="text-lg font-semibold text-white">{urgencyScore}/10</div>
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Mode</div>
                  <div className="text-lg font-semibold text-white">{mode}</div>
                </div>
              </div>
            </section>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.section
                  key="coach-loading"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-panel backdrop-blur-xl"
                >
                  <LoadingState
                    message={
                      mode === "URGE"
                        ? "Interrupting the loop..."
                        : mode === "VULNERABILITY"
                        ? "Reflecting with care..."
                        : "Reinforcing progress..."
                    }
                    mode={mode}
                    size="lg"
                  />
                </motion.section>
              ) : response ? (
                <motion.section
                  key="coach-response"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-panel backdrop-blur-xl"
                >
                  <CoachMessage
                    message={response.message}
                    mode={response.mode === "CRISIS" ? "URGE" : (response.mode as Mode)}
                    actionSteps={response.actionSteps}
                  />
                  {response.crisis && response.resources && (
                    <div
                      role="alert"
                      className="mt-6 grid gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 p-5"
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200">
                        Immediate support
                      </p>
                      {response.resources.map((r) => (
                        <a
                          key={r.label}
                          href={r.href}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white transition hover:bg-black/60"
                        >
                          <span className="font-medium">{r.label}</span>
                          <span className="text-slate-200">{r.value}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </motion.section>
              ) : (
                <motion.section
                  key="coach-prompt"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-panel backdrop-blur-xl"
                >
                  <div className="space-y-4">
                    <div className="text-sm uppercase tracking-[0.3em] text-slate-400">Ready for a guided reset</div>
                    <p className="text-lg leading-8 text-slate-200">Type how you feel right now, or let the coach step in immediately using the urgency prompt.</p>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <section className="grid gap-4 rounded-[32px] border border-white/10 bg-black/70 p-8 shadow-panel backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-3">
                {(["URGE", "VULNERABILITY", "RECOVERY"] as Mode[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setMode(option);
                      setResponse(null);
                      setError("");
                    }}
                    className={`rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition ${
                      mode === option
                        ? "bg-white text-slate-950"
                        : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="grid gap-4">
                {mode === "URGE" && (
                  <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-slate-400">
                      <span>Urgency intensity</span>
                      <span className="text-white">{urgencyScore}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={urgencyScore}
                      onChange={(event) => setUrgencyScore(parseInt(event.target.value, 10))}
                      className="w-full accent-rose-400"
                    />
                  </div>
                )}
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage(message);
                    }
                  }}
                  placeholder={config.placeholder}
                  rows={5}
                  className="min-h-[180px] rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/20"
                />
                {error && <div className="text-sm text-rose-400">{error}</div>}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setResponse(null);
                      setMessage("");
                      setError("");
                    }}
                  >
                    Reset prompt
                  </Button>
                  <Button
                    variant={mode === "URGE" ? "urge" : "primary"}
                    size="lg"
                    loading={loading}
                    fullWidth
                    onClick={() => sendMessage(message)}
                  >
                    {mode === "URGE" ? "INTERVENE NOW" : "Send coach"}
                  </Button>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-panel backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Your momentum</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl bg-black/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total urges</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{user?.totalUrges ?? 0}</p>
                </div>
                <div className="rounded-3xl bg-black/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Longest streak</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{user?.longestStreak ?? 0}d</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-black/70 p-8 shadow-panel backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Mini ritual</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <p>1. Pause and breathe for 8 seconds.</p>
                <p>2. Name the urge without reacting.</p>
                <p>3. Choose one small physical action now.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-panel backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Coach mode guide</p>
              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                {Object.entries(modeConfig).map(([key, value]) => (
                  <div key={key} className="rounded-3xl border border-white/10 bg-black/50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-white">{key}</span>
                      <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{value.label}</span>
                    </div>
                    <p className="mt-2 leading-6 text-slate-400">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <CoachPageInner />
    </Suspense>
  );
}
