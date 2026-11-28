import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import { CURRICULUM, type LessonOutline, type ModuleOutline } from "@/content/curriculum";

const LESSON_DIR = path.join(process.cwd(), "content", "lessons");
/** Tóm tắt từng chặng: content/review/<slug-chặng>.md */
export const SUMMARY_DIR = path.join(process.cwd(), "content", "review");

export type QuizQuestion = {
  q: string;
  options: string[];
  /** Vị trí đáp án đúng trong options, tính từ 0. */
  answer: number;
  explain: string;
};

export type LessonFront = {
  summary: string;
  minutes: number;
  /** Các lệnh chính của bài, dùng cho trang tra cứu. */
  commands: string[];
  quiz: QuizQuestion[];
};

export type Heading = { id: string; text: string };

export type LessonEntry = LessonOutline & {
  module: Pick<ModuleOutline, "slug" | "title">;
  moduleIndex: number;
  /** Số thứ tự bài trên toàn lộ trình, bắt đầu từ 1. */
  number: number;
  part: 1 | 2;
  /** Mã ngắn hiện trong danh sách: số video TITV ở phần 1 ("5"), "MR1" ở phần 2. */
  code: string;
  /** Tên đầy đủ của mã: "Bài 5" hoặc "Mở rộng 1". */
  label: string;
  /** false khi bài chưa viết. */
  ready: boolean;
  front: LessonFront | null;
};

export type Lesson = LessonEntry & {
  front: LessonFront;
  body: string;
  headings: Heading[];
};

function readLessonFile(slug: string) {
  const file = path.join(LESSON_DIR, `${slug}.md`);
  if (!existsSync(file)) return null;
  const { data, content } = matter(readFileSync(file, "utf8"));
  return { front: data as LessonFront, body: content };
}

function buildEntries(): LessonEntry[] {
  let number = 0;
  let extra = 0;
  return CURRICULUM.flatMap((mod, moduleIndex) =>
    mod.lessons.map((outline) => {
      number += 1;
      if (mod.part === 2) extra += 1;
      const code = mod.part === 1 ? String(outline.videos[0]) : `MR${extra}`;
      const label = mod.part === 1 ? `Bài ${outline.videos[0]}` : `Mở rộng ${extra}`;
      const file = readLessonFile(outline.slug);
      return {
        ...outline,
        module: { slug: mod.slug, title: mod.title },
        moduleIndex,
        number,
        part: mod.part,
        code,
        label,
        ready: file !== null,
        front: file?.front ?? null,
      };
    }),
  );
}

// Ở production chỉ đọc ổ đĩa một lần; khi dev thì đọc lại mỗi lần để sửa bài thấy ngay.
let cached: LessonEntry[] | null = null;
export function getEntries(): LessonEntry[] {
  if (process.env.NODE_ENV !== "production") return buildEntries();
  cached ??= buildEntries();
  return cached;
}

export function getModules() {
  const entries = getEntries();
  return CURRICULUM.map((mod, index) => ({
    ...mod,
    index,
    lessons: entries.filter((entry) => entry.moduleIndex === index),
    /** Chặng này có trang tóm tắt hay không. */
    summary: existsSync(path.join(SUMMARY_DIR, `${mod.slug}.md`)),
  }));
}

/** Lấy tiêu đề cấp 2 (##) làm mục lục, id khớp với rehype-slug. */
export function extractHeadings(body: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = /^(#{2,3}) (.+)$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/`/g, "").trim();
    // Phải gọi slugger cho cả ### để id của ## không bị lệch khi trùng tên.
    const id = slugger.slug(text);
    if (match[1] === "##") headings.push({ id, text });
  }
  return headings;
}

export function getLesson(slug: string): Lesson | null {
  const entry = getEntries().find((item) => item.slug === slug);
  if (!entry) return null;
  const file = readLessonFile(slug);
  if (!file) return null;
  return { ...entry, front: file.front, body: file.body, headings: extractHeadings(file.body) };
}

export function getNeighbours(slug: string) {
  const ready = getEntries().filter((entry) => entry.ready);
  const index = ready.findIndex((entry) => entry.slug === slug);
  return {
    prev: index > 0 ? ready[index - 1] : null,
    next: index >= 0 && index < ready.length - 1 ? ready[index + 1] : null,
  };
}
