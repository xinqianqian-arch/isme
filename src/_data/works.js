import fs from "node:fs";

/* 课件展厅复用首页作品区的数据（index.html 里的 LESSONS），首页改了这里自动跟着变 */
export default function () {
  const html = fs.readFileSync("index.html", "utf8");
  const re = /\{\s*g:\s*(\d)\s*,\s*img:\s*'([\w-]+)'\s*,\s*tint:\s*'\w'\s*,\s*title:\s*'([^']+)'\s*,\s*meta:\s*'([^']+)'/g;
  const works = [...html.matchAll(re)].map(m => ({ grade: Number(m[1]), img: m[2], title: m[3], meta: m[4] }));
  if (works.length < 12) throw new Error("首页作品数据读取失败（index.html 的 LESSONS 格式变了？）只读到 " + works.length + " 条");
  return works;
}
