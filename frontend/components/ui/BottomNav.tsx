"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Home, Compass, Sparkles, BarChart3, User } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { t } from "./theme";

/**
 * Floating premium navigation — a fixed bottom dock that ALWAYS stays visible.
 * - Active tab expands into a glass pill: icon + label slides in.
 * - Centered elevated Coach action.
 * - Fixed to the viewport with safe-area padding; never scroll-hides.
 */
const tabs = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/journey", label: "Journey", Icon: Compass },
  { href: "/coach", label: "Coach", Icon: Sparkles, center: true },
  { href: "/dashboard", label: "Insights", Icon: BarChart3 },
  { href: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "calc(12px + env(safe-area-inset-bottom))",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "calc(100% - 32px)",
        maxWidth: 440,
      }}
    >
      <div
        className="dock frost"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          width: "100%",
          padding: "8px 12px",
          borderRadius: 28,
        }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const { Icon } = tab;

          if (tab.center) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
              onClick={() => haptic("tap")}
                style={{ flexShrink: 0 }}
              >
                <motion.span
                  whileTap={reduced ? undefined : { scale: 0.92 }}
                  whileHover={reduced ? undefined : { y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  style={{
                    width: 54,
                    height: 54,
                    marginTop: -22,
                    borderRadius: "50%",
                    background: t.gradHero,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: t.shadowAccent,
                  }}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </motion.span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              onClick={() => haptic("tap")}
              style={{ flex: active ? "0 0 auto" : "1", display: "flex", justifyContent: "center", minWidth: 0 }}
            >
              <motion.span
                layout
                whileTap={reduced ? undefined : { scale: 0.94 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: active ? 7 : 0,
                  padding: active ? "9px 16px" : "9px",
                  minHeight: 44,
                  borderRadius: 999,
                  background: active ? `${t.accent}16` : "transparent",
                  border: active ? `1px solid ${t.accent}26` : "1px solid transparent",
                  color: active ? t.accent : t.muted,
                }}
              >
                <motion.span
                  animate={active && !reduced ? { y: [-1, -3, -1] } : { y: 0 }}
                  transition={{ duration: 2.4, repeat: active ? Infinity : 0, ease: "easeInOut" }}
                  style={{ display: "inline-flex" }}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                </motion.span>
                <AnimatePresence>
                  {active && (
                    <motion.span
                      initial={reduced ? false : { width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
