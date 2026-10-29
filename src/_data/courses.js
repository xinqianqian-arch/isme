import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
const markdown = new MarkdownIt({ html: false, linkify: true });
const root = "content/courses";
export default function () {
  return fs.readdirSync(root).filter(n => n.endsWith(".md") && !n.startsWith("_")).map(name => {
    const { data, content } = matter(fs.readFileSync(path.join(root,name), "utf8"));
    if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) throw new Error("Invalid course slug: " + name);
    if (![1,2,3,4,5,6].includes(data.grade) || ![1,2].includes(data.volume)) throw new Error("Invalid grade or volume: " + name);
    return { ...data, html: markdown.render(content) };
  }).filter(course => course.status === "published");
}
