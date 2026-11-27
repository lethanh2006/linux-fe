"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { CopyButton } from "./copy-button";

type ModuleRow = {
  slug: string;
  title: string;
  index: number;
  lessons: { slug: string; title: string; code: string; ready: boolean }[];
};

export function ProgressBoard({ modules }: { modules: ModuleRow[] }) {
  const { learner, code, bySlug, legacyHistory, restore, forget, error } = useProgress();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const ready = modules.flatMap((mod) => mod.lessons.filter((lesson) => lesson.ready));
  const done = ready.filter((lesson) => bySlug.get(lesson.slug)?.completedAt).length;
  const quizzes = ready.filter((lesson) => bySlug.get(lesson.slug)?.quizTotal);

  return (
    <div className="mt-8 flex flex-col gap-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-semibold">Mã học viên của bạn</h2>
          {code ? (
            <div className="mt-3 flex items-center gap-3">
              <span className="rounded-lg bg-terminal-bg px-3 py-1.5 font-mono text-lg tracking-widest text-terminal-fg">{code}</span>
              <span className="rounded-lg bg-terminal-bg">
                <CopyButton text={code} />
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Chưa có. Mã được tạo tự động khi bạn đánh dấu bài học đầu tiên hoặc nộp câu hỏi kiểm tra.
            </p>
          )}
          {error && <p className="mt-2 text-sm text-warning">Không tải được tiến độ: {error.message}</p>}
          {learner && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Bỏ mã học viên khỏi trình duyệt này? Tiến độ vẫn còn trên máy chủ, nhập lại mã là khôi phục được.")) forget();
              }}
              className="mt-4 text-sm text-muted underline hover:text-foreground"
            >
              Bỏ mã khỏi trình duyệt này
            </button>
          )}
        </div>

        <form
          className="panel p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setStatus(null);
            try {
              const found = await restore(input);
              setStatus({ tone: "ok", text: `Đã khôi phục tiến độ của mã ${found.code}.` });
              setInput("");
            } catch (err) {
              setStatus({ tone: "error", text: err instanceof Error ? err.message : "Không khôi phục được" });
            }
          }}
        >
          <label htmlFor="restore-code" className="font-semibold">
            Khôi phục từ máy khác
          </label>
          <div className="mt-3 flex gap-2">
            <input
              id="restore-code"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="XXXX-XXXX"
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono tracking-widest uppercase outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={input.trim().length < 9}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
            >
              Khôi phục
            </button>
          </div>
          {status && (
            <p role="status" className={`mt-2 text-sm ${status.tone === "ok" ? "text-success" : "text-danger"}`}>
              {status.text}
            </p>
          )}
        </form>
      </section>

      <section className="panel grid grid-cols-3 divide-x divide-border text-center">
        <Stat label="Bài đã học" value={`${done}/${ready.length}`} />
        <Stat label="Bài đã làm kiểm tra" value={String(quizzes.length)} />
        <Stat
          label="Tỉ lệ đúng đã lưu"
          value={
            quizzes.length
              ? `${Math.round(
                  (quizzes.reduce((sum, l) => sum + (bySlug.get(l.slug)?.quizScore ?? 0), 0) /
                    quizzes.reduce((sum, l) => sum + (bySlug.get(l.slug)?.quizTotal ?? 0), 0)) *
                    100,
                )}%`
              : "—"
          }
        />
      </section>

      <p className="text-sm text-muted">
        Điểm là kết quả đã lưu theo mã bài. Khi câu hỏi được cập nhật, bạn có thể làm lại kiểm tra để có kết quả mới.
      </p>

      {legacyHistory.length > 0 && (
        <section className="panel p-5">
          <h2 className="font-semibold">Tiến độ của bài cũ</h2>
          <p className="mt-2 text-sm text-muted">
            Các bài đổi mã kế thừa đánh dấu đã học ở chủ đề tương ứng. Điểm kiểm tra của mã cũ giữ ở đây; câu hỏi của mã mới cần làm lại.
          </p>
          <ul className="mt-3 divide-y divide-border text-sm">
            {legacyHistory.map(({ slug, title, progress }) => (
              <li key={slug} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>{title}</span>
                <span className="text-xs text-muted">
                  {progress.completedAt ? "Đã học" : "Chưa đánh dấu"}
                  {progress.quizTotal ? ` · Kiểm tra cũ ${progress.quizScore ?? 0}/${progress.quizTotal}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {modules.map((mod) => (
        <section key={mod.slug} className="panel overflow-hidden">
          <h2 className="border-b border-border px-5 py-3 font-semibold">
            Chặng {mod.index + 1}. {mod.title}
          </h2>
          <ul className="divide-y divide-border text-sm">
            {mod.lessons.map((lesson) => {
              const row = bySlug.get(lesson.slug);
              return (
                <li key={lesson.slug} className="flex items-center gap-3 px-5 py-2.5">
                  {row?.completedAt ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Đã học" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-border-strong" aria-label="Chưa học" />
                  )}
                  <span className="min-w-0 flex-1">
                    {lesson.ready ? (
                      <Link href={`/bai/${lesson.slug}`} className="hover:text-primary hover:underline">
                        {lesson.code}. {lesson.title}
                      </Link>
                    ) : (
                      <span className="text-muted">
                        {lesson.code}. {lesson.title} (đang viết)
                      </span>
                    )}
                  </span>
                  {row?.quizTotal ? (
                    <span className={`shrink-0 text-xs font-medium ${row.quizScore === row.quizTotal ? "text-success" : "text-muted"}`}>
                      Đã lưu {row.quizScore}/{row.quizTotal}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
