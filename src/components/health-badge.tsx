"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";

interface HealthStatus {
  status: "ok";
  db: "up" | "down";
}

/** Hiện trạng thái backend và MongoDB, gọi qua proxy /api của Next.js. */
export function HealthBadge() {
  const { data, error, isLoading } = useSWR<HealthStatus>("/health", fetcher);

  let tone = "bg-subtle text-muted";
  let text = "Đang kiểm tra backend…";
  if (error) {
    tone = "bg-danger-soft text-danger";
    text = "Không gọi được backend (đã chạy backend ở cổng 4001 chưa?)";
  } else if (data && data.db === "up") {
    tone = "bg-success-soft text-success";
    text = "Backend chạy, MongoDB đã kết nối";
  } else if (data) {
    tone = "bg-warning-soft text-warning";
    text = "Backend chạy, nhưng MongoDB chưa kết nối";
  }

  return (
    <p
      role="status"
      aria-busy={isLoading}
      className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${tone}`}
    >
      {text}
    </p>
  );
}
