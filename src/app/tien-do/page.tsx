import type { Metadata } from "next";
import { ProgressBoard } from "@/components/progress-board";
import { getModules } from "@/lib/content";

export const metadata: Metadata = { title: "Tiến độ học" };

export default function ProgressPage() {
  const modules = getModules().map((mod) => ({
    slug: mod.slug,
    title: mod.title,
    index: mod.index,
    lessons: mod.lessons.map(({ slug, title, code, ready }) => ({ slug, title, code, ready })),
  }));
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Tiến độ học</h1>
      <p className="mt-2 text-muted">
        Tiến độ lưu trên máy chủ theo mã học viên, không cần tài khoản. Muốn học tiếp trên máy khác, chép mã này sang và bấm Khôi phục.
      </p>
      <ProgressBoard modules={modules} />
    </main>
  );
}
