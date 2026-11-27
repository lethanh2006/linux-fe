import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PLAYLIST_URL } from "@/content/videos";

export const metadata: Metadata = { title: "Nguồn học" };

type Source = { name: string; url: string; lang: string; what: string; when: string };

const GROUPS: { title: string; note: string; sources: Source[] }[] = [
  {
    title: "Khung bài và video",
    note: "Phần 1 bám theo playlist TITV (video 5–34). Chuẩn LPIC-1 dùng để đối chiếu và soạn phần mở rộng.",
    sources: [
      {
        name: "Playlist “LPI1 – Tự học Linux cơ bản” (TITV)",
        url: PLAYLIST_URL,
        lang: "Tiếng Việt",
        what: "55 video từ cài đặt, lệnh cơ bản, phân quyền, mạng đến lập trình Bash.",
        when: "Xem video nhúng ở đầu mỗi bài phần 1 trước khi đọc.",
      },
      {
        name: "LPIC-1: các mục thi 101-500 và 102-500",
        url: "https://www.lpi.org/our-certifications/lpic-1-overview/",
        lang: "Tiếng Anh",
        what: "Danh sách chính thức những gì một quản trị viên Linux cấp 1 phải biết.",
        when: "Đối chiếu để biết mình còn thiếu mục nào.",
      },
    ],
  },
  {
    title: "Tài liệu đọc",
    note: "Đọc thêm khi muốn hiểu sâu một mục.",
    sources: [
      {
        name: "LPI Learning Materials — Linux Essentials (PDF)",
        url: "https://learning.lpi.org/pdfstore/LPI-Learning-Material-010-160-vi.pdf",
        lang: "Tiếng Việt",
        what: "Giáo trình chính thức của LPI cho người mới, có bài tập và đáp án.",
        when: "Chặng 1–4.",
      },
      {
        name: "LPI Learning Materials — LPIC-1 phần 101 (PDF)",
        url: "https://learning.lpi.org/pdfstore/LPI-Learning-Material-101-500-vi.pdf",
        lang: "Tiếng Việt",
        what: "Giáo trình theo từng mục thi 101: phần cứng, khởi động, gói, lệnh, filesystem.",
        when: "Đọc song song với bài có mã 101.x – 104.x.",
      },
      {
        name: "LPI Learning Materials — LPIC-1 phần 102",
        url: "https://learning.lpi.org/en/learning-materials/102-500/",
        lang: "Tiếng Anh",
        what: "Giáo trình mục thi 102: shell script, quản trị, mạng, bảo mật.",
        when: "Đọc song song với bài có mã 105.x – 110.x.",
      },
      {
        name: "The Linux Command Line (William Shotts)",
        url: "https://linuxcommand.org/tlcl.php",
        lang: "Tiếng Anh",
        what: "Sách miễn phí, rất dễ đọc về dòng lệnh và viết script.",
        when: "Khi muốn đọc liền mạch như một cuốn sách.",
      },
      {
        name: "Linux man pages (man7.org)",
        url: "https://man7.org/linux/man-pages/",
        lang: "Tiếng Anh",
        what: "Trang man của mọi lệnh, đọc trên trình duyệt.",
        when: "Tra cứu, giống gõ man trong terminal.",
      },
      {
        name: "Ubuntu Server documentation",
        url: "https://documentation.ubuntu.com/server/",
        lang: "Tiếng Anh",
        what: "Hướng dẫn chính thức để cấu hình dịch vụ trên Ubuntu Server.",
        when: "Chặng 5, 10, 11 và dự án cuối.",
      },
    ],
  },
  {
    title: "Thực hành thêm",
    note: "Làm sau khi xong một chặng để luyện tay.",
    sources: [
      {
        name: "Linux Upskill Challenge",
        url: "https://linuxupskillchallenge.org/",
        lang: "Tiếng Anh",
        what: "20 ngày, mỗi ngày một việc trên một máy chủ thật: SSH, cập nhật, log, tường lửa, web server.",
        when: "Sau chặng 5. Rất sát với công việc thật.",
      },
      {
        name: "OverTheWire: Bandit",
        url: "https://overthewire.org/wargames/bandit/",
        lang: "Tiếng Anh",
        what: "Trò chơi qua màn bằng lệnh Linux: tìm file, đọc file lạ, quyền, SSH.",
        when: "Sau chặng 3.",
      },
      {
        name: "SadServers",
        url: "https://sadservers.com/",
        lang: "Tiếng Anh",
        what: "Máy chủ đang lỗi thật, bạn phải tìm và sửa: đĩa đầy, dịch vụ chết, quyền sai.",
        when: "Sau chặng 7, để luyện xử lý sự cố.",
      },
      {
        name: "roadmap.sh — Linux",
        url: "https://roadmap.sh/linux",
        lang: "Tiếng Anh",
        what: "Sơ đồ các mục cần học và các dự án nhỏ (dựng server web, viết script giám sát…).",
        when: "Đối chiếu lộ trình, chọn dự án làm thêm.",
      },
      {
        name: "explainshell",
        url: "https://explainshell.com/",
        lang: "Tiếng Anh",
        what: "Dán một lệnh vào, trang tách từng phần và giải thích từ man page.",
        when: "Gặp lệnh lạ trên mạng, chưa hiểu từng phần.",
      },
    ],
  },
];

export default function SourcesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Nguồn học</h1>
      <p className="mt-2 text-muted">
        Nội dung trên web được tổng hợp từ các nguồn dưới đây. Mọi lệnh trong bài đều được chạy thử trên Ubuntu 24.04 trước khi đưa vào.
      </p>
      {GROUPS.map((group) => (
        <section key={group.title} className="mt-8">
          <h2 className="text-lg font-semibold">{group.title}</h2>
          <p className="text-sm text-muted">{group.note}</p>
          <ul className="mt-3 grid gap-3">
            {group.sources.map((source) => (
              <li key={source.url} className="panel p-4">
                <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                  {source.name}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
                <span className="ml-2 rounded-full bg-subtle px-2 py-0.5 text-xs text-muted">{source.lang}</span>
                <p className="mt-1.5 text-sm">{source.what}</p>
                <p className="mt-1 text-sm text-muted">Dùng khi: {source.when}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
