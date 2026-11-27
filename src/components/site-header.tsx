import Link from "next/link";
import { Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { href: "/", label: "Lộ trình" },
  { href: "/tra-cuu", label: "Tra cứu lệnh" },
  { href: "/tien-do", label: "Tiến độ" },
  { href: "/nguon", label: "Nguồn học" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Terminal className="size-4" aria-hidden />
          </span>
          <span>Học Linux</span>
        </Link>
        <nav aria-label="Chính" className="-mx-2 flex min-w-0 gap-1 overflow-x-auto text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-2 py-1.5 text-muted transition-colors hover:bg-subtle hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
