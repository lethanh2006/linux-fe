import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSummaryModules } from "@/lib/review";

export const metadata: Metadata = {
  title: "Tóm tắt từng chặng",
  description: "Tóm tắt ý chính và lệnh cần nhớ của từng chặng trong khoá chính (video TITV bài 5–34), kèm lệnh để tự chạy thử.",
};

export default function SummariesPage() {
  const modules = getSummaryModules();
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Tóm tắt từng chặng</h1>
      <p className="mt-2 text-muted">
        Học xong một chặng thì mở tóm tắt của chặng đó: đọc lại ý chính, bảng lệnh của từng bài, rồi chép khối lệnh cuối trang vào terminal để chạy thử.
      </p>
      <ol className="mt-8 flex flex-col gap-3">
        {modules.map((mod) => (
          <li key={mod.slug}>
            <Link href={`/tom-tat/${mod.slug}`} className="panel group flex items-center gap-4 p-5 transition-colors hover:border-border-strong">
              <span className="w-14 shrink-0 font-mono text-sm text-muted">Chặng {mod.index + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold group-hover:text-primary">{mod.title}</span>
                <span className="mt-0.5 block text-sm text-muted">
                  Bài {mod.lessons[0]?.code}–{mod.lessons.at(-1)?.code}: {mod.lessons.map((lesson) => lesson.title.split(":")[0]).join(", ")}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
