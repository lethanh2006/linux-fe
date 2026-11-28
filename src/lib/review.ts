import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SUMMARY_DIR, extractHeadings, getModules } from "@/lib/content";

/** Các chặng có trang tóm tắt, theo thứ tự lộ trình. */
export function getSummaryModules() {
  return getModules().filter((mod) => mod.summary);
}

export function getSummary(slug: string) {
  const modules = getModules();
  const mod = modules.find((item) => item.slug === slug && item.summary);
  if (!mod) return null;
  const body = readFileSync(path.join(SUMMARY_DIR, `${slug}.md`), "utf8");
  return {
    mod,
    body,
    headings: extractHeadings(body),
    /** Bài cuối của chặng này và bài đầu của chặng sau, để đi tiếp. */
    prev: mod.lessons.filter((lesson) => lesson.ready).at(-1) ?? null,
    next: modules[mod.index + 1]?.lessons.find((lesson) => lesson.ready) ?? null,
  };
}
