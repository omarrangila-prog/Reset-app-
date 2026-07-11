"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, X, MessageCircle } from "lucide-react";
import { BottomNav } from "@/components/ui/BottomNav";
import { BackButton } from "@/components/ui/BackButton";
import { t } from "@/components/ui/theme";
import { useToast } from "@/components/ui/SaveToast";
import { haptic } from "@/lib/haptics";

/**
 * Accountability — add trusted people you can reach in a difficult moment.
 * Fully optional and can be turned off. RESET never shares anything about porn
 * use, and never sends anything automatically — messages open your own app so
 * YOU choose to send. Contacts are stored locally (private).
 */
interface Contact { id: string; name: string; relationship: string; method: string }
const KEY = "reset_accountability";
const ENABLED_KEY = "reset_accountability_on";
const QUICK_MSG = "I'm having a difficult moment. Can you check in with me?";

export default function AccountabilityPage() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({ name: "", relationship: "", method: "" });

  useEffect(() => {
    try {
      setContacts(JSON.parse(localStorage.getItem(KEY) || "[]"));
      const on = localStorage.getItem(ENABLED_KEY);
      setEnabled(on === null ? true : on === "true");
    } catch {}
  }, []);

  const persist = (list: Contact[]) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {} };
  const add = () => {
    if (!form.name.trim()) return;
    haptic("select");
    const c: Contact = { id: `c-${Date.now()}`, name: form.name.trim(), relationship: form.relationship.trim(), method: form.method.trim() };
    const next = [...contacts, c]; setContacts(next); persist(next); setForm({ name: "", relationship: "", method: "" });
    toast("Saved", { kind: "success", subtitle: "Added to your circle." });
  };
  const remove = (id: string) => { haptic("tap"); const next = contacts.filter((c) => c.id !== id); setContacts(next); persist(next); };
  const toggleEnabled = () => { setEnabled((e) => { const v = !e; try { localStorage.setItem(ENABLED_KEY, String(v)); } catch {} return v; }); haptic("select"); };

  const message = (c: Contact) => {
    // Open the user's own app — they choose to send. Nothing is auto-sent.
    haptic("tap");
    const method = c.method.trim();
    if (/@/.test(method)) window.location.href = `mailto:${method}?subject=${encodeURIComponent("Checking in")}&body=${encodeURIComponent(QUICK_MSG)}`;
    else if (method) window.location.href = `sms:${method.replace(/\s/g, "")}?&body=${encodeURIComponent(QUICK_MSG)}`;
    else toast("Add a phone or email", { kind: "info", subtitle: "So you can reach them in one tap." });
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 130px", position: "relative", zIndex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <BackButton fallbackHref="/profile" />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: t.text }}>Accountability</div>
            <div style={{ fontSize: 12, color: t.muted }}>Trusted people, on your terms</div>
          </div>
        </header>

        {/* Enable toggle + privacy note */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 18, background: "var(--bg-surface)", border: `1px solid ${t.border}`, margin: "16px 0 12px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Enable accountability</div>
            <div style={{ fontSize: 12.5, color: t.sub, marginTop: 2, lineHeight: 1.5 }}>Nothing is ever sent automatically. You always choose.</div>
          </div>
          <button onClick={toggleEnabled} role="switch" aria-checked={enabled} aria-label="Enable accountability"
            style={{ width: 48, height: 28, borderRadius: 999, border: "none", background: enabled ? "var(--accent)" : t.borderMid, position: "relative", cursor: "pointer", flexShrink: 0, minHeight: 28 }}>
            <span aria-hidden style={{ position: "absolute", top: 3, left: enabled ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: t.muted, lineHeight: 1.6, margin: "0 4px 22px" }}>
          RESET never reveals anything about porn use. A message only says you&apos;re having a difficult moment — and only when you send it yourself.
        </p>

        {enabled && (
          <>
            {/* Contacts */}
            {contacts.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                <AnimatePresence initial={false}>
                  {contacts.map((c) => (
                    <motion.div key={c.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, background: "var(--bg-surface)", border: `1px solid ${t.border}`, boxShadow: "var(--shadow-sm)" }}>
                      <span style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--grad-hero)", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{c.name.charAt(0).toUpperCase()}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{c.name}</div>
                        <div style={{ fontSize: 12.5, color: t.sub }}>{[c.relationship, c.method].filter(Boolean).join(" · ") || "Tap to add contact"}</div>
                      </div>
                      <button onClick={() => message(c)} aria-label={`Message ${c.name}`} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: "var(--accent-soft)", color: "var(--accent)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MessageCircle size={18} /></button>
                      <button onClick={() => remove(c.id)} aria-label={`Remove ${c.name}`} style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "transparent", color: t.muted, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X size={16} /></button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Add form */}
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: t.muted, marginBottom: 12 }}>Add a trusted person</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" aria-label="Name" style={inputStyle} />
              <input value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="Relationship (e.g. friend)" aria-label="Relationship" style={inputStyle} />
              <input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="Phone or email" aria-label="Phone or email" style={inputStyle} />
            </div>
            <button onClick={add} disabled={!form.name.trim()} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "15px", borderRadius: 16, border: "none", background: form.name.trim() ? "var(--grad-hero)" : t.borderMid, color: "#fff", fontSize: 15, fontWeight: 600, cursor: form.name.trim() ? "pointer" : "default", minHeight: 52, boxShadow: form.name.trim() ? "var(--shadow-accent)" : "none" }}>
              <UserPlus size={18} /> Add person
            </button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "14px 16px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text)", fontSize: 14.5, outline: "none", minHeight: 50,
};
