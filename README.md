# 十一课件 · 11aike.com

小红书数学老师「十一课件」的网站：品牌首页 + 北师大版 1–6 年级教材目录 + 教学文章 + 课件展厅。
用 [Astro](https://astro.build) 生成静态网页，由 Cloudflare Worker `11ai` 发布到 https://11aike.com （旧域名 11edu.cc 永久跳转过来）。

**想写内容、改内容，看 [写内容指南](写内容指南.md)。** 平时只需要改 `src/content/` 里的文件。

## 目录结构

```
├── 写内容指南.md                  写文章、课时讲解、单元补充、改教材目录的说明，附 AI 提示词
├── astro.config.mjs              Astro 配置（网址 11aike.com，输出到 dist/）
├── wrangler.jsonc                Cloudflare Worker「11ai」：发布 dist/
├── src/
│   ├── content/                  ✍️ 内容区
│   │   ├── articles/             教学文章，一篇一个 .md，文件名就是网址
│   │   ├── lessons/              课时讲解，一课一个 .md（文件名随意，开头写 年级/课题）
│   │   ├── units/                单元补充，一个单元一个 .md（开头写 年级/单元）
│   │   ├── textbooks/bsd/        北师大版教材目录，一册一个 .yaml
│   │   ├── works.yaml            课件作品：首页「1–6 年级课件」和课件展厅共用
│   │   └── about.md              关于我
│   ├── content.config.ts         内容格式规定（写错字段时构建会指出是哪个文件）
│   ├── site.config.ts            网站名称、网址、小红书主页、创作者信息
│   ├── pages/                    网址结构：文件位置 = 网址
│   │   ├── index.astro           首页
│   │   ├── textbooks/…           教材目录 → 年级 → 册 → 单元 → 课时
│   │   ├── articles/…            文章列表、文章页
│   │   ├── about.astro、courses.astro、404.astro
│   │   └── sitemap.xml.ts、llms.txt.ts、llms-full.txt.ts、ai-index.json.ts
│   ├── layouts/PageLayout.astro  内页骨架（<head>、导航、页脚）
│   ├── components/               导航、页脚、面包屑、页头卡片、引流卡片、各种卡片
│   │   └── home/                 首页各栏目：第一屏、教材栏目、作品栏目、底部横幅
│   ├── lib/                      教材目录与 Markdown 的对应、网站地图、结构化数据
│   └── styles/                   tokens.css（共用配色）、home.css（首页）、pages.css（内页）、topbar.css（导航）
├── public/                       原样发布：图片 assets/、天安门课件 aaa.html、_headers、robots.txt
├── scripts/verify-build.mjs      构建后检查（不通过就不发布）
├── materials/                    素材留档（小红书原始资料等），不发布
└── docs/cloudflare-deployment.md 发布与回退说明
```

## 网址

| 页面 | 网址 |
| --- | --- |
| 首页 | `/` |
| 教材目录 | `/textbooks/`、`/textbooks/bsd/` |
| 年级 / 册 | `/textbooks/bsd/grade-4/`、`/textbooks/bsd/grade-4/volume-1/` |
| 单元 / 课时 | `/textbooks/bsd/grade-4/volume-1/unit-04/`、`…/unit-04/lesson-02/` |
| 文章 | `/articles/`、`/articles/<文件名>/` |
| 其他 | `/about/`、`/courses/`、`/aaa`（天安门课件 demo） |
| 给搜索引擎和 AI | `/sitemap.xml`、`/robots.txt`、`/llms.txt`、`/llms-full.txt`、`/ai-index.json` |

单元、课时的编号来自教材目录文件里的先后顺序，调整顺序会改变网址。

## 本地预览和构建

需要 Node.js 22.22 以上。

```bash
npm ci
npm run dev      # 本地预览 http://localhost:4321 ，改文件自动刷新
npm run build    # 生成 dist/ 并运行构建检查
```

## 发布

推送到 `main` → Cloudflare 自动运行 `npm run build`，再用 `npx wrangler deploy` 发布 `dist/`，大约 1 分钟生效。
构建或检查失败时不会发布，线上保持上一个版本。详见 [Cloudflare 发布说明](docs/cloudflare-deployment.md)。

## 搜索引擎与 AI（SEO / GEO）

- `sitemap.xml`：允许收录的页面和更新日期。课时页写了 150 字以上的课时讲解才收录，其余标记 noindex。
- 每页都有标题、描述、规范网址、分享图；结构化数据包括网站、创作者（关联小红书主页）、面包屑、文章、单元问答。
- `llms.txt`、`llms-full.txt`、`ai-index.json`：给 AI 读的网站简介与教材目录，每次构建自动更新。
- `scripts/verify-build.mjs` 检查：网站地图里的页面都存在、没有 noindex、规范网址一致；不在网站地图里的页面必须是 noindex；私密资料和源码没有被发布。

不要把任何 token 写进代码、配置或工作流。
