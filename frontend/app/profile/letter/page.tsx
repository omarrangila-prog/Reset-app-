"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { useToast } from "@/components/ui/SaveToast";
import { loadLetter, saveLetter } from "@/lib/wins";

/**
 * Future Me — a letter from the user to themselves. Surfaced in difficult
 * moments; often more powerful than AI encouragement because it's in their own
 * words. Private, theme-aware.
 */
const TEMPLATE = `Dear Future Me,

I'm starting RESET because…

I want my life to be…

When things get difficult, please remind me…`;

export default function FutureMePage() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const existing = loadLetter();
    setText(existing || TEMPLATE);
    setLoaded(true);
  }, []);

  const save = () => {
    saveLetter(text.trim());
    toast("Saved", { kind: "success", subtitle: "Your letter is safe." });
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/profile" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>A letter to future me</div>
            <div style={{ fontSize: 12, color: t.muted }}>In your own words</div>
          </div>
        </header>

        <p style={{ fontSize: 14, color: t.sub, lineHeight: 1.6, margin: "12px 0 20px" }}>
          Write to yourself now, while you&apos;re clear. On a difficult day, RESET can show you this — a reminder that comes from you.
        </p>

        <div style={{ background: "var(--card-sculpted)", border: `1px solid ${t.border}`, borderRadius: 22, padding: "18px", boxShadow: "var(--shadow-md)", marginBottom: 20 }}>
          {loaded && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 4000))}
              aria-label="Your letter to your future self"
              style={{ width: "100%", minHeight: 260, resize: "none", border: "none", outline: "none", background: "transparent", color: t.text, fontSize: 15.5, lineHeight: 1.7, fontFamily: t.fontBody, boxSizing: "border-box" }}
            />
          )}
        </div>

        <button onClick={save} style={{ width: "100%", padding: "16px", borderRadius: 16, border: "none", background: "var(--grad-hero)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 54, boxShadow: "var(--shadow-accent)" }}>
          Save my letter
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
