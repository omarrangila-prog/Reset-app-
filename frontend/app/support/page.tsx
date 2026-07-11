"use client";

import { motion } from "framer-motion";
import { HeartHandshake, Phone, MessageSquare } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";

/**
 * When should I seek professional help? A calm, non-alarming page. RESET
 * supports recovery but is not a replacement for professional care.
 * Theme-aware.
 */
const SIGNS = [
  "You repeatedly can't control the behavior despite real effort.",
  "It's significantly affecting work, school, relationships, or finances.",
  "You feel depressed, hopeless, or unsafe.",
  "The behavior keeps escalating despite repeated attempts to change.",
];

const RESOURCES = [
  { label: "988 Suicide & Crisis Lifeline", value: "Call or text 988", href: "tel:988", Icon: Phone },
  { label: "Crisis Text Line", value: "Text HOME to 741741", href: "sms:741741", Icon: MessageSquare },
  { label: "SAMHSA Helpline", value: "1-800-662-4357 (free, 24/7)", href: "tel:18006624357", Icon: Phone },
];

export default function SupportPage() {
  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/settings" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Getting more support</div>
            <div style={{ fontSize: 12, color: t.muted }}>When to consider professional help</div>
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ borderRadius: 22, padding: "20px", margin: "16px 0 24px", background: "linear-gradient(145deg, var(--accent-soft), var(--bg-surface))", border: `1px solid ${t.border}` }}>
          <HeartHandshake size={26} color="var(--accent)" style={{ marginBottom: 12 }} />
          <p style={{ fontSize: 15.5, color: t.text, lineHeight: 1.6 }}>
            Reaching out for help is a sign of strength. Working with a therapist or counselor can make a real difference — many people find recovery goes faster with support.
          </p>
        </motion.div>

        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 12 }}>It may help to talk to someone if</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
          {SIGNS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: "flex", gap: 12, padding: "14px 16px", borderRadius: 16, background: "var(--bg-surface)", border: `1px solid ${t.border}`, boxShadow: "var(--shadow-sm)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", marginTop: 7, flexShrink: 0 }} aria-hidden />
              <span style={{ fontSize: 14.5, color: t.text, lineHeight: 1.55 }}>{s}</span>
            </motion.div>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 12 }}>If you need to reach a person now</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {RESOURCES.map((r) => (
            <a key={r.label} href={r.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "var(--bg-surface)", border: `1px solid ${t.border}`, boxShadow: "var(--shadow-sm)", textDecoration: "none" }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--accent-soft)", color: "var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><r.Icon size={18} /></span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: t.text }}>{r.label}</div>
                <div style={{ fontSize: 13, color: t.sub }}>{r.value}</div>
              </div>
            </a>
          ))}
        </div>

        <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.6, textAlign: "center", padding: "0 8px" }}>
          RESET supports your recovery but is not a replacement for professional care. If you&apos;re in immediate danger, call your local emergency number.
        </p>
      </div>
      <BottomNav />
    </div>
  );
}
