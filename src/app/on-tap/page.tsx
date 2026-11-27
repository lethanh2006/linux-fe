import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckSquare, TerminalSquare } from "lucide-react";
import { DemoChecklist } from "@/components/demo-checklist";
import { Markdown } from "@/components/markdown";
import { getReviewGuides } from "@/lib/review";

export const metadata: Metadata = {
  title: "Ôn nhanh & demo Linux",
  description: "Ôn Linux từ chặng 1 đến hết chặng 7, bài 5–34: tóm tắt chi tiết, kịch bản demo 15–20 phút, câu hỏi vấn đáp và checklist để tập trình bày.",
};

const SECTIONS = [
  { href: "#lo-trinh-on", label: "Cách ôn trong 90 phút" },
  { href: "#tom-tat", label: "Tóm tắt chặng 1–7" },
  { href: "#kich-ban", label: "Kịch bản demo" },
  { href: "#cau-hoi", label: "Câu hỏi tập trả lời" },
  { href: "#san-sang", label: "Checklist trước buổi demo" },
];

export default function ReviewPage() {
  const guides = getReviewGuides();

  return (
    <div className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <aside>
        <nav aria-label="Trong mục ôn tập" className="lg:sticky lg:top-20">
          <Link href="/" className="text-sm text-muted hover:text-primary hover:underline">← Lộ trình học</Link>
          <p className="mt-5 text-sm font-semibold">Ôn tập & demo</p>
          <ul className="mt-2 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {SECTIONS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="block rounded-md border border-border px-3 py-2 text-sm text-muted hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:border-0">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main id="noi-dung-on-tap" className="min-w-0">
        <header>
          <p className="text-sm font-semibold text-primary">Chặng 1–7 · Linux bài 5–34</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Ôn nhanh để tự tin demo</h1>
          <p className="mt-3 max-w-3xl text-muted">
            Ôn từ Làm quen với Linux đến hết chặng Mạng. Nắm ý chính, chạy một kịch bản xuyên suốt rồi tập trả lời vì sao lệnh cho ra kết quả đó. Mỗi chặng có liên kết về bài học đầy đủ.
          </p>
          <a href="#kich-ban" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Vào kịch bản demo 15–20 phút <ArrowRight className="size-4" aria-hidden />
          </a>
        </header>

        <section id="lo-trinh-on" aria-labelledby="plan-title" className="mt-10 scroll-mt-20">
          <h2 id="plan-title" className="text-xl font-semibold">Gợi ý một lượt ôn 90 phút</h2>
          <p className="mt-2 text-sm text-muted">Dành thêm thời gian cho phần bạn chưa tự làm được. Đây là nhịp ôn gợi ý, không phải thời gian bắt buộc.</p>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: BookOpen, time: "25 phút", title: "Nắm ý chính", text: "Mở lần lượt 7 chặng tóm tắt. Với mỗi chặng, nói một câu nó giải quyết việc gì và chọn một lệnh minh hoạ." },
              { icon: TerminalSquare, time: "45 phút", title: "Tự gõ toàn bộ", text: "Chuẩn bị dữ liệu mới, chạy từng bước, đọc kết quả và tập câu giải thích ngay dưới bước đó." },
              { icon: CheckSquare, time: "20 phút", title: "Tập trình bày", text: "Chạy một lượt có bấm giờ, trả lời câu hỏi trước khi mở đáp án rồi đánh dấu checklist." },
            ].map((step) => (
              <li key={step.title} className="panel p-4">
                <step.icon className="size-5 text-primary" aria-hidden />
                <p className="mt-3 text-xs font-medium text-muted">{step.time}</p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="tom-tat" aria-labelledby="summary-title" className="mt-12 scroll-mt-20">
          <h2 id="summary-title" className="text-2xl font-bold">Tóm tắt chi tiết chặng 1–7</h2>
          <p className="mt-2 text-sm text-muted">7 chặng, 30 bài. Mở chặng cần ôn; điểm kết thúc là bài 34 của chặng Mạng.</p>
          <Markdown source={guides.summary} />
        </section>

        <section id="kich-ban" aria-labelledby="demo-title" className="mt-12 scroll-mt-20 border-t border-border pt-8">
          <p className="text-sm font-semibold text-primary">Thực hành trên đúng máy bạn sẽ trình bày</p>
          <h2 id="demo-title" className="mt-1 text-2xl font-bold">Kịch bản demo 15–20 phút</h2>
          <Markdown source={guides.demo} />
        </section>

        <section id="cau-hoi" aria-labelledby="questions-title" className="mt-12 scroll-mt-20 border-t border-border pt-8">
          <h2 id="questions-title" className="text-2xl font-bold">14 câu hỏi để tập trả lời</h2>
          <Markdown source={guides.questions} />
        </section>

        <div className="mt-12">
          <DemoChecklist />
        </div>
        <p className="mt-6 text-sm text-muted">
          Cần học kỹ hơn? <Link href="/#lam-quen" className="text-primary underline underline-offset-2">Quay lại khoá chính</Link> và mở đúng bài ở nhóm tóm tắt.
        </p>
      </main>
    </div>
  );
}
