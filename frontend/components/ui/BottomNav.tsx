"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t } from "./theme";

/**
 * Floating bottom navigation with a centered, elevated primary action (Coach).
 * Original interpretation of the common "5-tab + raised center" pattern.
 */
const tabs = [
  { href: "/", label: "Home", icon: "◇" },
  { href: "/journey", label: "Journey", icon: "◒" },
  { href: "/coach", label: "Coach", icon: "✦", center: true },
  { href: "/dashboard", label: "Insights", icon: "◔" },
  { href: "/settings", label: "Profile", icon: "○" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 90,
        display: "flex",
        justifyContent: "center",
        padding: "10px 16px calc(10px + env(safe-area-inset-bottom))",
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
          maxWidth: 460,
          padding: "8px 14px",
          borderRadius: 26,
        }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          if (tab.center) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
                style={{
                  width: 56,
                  height: 56,
                  marginTop: -28,
                  borderRadius: "50%",
                  background: t.gradHero,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  boxShadow: t.shadowAccent,
                  flexShrink: 0,
                }}
              >
                {tab.icon}
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "6px 2px",
                minHeight: 44,
                color: active ? t.accent : t.muted,
                fontWeight: active ? 600 : 500,
              }}
            >
              <span style={{ fontSize: 18 }} aria-hidden>
                {tab.icon}
              </span>
              <span style={{ fontSize: 10, letterSpacing: "0.02em" }}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
