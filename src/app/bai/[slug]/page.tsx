import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, MonitorPlay, Server, TerminalSquare } from "lucide-react";
import { MarkDoneButton } from "@/components/lesson-done";
import { Markdown } from "@/components/markdown";
import { Quiz } from "@/components/quiz";
import { OBJECTIVES } from "@/content/curriculum";
import { VIDEOS, videoUrl } from "@/content/videos";
import { getEntries, getLesson, getModules, getNeighbours } from "@/lib/content";

export function generateStaticParams() {
  return getEntries()
    .filter((entry) => entry.ready)
    .map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/bai/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};
  return { title: `Bài ${lesson.number}. ${lesson.title}`, description: lesson.front.summary };
}

export default async function LessonPage({ params }: PageProps<"/bai/[slug]">) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const { prev, next } = getNeighbours(slug);
  const mod = getModules()[lesson.moduleIndex];

  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_13rem]">
      {/* Danh sách bài trong chặng */}
      <aside className="hidden lg:block">
        <nav aria-label={`Các bài trong chặng ${mod.title}`} className="sticky top-20">
          <Link href={`/#${mod.slug}`} className="text-xs font-semibold tracking-wide text-primary uppercase hover:underline">
            Chặng {mod.index + 1} · {mod.title}
          </Link>
          <ul className="mt-3 flex flex-col gap-0.5 text-sm">
            {mod.lessons.map((item) => (
              <li key={item.slug}>
                {item.ready ? (
                  <Link
                    href={`/bai/${item.slug}`}
                    aria-current={item.slug === slug ? "page" : undefined}
                    className="flex gap-2 rounded-md px-2 py-1.5 text-muted transition-colors hover:bg-subtle hover:text-foreground aria-[current=page]:bg-primary-soft aria-[current=page]:font-medium aria-[current=page]:text-primary"
                  >
                    <span className="font-mono">{item.number}.</span>
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <span className="flex gap-2 px-2 py-1.5 text-muted opacity-60">
                    <span className="font-mono">{item.number}.</span>
                    <span>{item.title} (đang viết)</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="min-w-0">
        <article>
          <header className="border-b border-border pb-6">
            <p className="text-sm text-muted">
              <Link href={`/#${mod.slug}`} className="hover:text-primary hover:underline">
                Chặng {mod.index + 1}: {mod.title}
              </Link>
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Bài {lesson.number}. {lesson.title}
            </h1>
            <p className="mt-3 text-muted">{lesson.front.summary}</p>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="sr-only">Thời gian</dt>
                <Clock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                <dd>Khoảng {lesson.front.minutes} phút đọc và làm</dd>
              </div>
              <div className="flex gap-2">
                <dt className="sr-only">Chỗ thực hành</dt>
                {lesson.lab === "docker" ? (
                  <TerminalSquare className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                ) : (
                  <Server className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                )}
                <dd>
                  {lesson.lab === "docker" ? (
                    <>
                      Thực hành trong container Ubuntu (<Link className="text-primary hover:underline" href="/bai/moi-truong-thuc-hanh">cách dựng</Link>)
                    </>
                  ) : (
                    "Cần máy ảo, WSL hoặc VPS (container không đủ)"
                  )}
                </dd>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <dt className="sr-only">Mục thi</dt>
                <span className="mt-0.5 shrink-0 rounded bg-subtle px-1.5 text-xs leading-5 font-semibold text-muted">LPI</span>
                <dd className="flex flex-col gap-0.5">
                  {lesson.objectives.map((code) => (
                    <span key={code}>
                      {code.startsWith("LE") ? `Linux Essentials ${code.slice(3)}` : `LPIC-1 ${code}`}: {OBJECTIVES[code]}
                    </span>
                  ))}
                </dd>
              </div>
              {lesson.videos.length > 0 && (
                <div className="flex gap-2 sm:col-span-2">
                  <dt className="sr-only">Video</dt>
                  <MonitorPlay className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                  <dd className="flex flex-col gap-0.5">
                    {lesson.videos.map((n) => (
                      <a key={n} href={videoUrl(n)} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        TITV bài {n}: {VIDEOS[n].title}
                      </a>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </header>

          <Markdown source={lesson.body} />
        </article>

        {lesson.front.quiz?.length > 0 && <Quiz slug={lesson.slug} questions={lesson.front.quiz} />}

        <div className="mt-8 flex flex-col gap-6 border-t border-border pt-6">
          <MarkDoneButton slug={lesson.slug} />
          <nav aria-label="Bài trước và bài sau" className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/bai/${prev.slug}`} className="panel flex items-center gap-3 p-4 transition-colors hover:border-border-strong">
                <ArrowLeft className="size-4 shrink-0 text-muted" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs text-muted">Bài trước</span>
                  <span className="block truncate font-medium">{prev.number}. {prev.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/bai/${next.slug}`} className="panel flex items-center justify-end gap-3 p-4 text-right transition-colors hover:border-border-strong">
                <span className="min-w-0">
                  <span className="block text-xs text-muted">Bài sau</span>
                  <span className="block truncate font-medium">{next.number}. {next.title}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden />
              </Link>
            )}
          </nav>
        </div>
      </main>

      {/* Mục lục trong bài */}
      <aside className="hidden xl:block">
        <nav aria-label="Mục lục bài" className="sticky top-20 text-sm">
          <p className="font-semibold">Trong bài này</p>
          <ul className="mt-2 flex flex-col gap-1 border-l border-border">
            {lesson.headings.map((heading) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-3 text-muted hover:border-primary hover:text-foreground">
                  {heading.text}
                </a>
              </li>
            ))}
            {lesson.front.quiz?.length > 0 && (
              <li>
                <a href="#quiz-title" className="-ml-px block border-l border-transparent py-0.5 pl-3 text-muted hover:border-primary hover:text-foreground">
                  Câu hỏi kiểm tra
                </a>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
