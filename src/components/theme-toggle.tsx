"use client";

import { Moon, Sun } from "lucide-react";
import { THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeToggle() {
  function toggleTheme() {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Vẫn đổi giao diện khi trình duyệt chặn lưu tùy chọn.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto sm:px-3"
    >
      <span className="theme-toggle-to-dark flex items-center gap-2">
        <Moon className="size-4" aria-hidden />
        <span className="sr-only sm:not-sr-only sm:text-sm">Chế độ tối</span>
      </span>
      <span className="theme-toggle-to-light items-center gap-2">
        <Sun className="size-4" aria-hidden />
        <span className="sr-only sm:not-sr-only sm:text-sm">Chế độ sáng</span>
      </span>
    </button>
  );
}
