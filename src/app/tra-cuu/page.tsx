import type { Metadata } from "next";
import { CommandIndex } from "@/components/command-index";
import { getEntries } from "@/lib/content";

export const metadata: Metadata = { title: "Tra cứu lệnh" };

export default function CommandsPage() {
  const rows = getEntries()
    .filter((entry) => entry.ready && entry.front)
    .flatMap((entry) =>
      entry.front!.commands.map((command) => ({
        command,
        slug: entry.slug,
        lesson: `${entry.label}. ${entry.title}`,
      })),
    )
    .sort((a, b) => a.command.localeCompare(b.command));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Tra cứu lệnh</h1>
      <p className="mt-2 text-muted">
        Gõ tên lệnh để biết nó được giải thích ở bài nào. Danh sách tự thêm khi có bài mới.
      </p>
      <CommandIndex rows={rows} />
    </main>
  );
}
