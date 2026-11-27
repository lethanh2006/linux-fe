import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { THEME_COLORS, THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Font giao diện thiết kế cho tiếng Việt (dấu không bị chồng / lệch).
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

// Font đơn cách cho lệnh và kết quả terminal.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Học Linux — Lệnh, giải nghĩa và thực hành",
    template: "%s | Học Linux",
  },
  description:
    "Học Linux theo 30 video TITV bài 5–34: giải thích từng phần của lệnh, ví dụ, thực hành có đáp án và câu hỏi kiểm tra; kèm các bài mở rộng theo LPIC-1.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-theme="light"
      suppressHydrationWarning
      className={`${beVietnam.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content={THEME_COLORS.light} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        {children}
        <footer className="mt-auto border-t border-border py-6 text-center text-xs text-muted">
          Khung bài theo chuẩn LPIC-1 (101-500, 102-500) · Video: playlist “LPI1 – Tự học Linux cơ bản” của TITV
        </footer>
      </body>
    </html>
  );
}
