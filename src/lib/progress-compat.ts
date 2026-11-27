export type LessonProgress = {
  slug: string;
  completedAt: string | null;
  quizScore: number | null;
  quizTotal: number | null;
};

type ProgressView = LessonProgress & { legacySource?: string };
type ProgressPatch = Partial<Pick<LessonProgress, "quizScore" | "quizTotal">> & { completed?: boolean };

// Bài gộp trước đây đã dạy cả các chủ đề nay được tách thành bài riêng.
// Chuyển trạng thái đã học; giữ điểm của bộ câu hỏi cũ ở lịch sử riêng.
export const LEGACY_LESSONS = [
  { slug: "linux-la-gi", title: "Linux là gì", replacements: ["cau-truc-he-dieu-hanh"] },
  { slug: "grep-va-regex", title: "Grep và biểu thức chính quy", replacements: ["lenh-grep", "bieu-thuc-chinh-quy"] },
  { slug: "tim-kiem-file", title: "Tìm file và tìm lệnh", replacements: ["lenh-find", "whereis-va-which"] },
  { slug: "tai-khoan-va-nhom", title: "Tài khoản và nhóm", replacements: ["quan-tri-nguoi-dung", "quan-tri-nhom"] },
  { slug: "moi-truong-thuc-hanh", title: "Chuẩn bị môi trường thực hành", replacements: [] },
] as const;

export function legacyProgressView(lessons: readonly LessonProgress[]) {
  const map = new Map<string, ProgressView>(lessons.map((item) => [item.slug, item]));
  for (const legacy of LEGACY_LESSONS) {
    const previous = map.get(legacy.slug);
    if (!previous?.completedAt) continue;
    for (const slug of legacy.replacements) {
      // Một bản ghi mới, kể cả đã bỏ đánh dấu, luôn có ưu tiên hơn lịch sử.
      if (map.has(slug)) continue;
      map.set(slug, {
        slug,
        completedAt: previous.completedAt,
        quizScore: null,
        quizTotal: null,
        legacySource: legacy.slug,
      });
    }
  }
  return map;
}

export function progressWriteBody(slug: string, body: ProgressPatch, view: ReadonlyMap<string, ProgressView>): ProgressPatch {
  // Khi nộp quiz mới lần đầu, ghi lại completion đã kế thừa cùng bản ghi mới.
  // Nếu người học chủ động bỏ đánh dấu, tôn trọng completed:false.
  if (view.get(slug)?.legacySource && body.completed === undefined) {
    return { ...body, completed: true };
  }
  return body;
}
