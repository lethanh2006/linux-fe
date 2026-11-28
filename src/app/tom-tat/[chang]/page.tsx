import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ListChecks } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { getSummary, getSummaryModules } from "@/lib/review";

export function generateStaticParams() {
  return getSummaryModules().map((mod) => ({ chang: mod.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tom-tat/[chang]">): Promise<Metadata> {
  const { chang } = await params;
  const summary = getSummary(chang);
  if (!summary) return {};
  return {
    title: `Tóm tắt chặng ${summary.mod.index + 1}. ${summary.mod.title}`,
    description: `Ý chính và lệnh cần nhớ của ${summary.mod.lessons.length} bài trong chặng ${summary.mod.title}, kèm khối lệnh để tự thử.`,
  };
}

export default async function SummaryPage({ params }: PageProps<"/tom-tat/[chang]">) {
  const { chang } = await params;
  const summary = getSummary(chang);
  if (!summary) notFound();
  const { mod, body, headings, prev, next } = summary;
  const first = mod.lessons[0];
  const last = mod.lessons.at(-1);

  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_13rem]">
      <aside className="hidden lg:block">
        <nav aria-label={`Các bài trong chặng ${mod.title}`} className="sticky top-20">
          <Link href={`/#${mod.slug}`} className="text-xs font-semibold tracking-wide text-primary uppercase hover:underline">
            Chặng {mod.index + 1} · {mod.title}
          </Link>
          <ul className="mt-3 flex flex-col gap-0.5 text-sm">
            {mod.lessons.map((item) => (
              <li key={item.slug}>
                <Link href={`/bai/${item.slug}`} className="flex gap-2 rounded-md px-2 py-1.5 text-muted transition-colors hover:bg-subtle hover:text-foreground">
                  <span className="font-mono">{item.code}.</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
            <li>
              <span aria-current="page" className="flex gap-2 rounded-md bg-primary-soft px-2 py-1.5 font-medium text-primary">
                <ListChecks className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>Tóm tắt chặng</span>
              </span>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="min-w-0">
        <article>
          <header className="border-b border-border pb-6">
            <p className="text-sm text-muted">
              <Link href="/tom-tat" className="hover:text-primary hover:underline">Tóm tắt</Link>
              {first && last ? ` · Bài ${first.code}–${last.code}` : null}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Tóm tắt chặng {mod.index + 1}. {mod.title}
            </h1>
            <p className="mt-3 text-muted">
              Ý chính và lệnh cần nhớ của từng bài. Cuối trang có khối lệnh để chép vào terminal chạy thử. Bấm tên bài để mở bài đầy đủ.
            </p>
          </header>
          <Markdown source={body} />
        </article>

        <nav aria-label="Đi tiếp" className="mt-8 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2">
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
                <span className="block text-xs text-muted">Sang chặng sau</span>
                <span className="block truncate font-medium">{next.code}. {next.title}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted" aria-hidden />
            </Link>
          )}
        </nav>
      </main>

      <aside className="hidden xl:block">
        <nav aria-label="Mục lục tóm tắt" className="sticky top-20 text-sm">
          <p className="font-semibold">Trong trang này</p>
          <ul className="mt-2 flex flex-col gap-1 border-l border-border">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`} className="-ml-px block border-l border-transparent py-0.5 pl-3 text-muted hover:border-primary hover:text-foreground">
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
