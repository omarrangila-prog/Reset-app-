"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, AlertTriangle, Info, X } from "lucide-react";
import { haptic } from "@/lib/haptics";

/**
 * Global, theme-aware feedback system. A small glass/neumorphic capsule rises
 * from the bottom, auto-dismisses, and announces via aria-live. Use anywhere:
 *
 *   const { toast } = useToast();
 *   toast("Saved", { kind: "success", subtitle: "Your reflection is safe." });
 */
type Kind = "success" | "error" | "info" | "warning";
interface ToastData { id: number; title: string; subtitle?: string; kind: Kind }
interface ToastOpts { kind?: Kind; subtitle?: string; duration?: number }

const ToastCtx = createContext<{ toast: (title: string, opts?: ToastOpts) => void } | null>(null);

const ACCENT: Record<Kind, { color: string; Icon: typeof Check }> = {
  success: { color: "var(--recovery)", Icon: Check },
  error: { color: "var(--danger)", Icon: X },
  warning: { color: "var(--vuln)", Icon: AlertTriangle },
  info: { color: "var(--accent)", Icon: Info },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastData[]>([]);
  const idRef = useRef(0);
  const reduced = useReducedMotion();

  const toast = useCallback((title: string, opts: ToastOpts = {}) => {
    const id = ++idRef.current;
    const kind = opts.kind ?? "success";
    setItems((prev) => [...prev, { id, title, subtitle: opts.subtitle, kind }]);
    haptic(kind === "error" ? "warning" : "success");
    const dur = opts.duration ?? (opts.subtitle ? 2400 : 1800);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), dur);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "calc(88px + env(safe-area-inset-bottom))",
          zIndex: 12000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence>
          {items.map((it) => {
            const a = ACCENT[it.kind];
            return (
              <motion.div
                key={it.id}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 460, damping: 30 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 16px 11px 12px",
                  borderRadius: 999,
                  background: "var(--bg-glass-strong)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(18px) saturate(140%)",
                  WebkitBackdropFilter: "blur(18px) saturate(140%)",
                  boxShadow: "var(--shadow-lg)",
                  color: "var(--text)",
                  maxWidth: 320,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: a.color,
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <motion.span
                    initial={reduced ? undefined : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.08, type: "spring", stiffness: 500, damping: 20 }}
                    style={{ display: "inline-flex" }}
                  >
                    <a.Icon size={15} strokeWidth={3} />
                  </motion.span>
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{it.title}</div>
                  {it.subtitle && (
                    <div style={{ fontSize: 12.5, color: "var(--text-sub)", marginTop: 1 }}>{it.subtitle}</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) return { toast: () => {} }; // no-op if provider absent
  return ctx;
}
