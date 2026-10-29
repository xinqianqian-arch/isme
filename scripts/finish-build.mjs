import fs from "node:fs";
import path from "node:path";

const BASE = "https://11edu.cc";
const CN = ["", "一", "二", "三", "四", "五", "六"];
const ROOT = path.resolve("dist");
const content = JSON.parse(fs.readFileSync("content/textbooks/bsd/catalog.json", "utf8"));
const books = content.books;
const encodeXml = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const listFiles = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
  const full = path.join(dir,entry.name);
  return entry.isDirectory() ? listFiles(full) : [full];
});
const pages = listFiles(ROOT).filter(f => path.basename(f) === "index.html");
if (pages.length < 95) throw new Error(`Too few generated pages: ${pages.length}; expected 12 books, 81 units, grade and lesson pages`);

const inSitemap = [];
const noindexPages = [];
const pageUrls = new Set();
for (const file of pages) {
  const relative = path.relative(ROOT,file).split(path.sep).join("/");
  const pathname = relative === "index.html" ? "/" : "/" + relative.slice(0,-"index.html".length);
  if (pageUrls.has(pathname)) throw new Error("Duplicate URL " + pathname);
  pageUrls.add(pathname);
  const html = fs.readFileSync(file,"utf8");
  const noindex = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
  if (!html.includes("<h1") && !html.includes("<H1")) throw new Error("Missing H1: "+pathname);
  if (!noindex && !html.includes('rel="canonical"')) throw new Error("Missing canonical: " + pathname);
  if (noindex) noindexPages.push(pathname);
  else inSitemap.push(pathname);
}
for (const b of books) {
  const p=`/textbooks/bsd/grade-${b.grade}/volume-${b.volume}/`;
  if (!pageUrls.has(p)) throw new Error("Missing textbook volume " + p);
  for (const u of b.units) {
    const up=p+u.id+"/";
    if (!pageUrls.has(up)) throw new Error("Missing unit " + up);
  }
}
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  inSitemap.sort((a,b)=>a.localeCompare(b)).map(p=>"  <url><loc>"+encodeXml(BASE+p)+"</loc></url>").join("\n") +
  "\n</urlset>\n";
fs.writeFileSync(path.join(ROOT,"sitemap.xml"),sitemap);

const ai = {
  schemaVersion: "1.0",
  name: "十一课件",
  url: BASE,
  language: "zh-CN",
  description: "北师大版小学数学教材导航与原创单元备课指南；原创互动课件在创作者小红书主页持续更新。",
  disclaimer: "独立原创教学参考网站，非北京师范大学出版社官方网站。教材章节以实际使用的教材版次为准。",
  primarySitemap: BASE+"/sitemap.xml",
  llms: BASE+"/llms.txt",
  catalogUpdated: content.version,
  catalog: books.map(b=>({
    edition:"北师大版",
    grade:b.grade,
    volume:b.volume,
    revision:b.revision,
    url:BASE+`/textbooks/bsd/grade-${b.grade}/volume-${b.volume}/`,
    units:b.units.map(u=>({title:u.title,url:BASE+`/textbooks/bsd/grade-${b.grade}/volume-${b.volume}/${u.id}/`,description:u.focus,commonMistake:u.pitfall,activity:u.activity}))
  }))
};
fs.writeFileSync(path.join(ROOT,"ai-index.json"),JSON.stringify(ai,null,2)+"\n");
const llms=[
"# 十一课件（11edu.cc）",
"",
"> 一个面向中国小学数学教师的原创互动课件品牌与教学参考站，提供北师大版1—6年级上下册教材导航、单元教学目标、易错提醒和课堂活动思路。",
"",
"网站语言：简体中文。本站并非教材出版社官方网站，教科书版次可能变化，请与实际使用的教材核对。",
"",
"## 主要入口",
"- [网站首页]("+BASE+"/)",
"- [北师大版课程目录]("+BASE+"/textbooks/bsd/)",
"- [原创课件展厅]("+BASE+"/courses/)",
"- [教学文章]("+BASE+"/articles/)",
"- [创作者介绍]("+BASE+"/about/)",
"- [完整站点地图]("+BASE+"/sitemap.xml)",
"- [结构化课程索引(JSON)]("+BASE+"/ai-index.json)",
"",
"## 教材导航",
...books.map(b=>`- [北师大版${CN[b.grade]}年级${b.volume===1?"上册":"下册"}（${b.revision}）](${BASE}/textbooks/bsd/grade-${b.grade}/volume-${b.volume}/)`),
"",
"## 内容与使用说明",
"- 网站提供原创单元知识梳理、常见错误分析和课堂活动建议。",
"- 原创互动课件的展示与获取方式，见创作者小红书主页。",
"- 本站允许依法合规地搜索、引用与链接公开的原创内容；请保留来源与原始 URL。",
"- 本文件旨在辅助发现公开内容，不构成任何搜索引擎或 AI 系统一定抓取、索引本站的保证。",
""
];
fs.writeFileSync(path.join(ROOT,"llms.txt"),llms.join("\n"));
const llmsFull=[
"# 十一课件 - 公开教学资源目录",
"",
"这是网站提供的机器可读内容摘要，不包含教材正文或付费资源。",
"",
...books.flatMap(b=>[
  `## 北师大版${CN[b.grade]}年级${b.volume===1?"上册":"下册"}（${b.revision}）`,
  `链接：${BASE}/textbooks/bsd/grade-${b.grade}/volume-${b.volume}/`,
  "",
  ...b.units.flatMap(u=>[
    `### ${u.title}`,
    `教学重点：${u.focus}`,
    `常见易错：${u.pitfall}`,
    `课堂活动：${u.activity}`,
    `链接：${BASE}/textbooks/bsd/grade-${b.grade}/volume-${b.volume}/${u.id}/`,
    ""
  ])
])
];
fs.writeFileSync(path.join(ROOT,"llms-full.txt"),llmsFull.join("\n"));
fs.writeFileSync("build-report.json",JSON.stringify({
  date:content.version,files:pages.length,indexable:inSitemap.length,excluded:noindexPages.length,
  volumes:books.length,units:books.reduce((a,b)=>a+b.units.length,0),
  lessons:books.reduce((a,b)=>a+b.units.reduce((s,u)=>s+u.lessons.length,0),0)
},null,2)+"\n");
console.log(`SEO build verified: ${pages.length} HTML pages, ${inSitemap.length} sitemap URLs, ${noindexPages.length} noindex pages`);
