"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { useProgress } from "@/lib/progress";

/** Nút "Đánh dấu đã học" ở cuối bài. */
export function MarkDoneButton({ slug }: { slug: string }) {
  const { bySlug, setCompleted } = useProgress();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const done = Boolean(bySlug.get(slug)?.completedAt);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setFailed(false);
          try {
            await setCompleted(slug, !done);
          } catch {
            setFailed(true);
          } finally {
            setPending(false);
          }
        }}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
          done
            ? "border border-success bg-success-soft text-success"
            : "bg-primary text-primary-foreground hover:bg-primary-hover"
        }`}
      >
        {done ? <CheckCircle2 className="size-4" aria-hidden /> : <Circle className="size-4" aria-hidden />}
        {done ? "Đã học xong (bấm để bỏ)" : "Đánh dấu đã học"}
      </button>
      {failed && <p className="text-sm text-warning">Chưa lưu được (không gọi được backend).</p>}
    </div>
  );
}

/** Dấu tích nhỏ cạnh tên bài trong lộ trình. */
export function DoneMark({ slug }: { slug: string }) {
  const { bySlug } = useProgress();
  const done = Boolean(bySlug.get(slug)?.completedAt);
  if (!done) return null;
  return <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Đã học" />;
}

/** Thanh tiến độ tổng: số bài đã học trên số bài đã có nội dung. */
export function OverallProgress({ readySlugs, total }: { readySlugs: string[]; total: number }) {
  const { bySlug, code } = useProgress();
  const done = readySlugs.filter((slug) => bySlug.get(slug)?.completedAt).length;
  const percent = readySlugs.length ? Math.round((done / readySlugs.length) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">
          Đã học {done}/{readySlugs.length} bài
        </span>
        <span className="text-muted">
          {readySlugs.length < total ? `${total - readySlugs.length} bài đang viết` : "Đủ bài"}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ">
        <div className="h-full rounded-full bg-success transition-all" style={{ width: `${percent}%` }} />
      </div>
      {code && <p className="mt-2 text-xs text-muted">Mã học viên: <span className="font-mono">{code}</span></p>}
    </div>
  );
}
