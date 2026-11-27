// Kiểm tra nội dung bài học trước khi build:
// - frontmatter đọc được, có summary/minutes/commands/quiz đúng kiểu;
// - mỗi câu hỏi có ít nhất 2 lựa chọn, đáp án nằm trong khoảng;
// - link nội bộ /bai/<slug> trỏ tới bài có trong lộ trình;
// - mọi file trong content/lessons có trong lộ trình;
// - ba tài liệu ôn tập có link, bảng, khối code và details hợp lệ.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = path.resolve(import.meta.dirname, "..");
const curriculum = readFileSync(path.join(root, "src/content/curriculum.ts"), "utf8");
const slugs = new Set([...curriculum.matchAll(/\{ slug: "([a-z0-9-]+)", title:/g)].map((m) => m[1]));
const dir = path.join(root, "content/lessons");
const errors = [];

function validateMarkdown(content, where) {
  for (const m of content.matchAll(/\]\(\/bai\/([a-z0-9-]+)/g)) {
    if (!slugs.has(m[1])) errors.push(`${where}: link tới bài không tồn tại /bai/${m[1]}`);
  }
  const fences = (content.match(/^\s*```/gm) ?? []).length;
  if (fences % 2 !== 0) errors.push(`${where}: số dấu \`\`\` lẻ (khối code chưa đóng)`);
  // Bảng GFM: mọi dòng của một bảng phải có cùng số cột (dấu | trong ô phải viết \\| hoặc &#124;).
  let inFence = false;
  let cols = null;
  for (const [i, raw] of content.split("\n").entries()) {
    const line = raw.trim();
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence || !line.startsWith("|")) {
      cols = null;
      continue;
    }
    const n = line.replace(/\\\|/g, "").split("|").length;
    if (cols === null) cols = n;
    else if (n !== cols) errors.push(`${where}: dòng ${i + 1} của bảng có số cột khác dòng tiêu đề`);
  }
  const open = (content.match(/<details>/g) ?? []).length;
  const close = (content.match(/<\/details>/g) ?? []).length;
  if (open !== close) errors.push(`${where}: <details> mở ${open}, đóng ${close}`);
}

for (const file of readdirSync(dir).filter((f) => f.endsWith(".md"))) {
  const slug = file.replace(/\.md$/, "");
  const where = `content/lessons/${file}`;
  if (!slugs.has(slug)) errors.push(`${where}: không có trong curriculum.ts`);
  let parsed;
  try {
    parsed = matter(readFileSync(path.join(dir, file), "utf8"));
  } catch (err) {
    errors.push(`${where}: frontmatter lỗi: ${err.message}`);
    continue;
  }
  const { data, content } = parsed;
  if (typeof data.summary !== "string") errors.push(`${where}: thiếu summary`);
  if (typeof data.minutes !== "number") errors.push(`${where}: thiếu minutes`);
  if (!Array.isArray(data.commands)) errors.push(`${where}: thiếu commands`);
  if (!Array.isArray(data.quiz) || data.quiz.length === 0) errors.push(`${where}: thiếu quiz`);
  for (const [i, q] of (data.quiz ?? []).entries()) {
    const n = i + 1;
    if (typeof q.q !== "string") errors.push(`${where}: câu ${n} thiếu q`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${where}: câu ${n} thiếu options`);
    else if (!q.options.every((o) => typeof o === "string")) errors.push(`${where}: câu ${n} có option không phải chuỗi`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length ?? 0)) errors.push(`${where}: câu ${n} answer sai`);
    if (typeof q.explain !== "string") errors.push(`${where}: câu ${n} thiếu explain`);
  }
  validateMarkdown(content, where);
}

for (const file of ["summary.md", "demo.md", "questions.md"]) {
  const where = `content/review/${file}`;
  const fullPath = path.join(root, where);
  if (!existsSync(fullPath)) {
    errors.push(`${where}: thiếu tài liệu ôn tập`);
    continue;
  }
  validateMarkdown(readFileSync(fullPath, "utf8"), where);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Nội dung hợp lệ (${slugs.size} bài trong lộ trình, 3 tài liệu ôn tập).`);
