"use client";

import { useMemo, useSyncExternalStore } from "react";

const ITEMS = [
  { id: "explain", text: "Tôi giải thích được kernel, shell, đường dẫn và từng phần của một lệnh." },
  { id: "files", text: "Tôi tự tạo, chép, đổi tên và tìm file trong thư mục demo." },
  { id: "pipeline", text: "Tôi lọc log và giải thích được pipeline cut → sort → uniq." },
  { id: "permissions", text: "Tôi đọc được quyền 640 và chứng minh hard link khác symlink." },
  { id: "restore", text: "Tôi đã tạo archive, khôi phục và so sánh được dữ liệu." },
  { id: "system", text: "Tôi đọc được RAM, filesystem, IP, route và phân giải tên." },
  { id: "speak", text: "Tôi đã tập nói câu trả lời trước khi mở đáp án các câu hỏi." },
  { id: "rehearsal", text: "Tôi đã chạy trọn kịch bản chặng 1–7 trên đúng máy sẽ demo, tự gõ và giải thích." },
] as const;

const STORAGE_KEY = "hoc-linux:demo-checklist:v1";
const CHANGE_EVENT = "hoc-linux:demo-checklist-change";
let memory: string | null = null;

function getSnapshot() {
  if (memory !== null) return memory;
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot() {
  return "[]";
}

function parseSelection(raw: string): Set<string> {
  try {
    const value: unknown = JSON.parse(raw);
    const valid = new Set<string>(ITEMS.map((item) => item.id));
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && valid.has(id)) : []);
  } catch {
    return new Set();
  }
}

function subscribe(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      memory = null;
      onChange();
    }
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function save(selected: Set<string>) {
  memory = JSON.stringify([...selected]);
  try {
    localStorage.setItem(STORAGE_KEY, memory);
  } catch {
    // Giữ checklist trong phiên hiện tại nếu trình duyệt chặn lưu trữ.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function DemoChecklist() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const selected = useMemo(() => parseSelection(raw), [raw]);

  return (
    <section id="san-sang" aria-labelledby="checklist-title" className="panel scroll-mt-20 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="checklist-title" className="text-xl font-semibold">Checklist trước buổi demo</h2>
          <p className="mt-1 text-sm text-muted">Chặng 1–7 · Tự đánh dấu sau khi làm được · Lưu trên trình duyệt này</p>
        </div>
        <button
          type="button"
          onClick={() => save(new Set())}
          disabled={selected.size === 0}
          className="rounded-md px-3 py-2 text-sm text-muted hover:bg-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Bỏ chọn tất cả
        </button>
      </div>
      <p role="status" className="mt-4 text-sm font-medium">
        Đã tự kiểm tra {selected.size}/{ITEMS.length} mục
      </p>
      <progress aria-label="Số mục đã tự kiểm tra" value={selected.size} max={ITEMS.length} className="mt-2 h-2 w-full accent-primary" />
      <fieldset className="mt-4 min-w-0">
        <legend className="sr-only">Các kỹ năng cần tự kiểm tra</legend>
        <ul className="divide-y divide-border">
          {ITEMS.map((item) => (
            <li key={item.id}>
              <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-md px-2 py-3 text-sm hover:bg-subtle">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={(event) => {
                    const next = parseSelection(getSnapshot());
                    if (event.currentTarget.checked) next.add(item.id);
                    else next.delete(item.id);
                    save(next);
                  }}
                  className="mt-0.5 size-4 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
                <span>{item.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      {selected.size === ITEMS.length && (
        <p className="mt-4 rounded-lg bg-success-soft p-3 text-sm text-success">
          Bạn đã đánh dấu đủ các mục. Hãy chạy thêm một lượt trọn vẹn và tập giải thích khi không nhìn hướng dẫn.
        </p>
      )}
    </section>
  );
}
