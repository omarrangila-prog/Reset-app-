import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { MarkLessonRead } from "@/components/MarkLessonRead";
import { t } from "@/components/ui/theme";
import { BackButton } from "@/components/ui/BackButton";
import { LESSONS, getLesson } from "@/lib/lessons";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ slug: l.slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const idx = LESSONS.findIndex((l) => l.slug === slug);
  const next = LESSONS[idx + 1];

  return (
    <div style={{ minHeight: "100vh", maxWidth: 520, margin: "0 auto", padding: "20px 20px 120px", position: "relative", zIndex: 1 }}>
      <MarkLessonRead slug={slug} />
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <BackButton fallbackHref="/learn" />
        <div style={{ fontSize: 12, color: t.muted }}>{lesson.category} · {lesson.minutes} min read</div>
      </header>

      <article>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: t.text, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 20 }}>
          {lesson.title}
        </h1>
        {lesson.body.map((p, i) => (
          <p key={i} style={{ fontSize: 16, color: t.text, lineHeight: 1.7, marginBottom: 18 }}>{p}</p>
        ))}
      </article>

      <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${t.border}` }}>
        {next ? (
          <Link href={`/learn/${next.slug}`} style={{ display: "block" }}>
            <div style={{ background: t.accentSoft, border: `1px solid ${t.accent}22`, borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 11, color: t.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Next up</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{next.title} →</div>
            </div>
          </Link>
        ) : (
          <Link href="/learn" style={{ textAlign: "center", color: t.accent, fontSize: 14, fontWeight: 600, minHeight: 44, display: "inline-flex", width: "100%", alignItems: "center", justifyContent: "center" }}>
            You&apos;ve read them all — back to Learn
          </Link>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
