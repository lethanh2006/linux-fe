export const THEME_STORAGE_KEY = "hoc-linux:theme";

export const THEME_COLORS = {
  light: "#f7f8fa",
  dark: "#121720",
} as const;

// Chạy trong <head> để khôi phục lựa chọn trước khi nội dung được hiển thị.
export const THEME_INIT_SCRIPT = `
  try {
    var theme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = ${JSON.stringify(THEME_COLORS)}[theme];
  } catch {}
`;
