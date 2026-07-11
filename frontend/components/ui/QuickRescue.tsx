"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LifeBuoy, Wind, BookOpen, MessageCircle, Footprints, X } from "lucide-react";
import { haptic } from "@/lib/haptics";

/**
 * Quick Rescue — an intentional floating support orb (bottom-right). A single
 * tap opens Calm Mode; a long-press (or the ⋯ affordance) reveals quick support
 * actions: Breathe, Journal, Talk, Walk, Dismiss. Gentle breathing when idle,
 * pressed depth on touch, soft glow in dark mode. Hidden on urge/coach screens.
 */
const ACTIONS = [
  { key: "breathe", label: "Breathe", Icon: Wind, href: "/urge" },
  { key: "journal", label: "Journal", Icon: BookOpen, href: "/journey/journal" },
  { key: "talk", label: "Talk", Icon: MessageCircle, href: "/coach" },
  { key: "walk", label: "Walk", Icon: Footprints, href: "/habits" },
];

export function QuickRescue() {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  if (pathname === "/urge" || pathname?.startsWith("/coach")) return null;

  const startPress = () => {
    longPressed.current = false;
    pressTimer.current = setTimeout(() => { longPressed.current = true; haptic("orb"); setOpen(true); }, 450);
  };
  const endPress = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };
  const onTap = () => {
    if (longPressed.current) return; // long-press already opened the menu
    if (open) { setOpen(false); return; }
    haptic("orb");
    router.push("/urge");
  };
  const go = (href: string) => { haptic("select"); setOpen(false); router.push(href); };

  return (
    <>
      {/* Backdrop when the action menu is open */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 94, background: "rgba(10,13,25,0.28)", backdropFilter: "blur(2px)" }}
          />
        )}
      </AnimatePresence>

      <div style={{ position: "fixed", right: 18, bottom: "calc(96px + env(safe-area-inset-bottom))", zIndex: 95, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
        {/* Quick support actions (long-press) */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 460, damping: 30 }}
              style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}
              role="menu"
              aria-label="Quick support"
            >
              {ACTIONS.map((a) => (
                <button key={a.key} role="menuitem" onClick={() => go(a.href)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 999, background: "var(--bg-glass-strong)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13.5, fontWeight: 600, cursor: "pointer", minHeight: 44, boxShadow: "var(--shadow-md)", backdropFilter: "blur(14px)" }}>
                  <a.Icon size={16} color="var(--accent)" /> {a.label}
                </button>
              ))}
              <button role="menuitem" onClick={() => setOpen(false)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer", minHeight: 40 }}>
                <X size={15} /> Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The orb */}
        <motion.button
          onClick={onTap}
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={endPress}
          aria-label="Quick rescue — tap for calm mode, hold for support options"
          aria-haspopup="menu"
          aria-expanded={open}
          whileTap={reduced ? undefined : { scale: 0.9 }}
          animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
          transition={{ scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }, default: { type: "spring", stiffness: 400, damping: 22 } }}
          style={{
            width: 56, height: 56, borderRadius: "50%",
            border: "1px solid var(--glass-stroke)",
            background: "radial-gradient(circle at 34% 30%, rgba(255,255,255,0.95), rgba(200,210,255,0.8) 40%, var(--accent) 100%)",
            boxShadow: "0 12px 32px rgba(124,107,240,0.45), 0 0 0 1px rgba(167,139,250,0.15), inset 0 2px 8px rgba(255,255,255,0.6)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <LifeBuoy size={24} strokeWidth={2.2} color="#3A2F8F" />
        </motion.button>
      </div>
    </>
  );
}
