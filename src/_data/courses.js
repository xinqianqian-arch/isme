import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({ html: false, linkify: true });
const root = path.resolve("content/courses");

export default function () {
  if (!fs.existsSync(root)) return [];
  const seen = new Set();
  return fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.md$/i.test(entry.name)
      && !entry.name.startsWith("_") && !/^readme\.md$/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(({ name }) => {
      const { data, content } = matter(fs.readFileSync(path.join(root, name), "utf8"));
      // Drafts and documentation must never be validated or rendered as products.
      if (!data.status || data.status === "draft") return [];
      if (data.status !== "published") throw new Error("Invalid course status: " + name);
      if (typeof data.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
        throw new Error("Invalid course slug: " + name);
      }
      if (seen.has(data.slug)) throw new Error("Duplicate course slug: " + data.slug);
      seen.add(data.slug);
      if (![1,2,3,4,5,6].includes(data.grade) || ![1,2].includes(data.volume)) {
        throw new Error("Invalid grade or volume: " + name);
      }
      if (!["pep", "jj", "bsd"].includes(data.edition)) throw new Error("Invalid edition: " + name);
      if (!data.title || !data.description || !content.trim()) throw new Error("Incomplete published course: " + name);
      for (const field of ["shopUrl", "demoUrl", "cover"]) {
        if (data[field] && !/^https:\/\//.test(data[field]) && !/^\/(?!\/)/.test(data[field])) {
          throw new Error("Invalid " + field + " in " + name);
        }
      }
      return [{ ...data, html: markdown.render(content) }];
    });
}
