import type { NextConfig } from "next";

/** URL backend NestJS mà server Next.js gọi tới (không lộ ra trình duyệt). */
const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? "http://localhost:4001/api";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Bài học đọc từ content/lessons/*.md: phải đóng gói thư mục này vào server khi deploy.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Bài cũ đã gộp hoặc đổi tên khi chuyển sang lộ trình bám video TITV 5–34.
  async redirects() {
    return [
      { source: "/bai/linux-la-gi", destination: "/bai/cau-truc-he-dieu-hanh", permanent: true },
      { source: "/bai/moi-truong-thuc-hanh", destination: "/", permanent: true },
      { source: "/bai/grep-va-regex", destination: "/bai/lenh-grep", permanent: true },
      { source: "/bai/tim-kiem-file", destination: "/bai/lenh-find", permanent: true },
      { source: "/bai/tai-khoan-va-nhom", destination: "/bai/quan-tri-nguoi-dung", permanent: true },
      { source: "/on-tap", destination: "/tom-tat", permanent: true },
    ];
  },
  // Trình duyệt gọi /api/* cùng origin với web, Next.js chuyển tiếp sang backend → không cần CORS.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_INTERNAL_URL}/:path*` },
    ];
  },
};

export default nextConfig;
