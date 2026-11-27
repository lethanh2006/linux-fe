"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import useSWR from "swr";
import { api, ApiError } from "./api";
import { LEGACY_LESSONS, legacyProgressView, progressWriteBody, type LessonProgress } from "./progress-compat";

export type { LessonProgress } from "./progress-compat";

/**
 * Tiến độ học lưu ở backend theo "học viên ẩn danh":
 * lần đầu đánh dấu bài, backend tạo học viên và trả về id + mã ngắn.
 * id giữ trong localStorage của trình duyệt; mã ngắn dùng để khôi phục trên máy khác.
 */

const STORAGE_KEY = "hoc-linux:learner";
const CHANGE_EVENT = "hoc-linux:learner-change";

export type Learner = { id: string; code: string };

type ProgressResponse = {
  learner: { code: string; createdAt: string };
  lessons: LessonProgress[];
};

function readLearner(): Learner | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Learner) : null;
  } catch {
    return null;
  }
}

function writeLearner(learner: Learner | null) {
  if (learner) localStorage.setItem(STORAGE_KEY, JSON.stringify(learner));
  else localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

let snapshotRaw: string | null = null;
let snapshot: Learner | null = null;
function getSnapshot(): Learner | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    snapshot = readLearner();
  }
  return snapshot;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function useLearner() {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

function withLearner(id: string, init?: RequestInit & { json?: unknown }) {
  const headers = new Headers(init?.headers);
  headers.set("X-Learner-Id", id);
  return { ...init, headers };
}

async function ensureLearner(): Promise<Learner> {
  const existing = readLearner();
  if (existing) return existing;
  const created = await api<Learner>("/learners", { method: "POST" });
  writeLearner(created);
  return created;
}

export function useProgress() {
  const learner = useLearner();
  const { data, error, isLoading, mutate } = useSWR(
    learner ? ["/progress", learner.id] : null,
    async ([path, id]: [string, string]) => {
      try {
        return await api<ProgressResponse>(path, withLearner(id));
      } catch (err) {
        // Học viên không còn trên server (ví dụ database được làm mới): bỏ id cũ.
        if (err instanceof ApiError && err.status === 404) writeLearner(null);
        throw err;
      }
    },
  );

  const bySlug = useMemo(() => legacyProgressView(data?.lessons ?? []), [data]);
  const legacyHistory = useMemo(
    () => LEGACY_LESSONS.flatMap((legacy) => {
      const progress = bySlug.get(legacy.slug);
      return progress && (progress.completedAt || progress.quizTotal)
        ? [{ ...legacy, progress }]
        : [];
    }),
    [bySlug],
  );

  const update = useCallback(
    async (slug: string, body: Partial<Pick<LessonProgress, "quizScore" | "quizTotal">> & { completed?: boolean }) => {
      const current = await ensureLearner();
      const saved = await api<LessonProgress>(
        `/progress/${slug}`,
        withLearner(current.id, { method: "PUT", json: progressWriteBody(slug, body, bySlug) }),
      );
      await mutate(
        (prev) => {
          const lessons = (prev?.lessons ?? []).filter((item) => item.slug !== slug);
          return {
            learner: prev?.learner ?? { code: current.code, createdAt: new Date().toISOString() },
            lessons: [...lessons, saved],
          };
        },
        { revalidate: false },
      );
      return saved;
    },
    [mutate, bySlug],
  );

  const restore = useCallback(async (code: string) => {
    const found = await api<Learner>("/learners/restore", {
      method: "POST",
      json: { code: code.trim().toUpperCase() },
    });
    writeLearner(found);
    return found;
  }, []);

  const forget = useCallback(() => writeLearner(null), []);

  return {
    learner,
    code: data?.learner.code ?? learner?.code ?? null,
    bySlug,
    legacyHistory,
    isLoading: Boolean(learner) && isLoading,
    error: error as Error | undefined,
    setCompleted: (slug: string, completed: boolean) => update(slug, { completed }),
    saveQuiz: (slug: string, quizScore: number, quizTotal: number) => update(slug, { quizScore, quizTotal }),
    restore,
    forget,
  };
}
