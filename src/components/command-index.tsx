"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";

type Row = { command: string; slug: string; lesson: string };

export function CommandIndex({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q ? rows.filter((row) => row.command.toLowerCase().includes(q) || row.lesson.toLowerCase().includes(q)) : rows;

  return (
    <div className="mt-6">
      <label className="relative block">
        <span className="sr-only">Tìm lệnh</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ví dụ: chmod, tar, grep…"
          className="w-full rounded-lg border border-border bg-card py-2.5 pr-3 pl-9 outline-none focus:border-primary"
        />
      </label>
      <p className="mt-3 text-sm text-muted">{shown.length} lệnh</p>
      <ul className="panel mt-2 divide-y divide-border overflow-hidden">
        {shown.map((row) => (
          <li key={`${row.command}-${row.slug}`}>
            <Link href={`/bai/${row.slug}`} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-2.5 transition-colors hover:bg-subtle">
              <code className="font-mono font-semibold text-primary">{row.command}</code>
              <span className="text-sm text-muted">{row.lesson}</span>
            </Link>
          </li>
        ))}
        {shown.length === 0 && <li className="px-5 py-4 text-sm text-muted">Chưa có bài nào nói về lệnh này.</li>}
      </ul>
    </div>
  );
}
