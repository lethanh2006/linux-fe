import { CopyButton } from "./copy-button";

/**
 * Khối lệnh kiểu terminal.
 * - ```bash: mỗi dòng lệnh có dấu nhắc $; dòng bắt đầu bằng # là chú thích;
 *   dòng nối tiếp (dòng trước kết thúc bằng \) và nội dung heredoc không có dấu nhắc.
 * - ```text: kết quả in ra màn hình, không có dấu nhắc.
 * - Ngôn ngữ khác (ini, yaml, ...): nội dung file.
 */
export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const text = code.replace(/\n$/, "");
  const isShell = lang === "bash" || lang === "sh" || lang === "shell";
  const label = isShell ? "Lệnh" : lang === "text" ? "Kết quả" : `File · ${lang}`;

  return (
    <figure className={`code-block${lang === "text" ? " is-output" : ""}`}>
      <figcaption className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="text-xs font-medium tracking-wide text-terminal-fg/60">{label}</span>
        {lang !== "text" && <CopyButton text={isShell ? stripComments(text) : text} />}
      </figcaption>
      <pre className={lang === "text" ? "is-output" : undefined}>
        <code>{isShell ? <ShellLines text={text} /> : text}</code>
      </pre>
    </figure>
  );
}

/** Khi chép, bỏ các dòng chú thích để dán thẳng vào terminal. */
function stripComments(text: string) {
  return text
    .split("\n")
    .filter((line) => !/^\s*#/.test(line))
    .join("\n");
}

function ShellLines({ text }: { text: string }) {
  let continued = false;
  let heredoc: string | null = null;
  return text.split("\n").map((line, index) => {
    let kind: "comment" | "plain" | "command";
    if (heredoc !== null) {
      kind = "plain";
      if (line.trim() === heredoc) heredoc = null;
    } else if (continued) {
      kind = "plain";
    } else if (/^\s*#/.test(line)) {
      kind = "comment";
    } else if (line.trim() === "") {
      kind = "plain";
    } else {
      kind = "command";
    }
    const marker = heredoc === null ? /<<-?\s*['"]?(\w+)['"]?/.exec(line) : null;
    if (marker && kind !== "comment") heredoc = marker[1];
    continued = kind !== "comment" && line.endsWith("\\");

    return (
      <span key={index} className={`line line-${kind}`}>
        {kind === "command" && <span className="prompt" aria-hidden>$ </span>}
        {line}
        {"\n"}
      </span>
    );
  });
}
