import type { NextConfig } from "next";

/** URL backend NestJS mà server Next.js gọi tới (không lộ ra trình duyệt). */
const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? "http://localhost:4001/api";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
