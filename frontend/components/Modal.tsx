"use client";

import { useEffect, useRef, useCallback, ReactNode } from "react";

/**
 * Accessible modal dialog: role="dialog" + aria-modal, focus trap, Escape to
 * close, focus restoration, and backdrop click. Respects prefers-reduced-motion
 * via CSS in globals. Used app-wide so every overlay meets WCAG 2.4.3 / 2.1.2.
 */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  align?: "center" | "bottom";
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, align = "center" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useRef(`modal-${Math.random().toString(36).slice(2)}`).current;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        ).filter((el) => el.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    document.addEventListener("keydown", handleKeyDown);
    // Move focus into the dialog.
    const t = setTimeout(() => {
      const focusable = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      focusable?.focus();
    }, 0);
    // Prevent background scroll.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28, 35, 51, 0.42)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: align === "bottom" ? "flex-end" : "center",
        alignItems: align === "bottom" ? "stretch" : "center",
        zIndex: 1000,
        padding: align === "bottom" ? "20px" : "24px",
        paddingBottom: "max(20px, env(safe-area-inset-bottom))",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          background: "#FFFFFF",
          borderRadius: align === "bottom" ? "24px 24px 0 0" : 20,
          padding: 24,
          maxHeight: "80vh",
          maxWidth: 520,
          width: "100%",
          margin: align === "bottom" ? undefined : "0 auto",
          border: "1px solid #E6EAF2",
          boxShadow: "0 -8px 40px rgba(28,35,51,0.16)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          id={titleId}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#646E80",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}
