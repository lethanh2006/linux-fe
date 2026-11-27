import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

export function getReviewGuides() {
  const read = (name: string) => readFileSync(path.join(process.cwd(), "content", "review", `${name}.md`), "utf8");
  return { summary: read("summary"), demo: read("demo"), questions: read("questions") };
}
