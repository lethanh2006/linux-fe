import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, ListChecks, MonitorPlay } from "lucide-react";
import { MarkDoneButton } from "@/components/lesson-done";
import { Markdown } from "@/components/markdown";
import { Quiz } from "@/components/quiz";
import { OBJECTIVES } from "@/content/curriculum";
import { VIDEOS, videoEmbedUrl, videoUrl } from "@/content/videos";
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
  return { title: `${lesson.label}. ${lesson.title}`, description: lesson.front.summary };
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
                    <span className="font-mono">{item.code}.</span>
                    <span>{item.title}</span>
                  </Link>
                ) : (
                  <span className="flex gap-2 px-2 py-1.5 text-muted opacity-60">
                    <span className="font-mono">{item.code}.</span>
                    <span>{item.title} (đang viết)</span>
                  </span>
                )}
              </li>
            ))}
            {mod.summary && (
              <li>
                <Link href={`/tom-tat/${mod.slug}`} className="flex gap-2 rounded-md px-2 py-1.5 text-muted transition-colors hover:bg-subtle hover:text-foreground">
                  <ListChecks className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>Tóm tắt chặng</span>
                </Link>
              </li>
            )}
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
              {lesson.label}. {lesson.title}
            </h1>
            <p className="mt-3 text-muted">{lesson.front.summary}</p>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="sr-only">Thời gian</dt>
                <Clock className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
                <dd>Khoảng {lesson.front.minutes} phút đọc và làm</dd>
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

            {lesson.part === 1 && (
              <div className="mt-5 aspect-video overflow-hidden rounded-xl border border-border bg-subtle">
                <iframe
                  src={videoEmbedUrl(lesson.videos[0])}
                  title={`Video TITV bài ${lesson.videos[0]}: ${VIDEOS[lesson.videos[0]].title}`}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="size-full"
                />
              </div>
            )}
          </header>

          <Markdown source={lesson.body} />
        </article>

        {lesson.front.quiz?.length > 0 && <Quiz slug={lesson.slug} questions={lesson.front.quiz} />}

        <div className="mt-8 flex flex-col gap-6 border-t border-border pt-6">
          <MarkDoneButton slug={lesson.slug} />
          {mod.summary && mod.lessons.at(-1)?.slug === lesson.slug && (
            <Link href={`/tom-tat/${mod.slug}`} className="panel flex items-center gap-3 border-primary/40 bg-primary-soft p-4 transition-colors hover:border-primary">
              <ListChecks className="size-5 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-primary">Xong chặng {mod.index + 1}. Xem tóm tắt chặng</span>
                <span className="block text-sm text-muted">Ôn lại ý chính, bảng lệnh của cả chặng và chạy thử một khối lệnh.</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-primary" aria-hidden />
            </Link>
          )}
          <nav aria-label="Bài trước và bài sau" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/bai/${prev.slug}`} className="panel flex items-center gap-3 p-4 transition-colors hover:border-border-strong">
                <ArrowLeft className="size-4 shrink-0 text-muted" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs text-muted">Bài trước</span>
                  <span className="block truncate font-medium">{prev.code}. {prev.title}</span>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/bai/${next.slug}`} className="panel flex items-center justify-end gap-3 p-4 text-right transition-colors hover:border-border-strong">
                <span className="min-w-0">
                  <span className="block text-xs text-muted">Bài sau</span>
                  <span className="block truncate font-medium">{next.code}. {next.title}</span>
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
