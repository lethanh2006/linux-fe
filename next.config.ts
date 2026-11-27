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
  // Trình duyệt gọi /api/* cùng origin với web, Next.js chuyển tiếp sang backend → không cần CORS.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_INTERNAL_URL}/:path*` },
    ];
  },
};

export default nextConfig;
