"use client";

import { useEffect, useState } from "react";

/**
 * Theme-aware illustration. Swaps between the light and dark PNG variant based
 * on the resolved theme (data-theme on <html>). Names match
 * public/illustrations/{light,dark}/<name>.png.
 */
export type IllustrationName =
  | "journal" | "recovery" | "calm" | "insights" | "goals" | "achievements"
  | "empty-journal" | "empty-garden" | "orb-rings" | "crystal-shelf-full" | "particles-calm";

export function Illustration({ name, size = 160, alt = "", style }: { name: IllustrationName; size?: number; alt?: string; style?: React.CSSProperties }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const read = () => setDark(document.documentElement.getAttribute("data-theme") === "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const src = `/illustrations/${dark ? "dark" : "light"}/${name}.png`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={size} height={size} loading="lazy" decoding="async"
      style={{ width: size, height: size, objectFit: "contain", display: "block", ...style }} />
  );
}
