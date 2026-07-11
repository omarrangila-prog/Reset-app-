"use client";

import { useEffect } from "react";

/** Records a lesson as read in localStorage so the Learn library shows progress. */
export function MarkLessonRead({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const read = JSON.parse(localStorage.getItem("lessons_read") || "{}");
      if (!read[slug]) {
        read[slug] = true;
        localStorage.setItem("lessons_read", JSON.stringify(read));
      }
    } catch {}
  }, [slug]);
  return null;
}
