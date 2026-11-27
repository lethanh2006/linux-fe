import { Terminal } from "lucide-react";
import { HealthBadge } from "@/components/health-badge";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-12">
      <header className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Terminal className="size-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Học Linux</h1>
          <p className="text-sm text-muted">Lệnh, giải nghĩa và thực hành</p>
        </div>
      </header>

      <section className="panel flex flex-col gap-4 p-6">
        <p>
          Khung web đã sẵn sàng. Các mục học, bảng giải nghĩa lệnh và bài thực
          hành sẽ được thêm ở các bước sau.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-terminal-bg p-4 font-mono text-sm text-terminal-fg">
          <span className="text-terminal-prompt">$</span> curl -s
          http://localhost:3001/api/health
        </pre>
        <HealthBadge />
      </section>
    </main>
  );
}
