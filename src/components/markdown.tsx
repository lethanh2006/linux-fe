import type { ReactElement, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

type CodeProps = { className?: string; children?: ReactNode };

/** Hiển thị nội dung bài học (Markdown + bảng GFM + thẻ <details> cho đáp án). */
export function Markdown({ source }: { source: string }) {
  return (
    <div className="lesson-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          pre({ children }) {
            const code = children as ReactElement<CodeProps>;
            const lang = /language-(\w+)/.exec(code.props.className ?? "")?.[1] ?? "text";
            return <CodeBlock code={String(code.props.children ?? "")} lang={lang} />;
          },
          table({ children }) {
            return (
              <div className="table-wrap">
                <table>{children}</table>
              </div>
            );
          },
          a({ href, children }) {
            const external = href?.startsWith("http");
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
