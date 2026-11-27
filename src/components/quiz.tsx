"use client";

import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import type { QuizQuestion } from "@/lib/content";
import { useProgress } from "@/lib/progress";

export function Quiz({ slug, questions }: { slug: string; questions: QuizQuestion[] }) {
  const { bySlug, saveQuiz } = useProgress();
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const score = questions.reduce((sum, q, i) => sum + (picked[i] === q.answer ? 1 : 0), 0);
  const allAnswered = picked.every((p) => p !== null);
  const previous = bySlug.get(slug);

  async function submit() {
    setSubmitted(true);
    setSaveError(false);
    try {
      await saveQuiz(slug, score, questions.length);
    } catch {
      setSaveError(true);
    }
  }

  return (
    <section aria-labelledby="quiz-title" className="panel mt-10 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="quiz-title" className="text-xl font-semibold">
          Câu hỏi kiểm tra
        </h2>
        {previous?.quizTotal ? (
          <p className="text-sm text-muted">
            Lần trước: {previous.quizScore}/{previous.quizTotal} câu đúng
          </p>
        ) : null}
      </div>
      <p className="mt-1 text-sm text-muted">
        Chọn đáp án cho cả {questions.length} câu rồi bấm Nộp bài để xem giải thích.
      </p>

      <ol className="mt-5 flex flex-col gap-6">
        {questions.map((q, qi) => (
          <li key={qi}>
            <fieldset>
              <legend className="font-medium">
                {qi + 1}. <span dangerouslySetInnerHTML={{ __html: inlineCode(q.q) }} />
              </legend>
              <div className="mt-2 flex flex-col gap-2">
                {q.options.map((option, oi) => {
                  const chosen = picked[qi] === oi;
                  const correct = q.answer === oi;
                  let tone = "border-border hover:border-border-strong";
                  if (submitted && correct) tone = "border-success bg-success-soft";
                  else if (submitted && chosen) tone = "border-danger bg-danger-soft";
                  else if (chosen) tone = "border-primary bg-primary-soft";
                  return (
                    <label
                      key={oi}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${tone} ${submitted ? "cursor-default" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`q-${qi}`}
                        className="mt-0.5 accent-[var(--primary)]"
                        checked={chosen}
                        disabled={submitted}
                        onChange={() => setPicked((prev) => prev.map((p, i) => (i === qi ? oi : p)))}
                      />
                      <span className="flex-1" dangerouslySetInnerHTML={{ __html: inlineCode(option) }} />
                      {submitted && correct && <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Đáp án đúng" />}
                      {submitted && chosen && !correct && <XCircle className="size-4 shrink-0 text-danger" aria-label="Bạn chọn sai" />}
                    </label>
                  );
                })}
              </div>
              {submitted && (
                <p
                  className="mt-2 rounded-lg bg-subtle px-3 py-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: inlineCode(q.explain) }}
                />
              )}
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {submitted ? (
          <>
            <p role="status" className={`font-semibold ${score === questions.length ? "text-success" : ""}`}>
              Đúng {score}/{questions.length} câu
              {score === questions.length ? " — tuyệt vời!" : ""}
            </p>
            <button
              type="button"
              onClick={() => {
                setPicked(questions.map(() => null));
                setSubmitted(false);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-subtle"
            >
              <RotateCcw className="size-4" aria-hidden /> Làm lại
            </button>
            {saveError && <p className="text-sm text-warning">Chưa lưu được điểm (không gọi được backend).</p>}
          </>
        ) : (
          <button
            type="button"
            disabled={!allAnswered}
            onClick={submit}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Nộp bài
          </button>
        )}
      </div>
    </section>
  );
}

/** Đổi `lệnh` thành <code>lệnh</code>, các ký tự HTML khác được escape. */
function inlineCode(text: string) {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
}
