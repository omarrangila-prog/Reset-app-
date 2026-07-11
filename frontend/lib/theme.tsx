"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeCtx {
  pref: ThemePref;
  resolved: ResolvedTheme;
  setPref: (p: ThemePref) => void;
  toggle: () => void; // light <-> dark
}

const Ctx = createContext<ThemeCtx | null>(null);
const STORAGE_KEY = "reset-theme";

function systemDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

function resolve(pref: ThemePref): ResolvedTheme {
  if (pref === "system") return systemDark() ? "dark" : "light";
  return pref;
}

// Applied to <html> and the browser theme-color meta so PWA chrome matches.
function apply(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "dark" ? "#0D1020" : "#F5F7FC");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  // Hydrate from storage (the pre-paint script already set the attribute).
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemePref | null) || "system";
    setPrefState(stored);
    const r = resolve(stored);
    setResolved(r);
    apply(r);
  }, []);

  // Follow the OS when in "system" mode.
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { const r = systemDark() ? "dark" : "light"; setResolved(r); apply(r); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    localStorage.setItem(STORAGE_KEY, p);
    const r = resolve(p);
    setResolved(r);
    apply(r);
  }, []);

  const toggle = useCallback(() => {
    setPref(resolved === "dark" ? "light" : "dark");
  }, [resolved, setPref]);

  return <Ctx.Provider value={{ pref, resolved, setPref, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used within ThemeProvider");
  return c;
}

// Inline, run-before-paint script string — set data-theme + theme-color so
// there is no white flash on first load. Injected into <head> via layout.
export const themeInitScript = `
(function(){
  try {
    var p = localStorage.getItem("${STORAGE_KEY}") || "system";
    var dark = p === "dark" || (p === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    var t = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", dark ? "#0D1020" : "#F5F7FC");
  } catch(e) {}
})();
`;
