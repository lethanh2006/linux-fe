"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProgress } from "@/lib/progress";

/** Nút "Học tiếp": trỏ tới bài đầu tiên (đã có nội dung) chưa đánh dấu xong. */
export function ContinueLink({ lessons }: { lessons: { slug: string; title: string; label: string }[] }) {
  const { bySlug } = useProgress();
  const next = lessons.find((lesson) => !bySlug.get(lesson.slug)?.completedAt) ?? lessons[0];
  if (!next) return null;
  const started = bySlug.size > 0;
  return (
    <Link
      href={`/bai/${next.slug}`}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
    >
      {started ? `Học tiếp: ${next.label}` : `Bắt đầu từ ${next.label}`}
      <ArrowRight className="size-4" aria-hidden />
    </Link>
  );
}
