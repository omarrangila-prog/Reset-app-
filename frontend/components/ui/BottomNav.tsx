"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Home, Compass, Sparkles, BarChart3, User } from "lucide-react";
import { t } from "./theme";

/**
 * Floating premium navigation.
 * - Active tab EXPANDS into a glass pill: icon + label slides in.
 * - Inactive tabs are icon-only.
 * - Centered elevated Coach action.
 * - Scroll-adaptive: shrinks on scroll-down, expands on scroll-up (Arc/Airbnb).
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
  const [hidden, setHidden] = useState(false);

  // Shrink/hide on scroll-down, reveal on scroll-up.
  useEffect(() => {
    if (reduced) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > last + 8 && y > 80) setHidden(true);
      else if (y < last - 8) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  return (
    <motion.nav
      aria-label="Primary"
      animate={{ y: hidden ? 90 : 0, opacity: hidden ? 0.85 : 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 90,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px calc(14px + env(safe-area-inset-bottom))",
        pointerEvents: "none",
      }}
    >
      <div
        className="glass"
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          width: "100%",
          maxWidth: 440,
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
    </motion.nav>
  );
}
