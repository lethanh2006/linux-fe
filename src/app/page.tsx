import Link from "next/link";
import { BookOpenCheck, Clapperboard, ListChecks, TerminalSquare } from "lucide-react";
import { ContinueLink } from "@/components/continue-link";
import { DoneMark, OverallProgress } from "@/components/lesson-done";
import { getEntries, getModules } from "@/lib/content";

const STEPS = [
  { icon: Clapperboard, title: "Xem video", text: "Mỗi bài ghi rõ video TITV tương ứng. Xem trước để nắm ý." },
  { icon: BookOpenCheck, title: "Đọc bài", text: "Đọc giải thích và bảng tách từng phần của lệnh." },
  { icon: TerminalSquare, title: "Gõ lại", text: "Mở terminal và gõ từng lệnh, so với kết quả mẫu." },
  { icon: ListChecks, title: "Làm bài", text: "Tự làm phần thực hành rồi mới mở đáp án. Cuối bài làm câu hỏi kiểm tra." },
];

export default function Home() {
  const modules = getModules();
  const entries = getEntries();
  const ready = entries.filter((entry) => entry.ready);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div>
          <p className="text-sm font-semibold text-primary">Lộ trình {entries.length} bài · 12 chặng</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">Học Linux bài bản, từ lệnh đầu tiên đến quản trị máy chủ</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Khung bài theo chuẩn LPIC-1, gồm đủ các mục thi 101 và 102, sắp lại theo thứ tự dễ học. Mỗi bài có giải thích bằng tiếng Việt, bảng tách từng phần của lệnh, kết quả chạy thật, bài thực hành có đáp án và câu hỏi kiểm tra.
          </p>
          <div className="mt-5">
            <ContinueLink lessons={ready.map(({ slug, title, number }) => ({ slug, title, number }))} />
          </div>
        </div>
        <div className="panel p-5">
          <OverallProgress readySlugs={ready.map((entry) => entry.slug)} total={entries.length} />
        </div>
      </section>

      <section aria-labelledby="how" className="mt-10">
        <h2 id="how" className="text-lg font-semibold">Cách học mỗi bài</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="panel flex gap-3 p-4">
              <step.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-medium">
                  {index + 1}. {step.title}
                </p>
                <p className="mt-1 text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="roadmap" className="mt-12">
        <h2 id="roadmap" className="text-lg font-semibold">Lộ trình</h2>
        <ol className="mt-4 flex flex-col gap-5">
          {modules.map((mod) => (
            <li key={mod.slug} id={mod.slug} className="panel overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <p className="text-xs font-semibold tracking-wide text-primary uppercase">Chặng {mod.index + 1}</p>
                <h3 className="mt-0.5 text-lg font-semibold">{mod.title}</h3>
                <p className="mt-1 text-sm text-muted">{mod.description}</p>
              </div>
              <ul className="divide-y divide-border">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.slug}>
                    {lesson.ready ? (
                      <Link href={`/bai/${lesson.slug}`} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-subtle">
                        <LessonRow lesson={lesson} />
                        <DoneMark slug={lesson.slug} />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-5 py-3 opacity-60">
                        <LessonRow lesson={lesson} />
                        <span className="shrink-0 rounded-full bg-subtle px-2 py-0.5 text-xs text-muted">Đang viết</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function LessonRow({ lesson }: { lesson: ReturnType<typeof getEntries>[number] }) {
  return (
    <>
      <span className="w-7 shrink-0 text-right font-mono text-sm text-muted">{lesson.number}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium group-hover:text-primary">{lesson.title}</span>
        <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
          <span>{lesson.objectives.map((o) => (o.startsWith("LE") ? o : `LPIC-1 ${o}`)).join(" · ")}</span>
          {lesson.videos.length > 0 && <span>Video TITV {lesson.videos.join(", ")}</span>}
          {lesson.front && <span>~{lesson.front.minutes} phút</span>}
          {lesson.lab === "vm" && <span>Cần máy ảo / VPS</span>}
        </span>
      </span>
    </>
  );
}
