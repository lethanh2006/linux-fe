import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
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
    "Học Linux bài bản theo khung LPIC-1: 50 bài từ cơ bản đến quản trị, giải nghĩa từng phần của lệnh, thực hành có đáp án và câu hỏi kiểm tra.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#121720" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${geistMono.variable} h-full antialiased`}
    >
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
